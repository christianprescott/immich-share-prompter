import { render } from 'svelte/server';
import type { Component } from 'svelte';
import postcss, { type Plugin } from 'postcss';
import cascadeLayers from '@csstools/postcss-cascade-layers';
import customProperties from 'postcss-custom-properties';
import { transform, Features } from 'lightningcss';
import juice from 'juice';

// `?inline` runs app.css through Vite's normal CSS pipeline (Tailwind +
// @immich/ui's theme, scanning @immich/ui/dist for the classes it uses),
// giving back the exact same compiled CSS the web app ships, instead of a
// hand-maintained copy for emails.
import appCss from '../../app.css?inline';

// Tailwind declares `--tw-*` defaults via `@property`, which email clients
// don't support and which resolving custom properties below has no use for
// (it only reads `@property`'s `initial-value` as a fallback, and Tailwind's
// own utilities never rely on that fallback). Drop it entirely.
const dropPropertyAtRules: Plugin = {
	postcssPlugin: 'drop-property-at-rules',
	OnceExit(root) {
		root.walkAtRules('property', (rule) => {
			rule.remove();
		});
	}
};

// Lightning CSS always emits a plain hex/rgb fallback *before* the original
// oklch()/oklab()/lch()/lab()/color-mix() value, for browsers that support
// wider color gamuts (this happens regardless of the configured `targets`,
// since it's about preserving color fidelity, not compatibility). Real
// browsers ignore a later declaration with an unparseable value and fall
// back to the earlier one, but Gmail's CSS sanitizer has been observed to
// drop the entire inline `style` attribute instead. Since the safe fallback
// always precedes it, simply removing the exotic declaration is sufficient.
const stripExoticColorFallbacks: Plugin = {
	postcssPlugin: 'strip-exotic-color-fallbacks',
	OnceExit(root) {
		root.walkDecls((decl) => {
			if (/\b(oklch|oklab|lch|lab|color-mix)\(/i.test(decl.value)) {
				decl.remove();
			}
		});
	}
};

// Interaction-only properties (transitions, cursor, focus outlines) are inert
// in email and, in Gmail's case, are also one more thing its CSS sanitizer
// might choke on — e.g. `transition-property`'s value list still contains
// Tailwind's `--tw-gradient-*` custom property names, which is exactly the
// kind of value Gmail has been observed to reject the entire `style`
// attribute over. Matched by prefix (rather than an exact-name list) so any
// vendor-prefixed variant (`-webkit-transition-property`, etc.) is caught
// too.
const dropInteractionOnlyProps: Plugin = {
	postcssPlugin: 'drop-interaction-only-props',
	OnceExit(root) {
		root.walkDecls(
			/^(-webkit-|-moz-|-ms-)?(transition|cursor|outline-offset|tap-highlight-color)/i,
			(decl) => {
				decl.remove();
			}
		);
	}
};

// Email-specific opinions that aren't a matter of CSS-level browser
// compatibility, so no general-purpose lowering tool covers them.
const emailQuirks: Plugin = {
	postcssPlugin: 'email-quirks',
	OnceExit(root) {
		root.walkDecls((decl) => {
			// Gmail doesn't reliably support `display: flex`, which is how
			// @immich/ui centers a button's icon/label. `inline-block` keeps the
			// button's box (background, padding, border-radius) intact; losing
			// the flex centering is an acceptable tradeoff for a working button.
			if (decl.prop === 'display' && /^(inline-)?flex$/.test(decl.value)) {
				decl.value = 'inline-block';
			}

			// Tailwind's "infinite radius" trick (used by shape="round") compiles
			// to a huge number in scientific notation, or to `calc(infinity *
			// 1px)`, neither of which email sanitizers like Gmail's parse. A
			// plain large pixel value achieves the same visual "pill" shape and
			// is universally supported.
			if (decl.prop.includes('radius')) {
				decl.value = decl.value.replace(
					/calc\(infinity\s*\*\s*1px\)|[\d.]+e[+-]?\d+px/gi,
					'9999px'
				);
			}

			// Tailwind expresses spacing in `rem`, which is unreliable in the
			// inline `style` attributes email clients actually render.
			decl.value = decl.value.replace(/([\d.]+)rem/g, (_, n) => `${parseFloat(n) * 16}px`);
		});
	}
};

const emailSafeCss = (async () => {
	// 1. Flatten Tailwind's `@layer`/`@property` wrappers, then resolve every
	// `var()` reference to its literal value. @immich/ui's utilities
	// reference colors indirectly (e.g. `bg-primary` compiles to
	// `background-color: var(--immich-ui-primary-500)`), and both the
	// `:root` block that defines the variable and the variable itself are
	// lost once styles are inlined onto individual elements and the
	// `<style>` tag is removed.
	const { css: resolved } = await postcss([
		// Tailwind hides its utilities inside `@layer` blocks, which CSS
		// inliners like `juice` (below) don't look inside. Flatten them,
		// preserving the cascade's actual precedence rules (later layers win
		// regardless of selector specificity or source order) via generated
		// specificity padding, rather than naively reordering by source
		// position.
		cascadeLayers(),
		// TODO: seems unnecessary. Email renders without this. Keeping for now to confirm later.
		// dropPropertyAtRules,
		customProperties({ preserve: false })
	]).process(appCss, { from: undefined });

	// 2. Lower everything email clients can't parse: oklch()/oklab()/lch()/
	// lab() and color-mix() to plain colors, and logical properties
	// (padding-inline, etc.) to their physical equivalents. Targeting a
	// recent browser (rather than an ancient one) means these two lowerings,
	// forced on via `include`, are the *only* thing that changes — an old
	// target would additionally rewrite modern flexbox/box-sizing/etc. into
	// vendor-prefixed legacy syntax (e.g. `display: -webkit-box`), which is
	// unnecessary noise at best and, for `transition-property` specifically,
	// actively dangerous: Lightning CSS also prefixes it to
	// `-webkit-transition-property`, which slips past a same-named exclusion
	// list further down the pipeline.
	const { code } = transform({
		filename: 'email.css',
		code: new TextEncoder().encode(resolved),
		minify: false,
		targets: { chrome: 90 << 16 },
		include: Features.Colors | Features.LogicalProperties,
		exclude: Features.VendorPrefixes
	});

	// 3. Strip the exotic-color fallback pairs Lightning CSS leaves behind,
	// drop interaction-only properties, then apply the handful of
	// email-only opinions no general-purpose CSS tool has a notion of.
	const { css } = await postcss([
		stripExoticColorFallbacks,
		dropInteractionOnlyProps,
		emailQuirks
	]).process(new TextDecoder().decode(code), { from: undefined });

	return css;
})();

/**
 * Renders a Svelte component to a standalone HTML email, reusing the exact
 * components and compiled CSS from the rest of the app, then inlines the
 * resulting styles onto each element (with `juice`) since most email
 * clients ignore `<style>` blocks, especially large ones like this one.
 */
export async function renderEmail<Props extends Record<string, any>>(
	component: Component<Props>,
	props: Props
): Promise<string> {
	const { head, body } = render(component, { props });
	const css = await emailSafeCss;

	const html = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<style>${css}</style>
		${head}
	</head>
	<body class="bg-light text-dark" style="margin: 0; padding: 24px;">
		${body}
	</body>
</html>`;

	return juice(html, {
		removeStyleTags: true,
		preserveMediaQueries: false,
		preserveFontFaces: false,
		preserveKeyFrames: false,
		preservePseudos: false
	});
}

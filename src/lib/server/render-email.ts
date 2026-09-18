import { render } from 'svelte/server';
import type { Component } from 'svelte';
import postcss from 'postcss';
import type { Plugin } from 'postcss';
import oklabFunction from '@csstools/postcss-oklab-function';
import colorMixFunction from '@csstools/postcss-color-mix-function';
import juice from 'juice';

// `?inline` runs app.css through Vite's normal CSS pipeline (Tailwind +
// @immich/ui's theme, scanning @immich/ui/dist for the classes it uses),
// giving back the exact same compiled CSS the web app ships, instead of a
// hand-maintained copy for emails.
import appCss from '../../app.css?inline';

// Tailwind wraps every utility rule in `@layer` blocks, which CSS inliners
// (like `juice`, below) don't look inside. Since we're about to inline
// everything anyway, layer ordering no longer matters, so unwrap them.
const unwrapLayers: Plugin = {
	postcssPlugin: 'unwrap-layers',
	OnceExit(root) {
		root.walkAtRules('layer', (rule) => {
			rule.replaceWith(rule.nodes);
		});
	}
};

// `@csstools/postcss-oklab-function` can't flatten a color that has a `none`
// ("unspecified") channel, like the `oklch(26.9% 0 none)` Tailwind's preflight
// reset uses for `border-color`, and leaves it untouched. Treating `none` as
// `0` lets it flatten fully instead of leaking an unsupported raw function
// into the inlined output.
const replaceNoneChannel: Plugin = {
	postcssPlugin: 'replace-none-channel',
	OnceExit(root) {
		root.walkDecls(/(^--|color)/i, (decl) => {
			if (/\b(oklch|oklab|lch|lab)\(/i.test(decl.value)) {
				decl.value = decl.value.replace(
					/(oklch|oklab|lch|lab)\(([^)]*)\)/gi,
					(_, fn, args) => `${fn}(${args.replace(/\bnone\b/gi, '0')})`
				);
			}
		});
	}
};

// Tailwind's "infinite radius" trick (used by shape="round") compiles to
// `3.40282e38px` (or `calc(infinity * 1px)`), which email sanitizers like
// Gmail's don't parse. A plain large pixel value achieves the same visual
// "pill" shape and is universally supported.
const fixInfiniteRadius: Plugin = {
	postcssPlugin: 'fix-infinite-radius',
	OnceExit(root) {
		root.walkDecls(/radius/i, (decl) => {
			decl.value = decl.value.replace(/calc\(infinity\s*\*\s*1px\)|[\d.]+e[+-]?\d+px/gi, '9999px');
		});
	}
};

// Email clients don't support CSS logical properties (`padding-inline`,
// `padding-block`, etc), only their physical equivalents.
const logicalToPhysical: Plugin = {
	postcssPlugin: 'logical-to-physical',
	OnceExit(root) {
		root.walkDecls(/^padding-inline$/, (decl) => {
			decl.cloneBefore({ prop: 'padding-left', value: decl.value });
			decl.prop = 'padding-right';
		});
		root.walkDecls(/^padding-block$/, (decl) => {
			decl.cloneBefore({ prop: 'padding-top', value: decl.value });
			decl.prop = 'padding-bottom';
		});
	}
};

// Gmail doesn't reliably support `display: flex`, which is how @immich/ui
// centers a button's icon/label. `inline-block` keeps the button's box
// (background, padding, border-radius) intact; losing the flex centering
// is an acceptable tradeoff for a working button.
const flexToInlineBlock: Plugin = {
	postcssPlugin: 'flex-to-inline-block',
	OnceExit(root) {
		root.walkDecls('display', (decl) => {
			if (decl.value === 'flex' || decl.value === 'inline-flex') {
				decl.value = 'inline-block';
			}
		});
	}
};

// Tailwind expresses all spacing as `calc(var(--spacing) * N)` in `rem`
// units. Email clients are inconsistent about supporting `calc()`, CSS
// variables, and `rem` in inline styles, so evaluate these down to plain
// `px` numbers wherever possible.
const simplifyCalc: Plugin = {
	postcssPlugin: 'simplify-calc',
	OnceExit(root) {
		root.walkDecls((decl) => {
			if (!/calc\(|rem|--spacing/.test(decl.value)) return;
			let value = decl.value.replace(/var\(--spacing\)/g, '.25rem');
			value = value.replace(/([\d.]+)rem/g, (_, n) => `${parseFloat(n) * 16}px`);
			value = value.replace(/calc\(([^()]+)\)/g, (match, expr) => {
				const m = expr.match(/^\s*([\d.]+)(px)?\s*([*/])\s*([\d.]+)(px)?\s*$/);
				if (!m) return match;
				const [, a, unitA, op, b, unitB] = m;
				const unit = unitA || unitB || '';
				const result = op === '*' ? parseFloat(a) * parseFloat(b) : parseFloat(a) / parseFloat(b);
				return `${Math.round(result * 1000) / 1000}${unit}`;
			});
			decl.value = value;
		});
	}
};

// Interaction-only properties (transitions, cursor, focus outlines) are
// inert in email and, in Gmail's case, are also one more thing its CSS
// sanitizer might choke on (e.g. custom property names inside
// `transition-property`'s value list) and reject the whole `style`
// attribute over. They're dropped rather than risk that.
const dropInteractionOnlyProps: Plugin = {
	postcssPlugin: 'drop-interaction-only-props',
	OnceExit(root) {
		root.walkDecls(/^(transition|cursor|outline-offset|-webkit-tap-highlight-color)/, (decl) => {
			decl.remove();
		});
	}
};

// Email clients (Gmail in particular) don't reliably support class-based
// stylesheets, `oklch()`/`color-mix()` colors, `@layer`, logical
// properties, `calc()`/`rem`, or `display: flex`. All are fixed once here,
// rather than per-render.
const emailSafeCss = postcss([
	replaceNoneChannel,
	oklabFunction(),
	colorMixFunction(),
	unwrapLayers,
	fixInfiniteRadius,
	logicalToPhysical,
	flexToInlineBlock,
	simplifyCalc,
	dropInteractionOnlyProps
])
	.process(appCss, { from: undefined })
	.then((result) => result.css);

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
<html lang="en" class="dark">
	<head>
		<meta charset="utf-8" />
		<style>${css}</style>
		${head}
	</head>
	<body class="bg-light text-dark" style="margin: 0; padding: 24px;">
		${body}
	</body>
</html>`;

	const inlined = juice(html, {
		removeStyleTags: true,
		preserveMediaQueries: false,
		preserveFontFaces: false,
		preserveKeyFrames: false,
		preservePseudos: false
	});

	// Belt-and-suspenders: whatever the source (some values survive the CSS-
	// level flattening above through indirection we don't fully control, e.g.
	// inherited/cascaded values juice itself resolves), make sure no exotic
	// color function ever reaches the final HTML. `currentColor` is always
	// valid and, for the handful of leftover cases (mostly invisible
	// zero-width borders), visually inconsequential.
	return inlined.replace(/\b(oklch|oklab|lch|lab|color-mix)\([^)]*\)/gi, 'currentColor');
}

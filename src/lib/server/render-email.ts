import { render } from 'svelte/server';
import type { Component } from 'svelte';
import postcss, { type Plugin } from 'postcss';
import cascadeLayers from '@csstools/postcss-cascade-layers';
import customProperties from 'postcss-custom-properties';
import { transform, Features } from 'lightningcss';
import juice from 'juice';
import absolutify from 'absolutify';

// `?inline` runs app.css through vite CSS pipeline
import appCss from '../../app.css?inline';

// lightningcss emits a plain hex/rgb fallback *before* the original
// oklch()/oklab()/lch()/lab()/color-mix() value - good for browsers, bad for
// email clients that drop unsupported styles. Remove them.
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

const stripInteractionOnlyProps: Plugin = {
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

// Email clients don't reliably support `display: flex`
const replaceFlexWithBlock: Plugin = {
	postcssPlugin: 'email-quirks',
	OnceExit(root) {
		root.walkDecls((decl) => {
			if (decl.prop === 'display' && /^(inline-)?flex$/.test(decl.value)) {
				decl.value = 'inline-block';
			}
		});
	}
};

const emailSafeCss = (async () => {
	const { css: resolved } = await postcss([
		// Flatten tailwind `@layer` blocks
		cascadeLayers(),
		customProperties({ preserve: false })
	]).process(appCss, { from: undefined });

	// Transform css to a lower common denominator for email clients
	const { code } = transform({
		filename: 'email.css',
		code: new TextEncoder().encode(resolved),
		minify: false,
		targets: { chrome: 90 << 16 },
		include: Features.Colors | Features.LogicalProperties,
		exclude: Features.VendorPrefixes
	});

	const { css } = await postcss([
		stripExoticColorFallbacks,
		stripInteractionOnlyProps,
		replaceFlexWithBlock
	]).process(new TextDecoder().decode(code), { from: undefined });

	return css;
})();

/**
 * Renders a Svelte component to a standalone HTML email, making an effort to
 * reuse the components and compiled CSS from the rest of the app. Inlines the
 * resulting styles onto each element.
 */
export async function renderEmail<Props extends Record<string, any>>(
	appHost: string,
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

	// transform relative paths to absolute ones for links and imgs
	const absolute = absolutify(html, appHost.replace(/\/+$/, ''));

	return juice(absolute, {
		removeStyleTags: true,
		preserveMediaQueries: false,
		preserveFontFaces: false,
		preserveKeyFrames: false,
		preservePseudos: false
	});
}

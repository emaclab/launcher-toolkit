// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// The site is served by GitHub Pages under the repository path, so every absolute link needs the
// /launcher-toolkit/ base. .github/workflows/pages.yml builds and deploys it.
export default defineConfig({
	site: 'https://emaclab.github.io',
	base: '/launcher-toolkit/',
	integrations: [
		starlight({
			title: 'Launcher Toolkit',
			// src/pages/404.astro owns this route without a duplicate docs collection entry.
			disable404Route: true,
			description:
				'Guides and examples for creating, previewing, checking and building launcher packs with the toolkit and pack template.',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/emaclab/launcher-toolkit',
				},
			],
			editLink: {
				baseUrl: 'https://github.com/emaclab/launcher-toolkit/edit/main/',
			},
			// One group per folder in src/content/docs/. Pages set their position with the
			// `sidebar.order` frontmatter field.
			sidebar: [
				{ label: 'Getting started', items: [{ autogenerate: { directory: 'getting-started' } }] },
				{ label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
				{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
				{ label: 'Widgets', items: [{ autogenerate: { directory: 'widgets' } }] },
				{ label: 'Examples', items: [{ autogenerate: { directory: 'examples' } }] },
			],
		}),
	],
});

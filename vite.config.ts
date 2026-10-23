import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter({ fallback: '404.html' }),
			paths: {
				base: process.argv.includes('dev')
					? ''
					: (process.env.BASE_PATH as `/${string}` | undefined)
			},
			preprocess: vitePreprocess()
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				// Pre-bundle up front: a mid-run re-optimise reloads the page and loads Svelte twice
				optimizeDeps: {
					include: ['@lucide/svelte', '@skeletonlabs/skeleton-svelte']
				},
				test: {
					browser: {
						enabled: true,
						instances: [{ browser: 'chromium' }],
						provider: playwright()
					},
					exclude: ['src/lib/server/**'],
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					name: 'client',
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					environment: 'node',
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					include: ['src/**/*.{test,spec}.{js,ts}'],
					name: 'server'
				}
			}
		]
	}
});

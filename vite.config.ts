import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					browser: {
						enabled: true,
						instances: [{ browser: 'chromium' }],
						provider: 'playwright'
					},
					environment: 'browser',
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

import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

const unitConfig = defineConfig({
	test: {
		environment: 'happy-dom',
		globals: true,
		include: ['src/**/*.{test,spec}.ts', 'tests/unit/**/*.{test,spec}.ts']
	}
});

const browserConfig = defineConfig({
	test: {
		browser: {
			enabled: true,
			headless: false,
			instances: [
				{
					browser: 'chromium'
				}
			],
			provider: playwright()
		},
		globals: true,
		include: ['tests/browser/**/*.{test,spec}.ts']
	}
});

export default mergeConfig(viteConfig, process.env.VITEST_BROWSER ? browserConfig : unitConfig);

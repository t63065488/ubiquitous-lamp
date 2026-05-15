import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

const testConfig = defineConfig({
	test: {
		projects: [
			{
				extends: true,
				test: {
					environment: 'happy-dom',
					globals: true,
					include: ['src/**/*.{test,spec}.ts', 'tests/unit/**/*.{test,spec}.ts'],
					name: 'unit'
				}
			},
			{
				extends: true,
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
					include: ['tests/browser/**/*.{test,spec}.ts'],
					name: 'browser'
				}
			}
		]
	}
});

export default mergeConfig(viteConfig, testConfig);

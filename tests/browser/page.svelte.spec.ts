import FileUploadHandler from '$lib/components/FileUploadHandler.svelte';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

describe('FileUploadHandler.svelte', () => {
	it('should render the component without errors', async () => {
		const { container } = render(FileUploadHandler, {
			props: {
				name: 'file-upload',
				processFile: vi.fn(async () => ({}))
			}
		});

		expect(container).toBeTruthy();
	});

	it('should render with custom label', async () => {
		const customLabel = 'Upload your documents here';
		const { getByText } = render(FileUploadHandler, {
			props: {
				label: customLabel,
				name: 'file-upload',
				processFile: vi.fn(async () => ({}))
			}
		});

		const label = getByText(customLabel);
		expect(label).toBeTruthy();
	});
});

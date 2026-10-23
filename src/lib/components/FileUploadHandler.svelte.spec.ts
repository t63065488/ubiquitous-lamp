import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import FileUploadHandler from './FileUploadHandler.svelte';

const csvFile = (name: string, content: string) => new File([content], name, { type: 'text/csv' });

const upload = async (container: HTMLElement, files: File[]) => {
	const input = container.querySelector<HTMLInputElement>('input[type="file"]');
	if (!input) {
		throw new Error('File input not found');
	}
	await page.elementLocator(input).upload(files);
};

describe('FileUploadHandler.svelte', () => {
	it('renders a custom label', async () => {
		await render(FileUploadHandler, {
			label: 'Upload your documents here',
			name: 'file-upload',
			processFile: vi.fn(async () => [])
		});

		await expect.element(page.getByText('Upload your documents here')).toBeInTheDocument();
	});

	it('lists files that share a name and reports them to onFileUpload', async () => {
		const onFileUpload = vi.fn();
		const files = [csvFile('data.csv', 'a\n1\n'), csvFile('data.csv', 'a\n1\n2\n')];
		const { container } = await render(FileUploadHandler, {
			name: 'file-upload',
			onFileUpload,
			processFile: vi.fn(async () => [])
		});

		await upload(container, files);

		await expect.element(page.getByRole('table')).toBeInTheDocument();
		expect(page.getByRole('row').filter({ hasText: 'data.csv' }).all()).toHaveLength(2);
		expect(onFileUpload).toHaveBeenLastCalledWith(files);
	});

	it('disables Process All when processing is not allowed', async () => {
		const { container } = await render(FileUploadHandler, {
			canProcess: false,
			name: 'file-upload',
			processFile: vi.fn(async () => [])
		});

		await upload(container, [csvFile('data.csv', 'a\n1\n')]);

		await expect.element(page.getByRole('button', { name: 'Process All' })).toBeDisabled();
	});

	it('downloads processed results with their file names, skipping removed files', async () => {
		const onDownload = vi.fn();
		const processFile = vi.fn(async (file: File) => [{ name: file.name }]);
		const { container } = await render(FileUploadHandler, {
			name: 'file-upload',
			onDownload,
			processFile
		});

		await upload(container, [csvFile('first.csv', 'a\n1\n'), csvFile('second.csv', 'a\n2\n')]);
		await page.getByRole('button', { name: 'Process All' }).click();
		await expect.element(page.getByRole('button', { name: 'Download All' })).toBeEnabled();

		await page.getByRole('button', { name: 'Download All' }).click();
		expect(onDownload).toHaveBeenCalledTimes(2);
		expect(onDownload).toHaveBeenCalledWith([{ name: 'first.csv' }], 'first.csv');
		expect(onDownload).toHaveBeenCalledWith([{ name: 'second.csv' }], 'second.csv');

		// Remove the first file from the upload list; its result must no longer be downloaded
		const deleteTriggers = container.querySelectorAll<HTMLElement>(
			'[data-part="item-delete-trigger"]'
		);
		await page.elementLocator(deleteTriggers[0]).click();
		await expect.element(page.getByRole('cell', { name: 'first.csv' })).not.toBeInTheDocument();

		onDownload.mockClear();
		await page.getByRole('button', { name: 'Download All' }).click();
		expect(onDownload).toHaveBeenCalledTimes(1);
		expect(onDownload).toHaveBeenCalledWith([{ name: 'second.csv' }], 'second.csv');
		expect(processFile).toHaveBeenCalledTimes(2);
	});
});

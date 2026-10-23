<script lang="ts">
	import type { Row } from '$lib/utils/parse';
	import type { FileChangeDetails, FileRejectDetails } from '@zag-js/file-upload';
	import type { Snippet } from 'svelte';

	import { ArrowDownIcon, Check, File as FileIcon, Hourglass, X } from '@lucide/svelte';
	import { FileUpload, Progress } from '@skeletonlabs/skeleton-svelte';

	interface FileTableEntry {
		file: File;
		id: string;
		name: string;
		processingState: 'error' | 'pending' | 'processed' | 'processing';
	}

	interface FileUploadHandlerProps {
		additions?: Snippet;
		canProcess?: boolean;
		label?: string;
		name: string;
		onDownload?: (rows: Row[], fileName: string) => void;
		onFileUpload?: (files: File[]) => void;
		processFile: (file: File) => Promise<Row[]>;
	}

	const {
		additions,
		canProcess = true,
		label = 'Click or drag and drop files here (accepts .csv, xls, xlsx).',
		name,
		onDownload = () => {},
		onFileUpload = () => {},
		processFile
	}: FileUploadHandlerProps = $props();

	let files: FileTableEntry[] = $state([]);
	let fileTracker: { [id: string]: Row[] } = $state({});
	let rejectionMessage: null | string = $state(null);

	const populateFiles = (fileChanges: FileChangeDetails) => {
		// Keep existing entries (and their processed results) for files that are still selected
		files = fileChanges.acceptedFiles.map(
			(file): FileTableEntry =>
				files.find((entry) => entry.file === file) ?? {
					file: file,
					id: crypto.randomUUID(),
					name: file.name,
					processingState: 'pending'
				}
		);
		const ids = new Set(files.map((file) => file.id));
		Object.keys(fileTracker)
			.filter((id) => !ids.has(id))
			.forEach((id) => delete fileTracker[id]);
		rejectionMessage = null;
		onFileUpload(fileChanges.acceptedFiles);
	};

	const onFileRejection = (details: FileRejectDetails) => {
		if (details.files.length === 0) {
			return;
		}
		rejectionMessage =
			'Some files could not be added: ' +
			details.files.map(({ errors, file }) => `${file.name} (${errors.join(', ')})`).join('; ');
	};

	const processAllFiles = () => {
		files.forEach((file) => {
			file.processingState = 'processing';
			processFile(file.file)
				.then((value) => {
					file.processingState = 'processed';
					fileTracker[file.id] = value;
				})
				.catch((error) => {
					console.error(error);
					file.processingState = 'error';
				});
		});
	};

	const downloadAll = () => {
		files
			.filter((file) => file.processingState === 'processed')
			.forEach((file) => onDownload(fileTracker[file.id], file.name));
	};
</script>

<div class="space-y-4">
	<FileUpload
		{name}
		onFileChange={populateFiles}
		onFileReject={onFileRejection}
		accept={{
			'application/vnd.ms-excel': ['.xls'],
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
			'text/csv': ['.csv']
		}}
		maxFiles={Infinity}
	>
		<FileUpload.Label>{label}</FileUpload.Label>
		<FileUpload.Dropzone>
			<FileIcon class="size-10" />
			<span>Select file or drag here.</span>
			<FileUpload.Trigger>Browse Files</FileUpload.Trigger>
			<FileUpload.HiddenInput />
		</FileUpload.Dropzone>
		<FileUpload.ItemGroup>
			<FileUpload.Context>
				{#snippet children(fileUpload)}
					{#each fileUpload().acceptedFiles as file (file)}
						<FileUpload.Item {file}>
							<FileUpload.ItemName>{file.name}</FileUpload.ItemName>
							<FileUpload.ItemSizeText>{file.size} bytes</FileUpload.ItemSizeText>
							<FileUpload.ItemDeleteTrigger />
						</FileUpload.Item>
					{/each}
				{/snippet}
			</FileUpload.Context>
		</FileUpload.ItemGroup>
		<FileUpload.ClearTrigger>Clear Files</FileUpload.ClearTrigger>
	</FileUpload>
	{#if rejectionMessage}
		<p class="card preset-tonal-error p-4" role="alert">{rejectionMessage}</p>
	{/if}
	{#if files.length !== 0}
		<hr class="hr border-t-2" />
		{@render additions?.()}
		<table class="table">
			<caption>Uploaded Files</caption>
			<thead>
				<tr>
					<th>Name</th>
					<th>Processed</th>
					<th>Download</th>
				</tr>
			</thead>
			<tbody class="[&>tr]:hover:preset-tonal-primary">
				{#each files as row (row.id)}
					<tr>
						<td class="text-left">{row.name}</td>
						<td>
							{#if row.processingState === 'pending'}
								<Hourglass />
							{:else if row.processingState === 'processing'}
								<Progress value={null}>
									<Progress.Circle class="[--size:--spacing(6)]">
										<Progress.CircleTrack />
										<Progress.CircleRange />
									</Progress.Circle>
								</Progress>
							{:else if row.processingState === 'processed'}
								<Check color="green" />
							{:else if row.processingState === 'error'}
								<X color="red" />
							{/if}
						</td>
						<td>
							<button
								type="button"
								class="btn-icon preset-filled"
								title="Download"
								disabled={row.processingState !== 'processed'}
								onclick={() => onDownload(fileTracker[row.id], row.name)}
								><ArrowDownIcon size={18} /></button
							>
						</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="2">
						<button
							type="button"
							class="btn preset-filled"
							disabled={!canProcess || files.some((file) => file.processingState === 'processing')}
							onclick={processAllFiles}>Process All</button
						>
						<button
							type="button"
							class="btn preset-filled"
							disabled={!files.some((file) => file.processingState === 'processed')}
							onclick={downloadAll}>Download All</button
						>
					</td>
				</tr>
			</tfoot>
		</table>
	{/if}
</div>

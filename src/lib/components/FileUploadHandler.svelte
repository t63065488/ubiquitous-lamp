<script lang="ts">
	import type { FileChangeDetails, FileRejectDetails } from '@zag-js/file-upload';
	import type { Snippet } from 'svelte';

	import { toaster } from '$lib/toaster-svelte';
	import {
		ArrowDownIcon,
		Check,
		CircleX,
		File as FileIcon,
		FilePlus,
		Hourglass,
		X
	} from '@lucide/svelte';
	import { FileUpload, ProgressRing } from '@skeletonlabs/skeleton-svelte';
	import { v4 as uuidv4 } from 'uuid';

	interface FileTableEntry {
		file: File;
		id: string;
		name: string;
		processingState: 'error' | 'pending' | 'processed' | 'processing';
	}

	interface FileUploadHandlerProps {
		additions?: Snippet;
		label?: string;
		name: string;
		onFileUpload?: (files: File[]) => void;
		onDownload?: (data: any) => void;
		processFile: (file: File) => Promise<any>;
	}

	const {
		additions,
		label = 'Click or drag and drop files here (accepts .csv, xls, xlsx).',
		name,
		onFileUpload = () => {},
		processFile,
		onDownload = () => {}
	}: FileUploadHandlerProps = $props();

	let files: FileTableEntry[] = $state([]);
	let fileTracker: { [id: string]: any } = $state({});

	const populateFiles = (fileChanges: FileChangeDetails) => {
		files = fileChanges.acceptedFiles.map((file): FileTableEntry => {
			return {
				file: file,
				id: uuidv4(),
				name: file.name,
				processingState: 'pending'
			};
		});
		onFileUpload(fileChanges.acceptedFiles);
	};

	const onFileRejection = (details: FileRejectDetails) => {
		toaster.error({
			description:
				'There was an error uploading chosen files. \n' +
				details.files.map((file) => file.file.name + ': ' + file.errors).join('\n'),
			title: 'Error'
		});
	};

	const processAllFiles = async () => {
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
</script>

<div class="space-y-4">
	<FileUpload
		{name}
		{label}
		onFileChange={populateFiles}
		onFileReject={onFileRejection}
		accept={[
			'text/csv',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		]}
		maxFiles={Infinity}
	>
		{#snippet iconInterface()}
			<FilePlus class="size-4" />
		{/snippet}
		{#snippet iconFile()}
			<FileIcon class="size-4" />
		{/snippet}
		{#snippet iconFileRemove()}
			<CircleX class="size-4" />
		{/snippet}
	</FileUpload>
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
								<ProgressRing value={null} size="size-6" />
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
								onclick={() => onDownload(fileTracker[row.id])}><ArrowDownIcon size={18} /></button
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
							disabled={files.some((file) => file.processingState === 'processing')}
							onclick={() => processAllFiles()}>Process All</button
						>
						<button
							type="button"
							class="btn preset-filled"
							disabled={!files.some((file) => file.processingState === 'processed')}
							onclick={() => Object.keys(fileTracker).forEach((key) => onDownload(fileTracker[key]))}
							>Download All</button
						>
					</td>
				</tr>
			</tfoot>
		</table>
	{/if}
</div>

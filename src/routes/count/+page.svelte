<script lang="ts">
	import FileUploadHandler from '#lib/components/FileUploadHandler.svelte';
	import { downloadCsv, fileStem } from '#lib/utils/download.js';
	import { countValues, type Row } from '#lib/utils/parse.js';
	import { parseFile, readColumns } from '#lib/utils/tabular.js';

	let columns: string[] = $state([]);
	let groupBy: null | string = $state(null);
	let countColumn: null | string = $state(null);
	let latestUpload = 0;

	const onFileUpload = async (files: File[]) => {
		const upload = ++latestUpload;
		let newColumns: string[] = [];
		try {
			newColumns = await readColumns(files);
		} catch (error) {
			console.error(error);
		}
		// Ignore results from a selection that has since been replaced
		if (upload !== latestUpload) {
			return;
		}

		columns = newColumns;
		if (!countColumn || !columns.includes(countColumn)) {
			countColumn = columns[0] ?? null;
		}
		if (groupBy && !columns.includes(groupBy)) {
			groupBy = null;
		}
	};

	const processFile = async (file: File) => {
		if (!countColumn) {
			throw new Error('Select a column to count before processing.');
		}
		const { rows } = await parseFile(file);
		return countValues(rows, countColumn, groupBy ?? undefined);
	};

	const onDownload = (rows: Row[], fileName: string) => {
		downloadCsv(rows, `${fileStem(fileName)}-counts.csv`);
	};
</script>

<svelte:head>
	<title>Count Data - Ubiquitous Lamp</title>
</svelte:head>

<div class="space-y-4">
	<h2 class="h2">Count Data</h2>
	<p class="card preset-outlined-surface-200-800 p-4 text-sm">
		Upload CSV or Excel files, choose a column to count occurrences of each value, and optionally
		group the counts by another column. Each processed file downloads as a CSV of value counts.
	</p>
	<FileUploadHandler
		name="Count"
		canProcess={!!countColumn}
		{processFile}
		{onFileUpload}
		{onDownload}
	>
		{#snippet additions()}
			{#if columns.length > 0}
				<label class="label">
					<span class="label-text">Select Column to Count</span>
					<select bind:value={countColumn} class="select">
						{#each columns as column (column)}
							<option value={column}>{column}</option>
						{/each}
					</select>
				</label>
				<label class="label">
					<span class="label-text">Group By</span>
					<select bind:value={groupBy} class="select">
						<option value={null}>None</option>
						{#each columns as column (column)}
							<option value={column}>{column}</option>
						{/each}
					</select>
				</label>
			{/if}
		{/snippet}
	</FileUploadHandler>
</div>

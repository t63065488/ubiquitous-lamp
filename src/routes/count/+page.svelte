<script lang="ts">
	import FileUploadHandler from '$lib/components/FileUploadHandler.svelte';
	import { defaultHeaderTransform, getUniqueValues } from '$lib/utils/parse';
	import Papa from 'papaparse';

	let columns: Set<string> = $state(new Set());
	let groupBy: null | string = $state(null);
	let countColumn: null | string = $state(null);

	const onFileUpload = (files: File[]) => {
		const newColumns = new Set<string>();
		files.map((file) =>
			Papa.parse<File>(file, {
				complete: (results) => {
					results.meta.fields?.forEach((field) => newColumns.add(field));
					columns = newColumns;
				},
				header: true,
				skipEmptyLines: true,
				transform() {
					return null;
				},
				transformHeader(header, index) {
					return defaultHeaderTransform(header, index);
				}
			})
		);
	};

	const processFile = async (file: File) => {
		const fileText = await file.text();
		const parsed: { [key: string]: string }[] = Papa.parse(fileText, {
			header: true,
			skipEmptyLines: true,
			transformHeader(header, index) {
				return defaultHeaderTransform(header, index);
			}
		}).data as { [key: string]: string }[];

		if (groupBy) {
			const uniqueValues = getUniqueValues(parsed, groupBy);
			const results: { [key: string]: { [key: string]: number } } = {};
			uniqueValues.forEach((value) => {
				results[value] = getCountsWithFilter(
					parsed,
					(row) => row[groupBy!] === value,
					countColumn!
				);
			});
			return results;
		}

		return getCountsWithFilter(parsed, () => true, countColumn!);
	};

	const getCountsWithFilter = (
		data: { [key: string]: string }[],
		filter: (row: { [key: string]: string }, index: number) => boolean,
		key: string
	) => {
		const counts: { [key: string]: number } = {};
		data.filter(filter).forEach((row) => {
			counts[row[key]] = counts[row[key]] ? counts[row[key]] + 1 : 1;
		});
		return counts;
	};

	const onDownload = (data: any) => {
		console.log(data);
		const unparsed = Papa.unparse(data);
		const blob = new Blob([unparsed], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `processed-data.csv`;
		link.click();

		// Clean up the object URL
		URL.revokeObjectURL(url);
	};
</script>

<div class="w-full card preset-filled-surface-100-900 p-4">
	<h2 class="pb-4 h2">Count Data</h2>
	<FileUploadHandler name="Count" {processFile} {onFileUpload} {onDownload}>
		{#snippet additions()}
			{#if columns.size > 0}
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
						{#each columns as column (column)}
							<option value={column}>{column}</option>
						{/each}
					</select>
				</label>
			{/if}
		{/snippet}
	</FileUploadHandler>
</div>

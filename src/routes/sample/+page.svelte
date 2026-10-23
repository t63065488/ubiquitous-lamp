<script lang="ts">
	import { Listbox, Slider, useListCollection } from '@skeletonlabs/skeleton-svelte';

	import FileUploadHandler from '#lib/components/FileUploadHandler.svelte';
	import { downloadCsv, fileStem } from '#lib/utils/download.js';
	import { getUniqueValues, type Row, sampleRows } from '#lib/utils/parse.js';
	import { type ParsedFile, parseFile } from '#lib/utils/tabular.js';

	// Listbox values must be non-empty, so blank cells are represented by a sentinel
	const BLANK_VALUE = '\u0000';
	const MAX_LISTED_VALUES = 200;
	const markers: number[] = [10, 25, 50, 75, 90];

	let columns: string[] = $state([]);
	let uploadedRows: Row[] = $state.raw([]);
	let selectedColumn = $state('');
	let selectedValues: string[] = $state([]);
	let query = $state('');
	let percent: number[] = $state([10]);
	let mergeOriginal = $state(false);
	let latestUpload = 0;

	const toItemValue = (cell: string | undefined) => cell || BLANK_VALUE;
	const toItemLabel = (item: string) => (item === BLANK_VALUE ? '(blank)' : item);

	const uniqueValues = $derived(
		selectedColumn
			? [...getUniqueValues(uploadedRows, selectedColumn)]
					.map(toItemValue)
					.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
			: []
	);
	const matchingValues = $derived(
		uniqueValues.filter((item) => toItemLabel(item).toLowerCase().includes(query.toLowerCase()))
	);
	const collection = $derived(
		useListCollection({
			items: matchingValues.slice(0, MAX_LISTED_VALUES),
			itemToString: toItemLabel,
			itemToValue: (item) => item
		})
	);

	const onFileUpload = async (files: File[]) => {
		const upload = ++latestUpload;
		let parsed: ParsedFile[] = [];
		try {
			parsed = await Promise.all(files.map(parseFile));
		} catch (error) {
			console.error(error);
		}
		// Ignore results from a selection that has since been replaced
		if (upload !== latestUpload) {
			return;
		}

		columns = [...new Set(parsed.flatMap(({ fields }) => fields))];
		uploadedRows = parsed.flatMap(({ rows }) => rows);
		if (!columns.includes(selectedColumn)) {
			selectedColumn = columns[0] ?? '';
			selectedValues = [];
		}
	};

	const processFile = async (file: File) => {
		// Snapshot the options so later UI changes don't affect an in-flight run
		const column = selectedColumn;
		const values = new Set(selectedValues);
		const percentage = percent[0];
		const merge = mergeOriginal;

		const { rows } = await parseFile(file);
		const pool =
			column && values.size > 0 ? rows.filter((row) => values.has(toItemValue(row[column]))) : rows;
		const sampled =
			pool.length > 0
				? sampleRows(pool, Math.max(1, Math.round((pool.length * percentage) / 100)))
				: [];
		return merge ? [...sampled, ...rows] : sampled;
	};

	const onDownload = (rows: Row[], fileName: string) => {
		downloadCsv(rows, `${fileStem(fileName)}-sample.csv`);
	};
</script>

<svelte:head>
	<title>Sample Data - Ubiquitous Lamp</title>
</svelte:head>

<div class="space-y-4">
	<h2 class="h2">Sample Data</h2>
	<p class="card preset-outlined-surface-200-800 p-4 text-sm">
		Upload CSV or Excel files and take a random sample of their rows. Optionally restrict the sample
		to rows whose value in a chosen column matches the values you select. Merging appends the
		original rows below the sample.
	</p>
	<FileUploadHandler name="Sample" {processFile} {onFileUpload} {onDownload}>
		{#snippet additions()}
			<div class="mx-auto w-full max-w-md space-y-4">
				<label class="label">
					<span class="label-text">Filter Column</span>
					<select
						class="select"
						bind:value={
							() => selectedColumn,
							(column) => {
								selectedColumn = column;
								selectedValues = [];
								query = '';
							}
						}
					>
						{#each columns as column (column)}
							<option value={column}>{column}</option>
						{/each}
					</select>
				</label>
				<Listbox
					class="w-full"
					{collection}
					selectionMode="multiple"
					value={selectedValues}
					onValueChange={(e) => (selectedValues = e.value)}
				>
					<Listbox.Label>
						Only sample rows with these values ({selectedValues.length === 0
							? 'none selected: all rows'
							: `${selectedValues.length} selected`})
					</Listbox.Label>
					<Listbox.Input
						placeholder="Type to search..."
						value={query}
						oninput={(e) => (query = e.currentTarget.value)}
					/>
					<!-- Items focus the content on mousedown without preventScroll; if the list is partly
					     off-screen the page scrolls mid-click and the click lands on another item. Focusing
					     here first (pointerdown precedes mousedown) makes that later focus a no-op. -->
					<Listbox.Content
						class="max-h-64 overflow-y-auto"
						onpointerdown={(e) => e.currentTarget.focus({ preventScroll: true })}
					>
						{#each collection.items as item (item)}
							<Listbox.Item {item}>
								<Listbox.ItemText>{toItemLabel(item)}</Listbox.ItemText>
								<Listbox.ItemIndicator />
							</Listbox.Item>
						{/each}
					</Listbox.Content>
				</Listbox>
				{#if matchingValues.length > MAX_LISTED_VALUES}
					<p class="text-xs opacity-60">
						Showing {MAX_LISTED_VALUES} of {matchingValues.length} values. Type to narrow the list.
					</p>
				{/if}
			</div>
			<Slider
				name="sample-percentage-input"
				min={1}
				value={percent}
				onValueChange={(e) => (percent = e.value)}
			>
				<Slider.Label>Select Sample Percentage</Slider.Label>
				<Slider.Control>
					<Slider.Track>
						<Slider.Range />
					</Slider.Track>
					<Slider.Thumb index={0}>
						<Slider.HiddenInput />
					</Slider.Thumb>
				</Slider.Control>
				<Slider.MarkerGroup>
					{#each markers as marker (marker)}
						<Slider.Marker value={marker} />
					{/each}
				</Slider.MarkerGroup>
			</Slider>
			<p class="p opacity-60">Current: {percent[0]}%</p>
			<label class="flex items-center gap-2">
				<input class="checkbox" type="checkbox" bind:checked={mergeOriginal} />
				<span>Merge Original Data?</span>
			</label>
		{/snippet}
	</FileUploadHandler>
</div>

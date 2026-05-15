<script lang="ts">
	import FileUploadHandler from '$lib/components/FileUploadHandler.svelte';
	import { defaultHeaderTransform } from '$lib/utils/parse';
	import { Listbox, Slider, useListCollection } from '@skeletonlabs/skeleton-svelte';
	import Papa from 'papaparse';
	import { SvelteSet } from 'svelte/reactivity';

	let value: number[] = $state([10]);

	let columns = $state(new SvelteSet<string>());
	let selectedColumn: string = $state('');
	let uniqueValues = $state(new SvelteSet<string>());

	const markers: number[] = [10, 25, 50, 75, 90];

	const onFileUpload = (files: File[]) => {
		const newColumns = new SvelteSet<string>();
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

	let query = $state('');

	const collection = $derived(
		useListCollection({
			items: [...uniqueValues].filter((item) => item.toLowerCase().includes(query.toLowerCase())),
			itemToString: (item) => item,
			itemToValue: (item) => item
		})
	);

	const processFile = async (file: File) => {
		const jsondata = Papa.parse(await file.text(), {
			header: true,
			skipEmptyLines: true,
			transformHeader(header, index) {
				if (!header && index === 0) {
					return 'ID';
				}
				if (!header) {
					return `FIELD-${index}`;
				}
				return header;
			}
		});

		const newUniqueValues = new SvelteSet<string>();

		jsondata.data.forEach((element: { [key: string]: string }) =>
			newUniqueValues.add(element['AUTO ID*'])
		);

		uniqueValues = newUniqueValues;
	};

	const onColumnSelect = (event: Event) => {
		console.log(event);
	};
</script>

<svelte:head>
	<title>Sample Data - Ubiquitous Lamp</title>
</svelte:head>

<div>
	<h2 class="pb-4 h2">Sample Data</h2>
	<FileUploadHandler name="Count" {processFile} {onFileUpload}>
		{#snippet additions()}
			<form class="mx-auto w-full max-w-md space-y-4">
				<!-- Default -->
				<label class="label">
					<span class="label-text">Select Column to Sample</span>
					<select class="select" onchange={onColumnSelect} bind:value={selectedColumn}>
						{#each columns as column (column)}
							<option value={column}>{column}</option>
						{/each}
					</select>
				</label>
				<Listbox class="w-full max-w-md" {collection}>
					<Listbox.Label>Search for Values</Listbox.Label>
					<Listbox.Input
						placeholder="Type to search..."
						value={query}
						oninput={(e) => (query = e.currentTarget.value)}
					/>
					<Listbox.Content>
						{#each collection.items as item (item)}
							<Listbox.Item {item}>
								<Listbox.ItemText>{item}</Listbox.ItemText>
								<Listbox.ItemIndicator />
							</Listbox.Item>
						{/each}
					</Listbox.Content>
				</Listbox>
			</form>
			<Slider
				name="sample-percentage-input"
				{value}
				onValueChange={(e) => (value = e.value)}
				defaultValue={[10]}
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
			<p class="p opacity-60">Current: {value[0]}%</p>
			<label>
				<input class="checkbox" type="checkbox" />
				<p>Merge Original Data?</p>
			</label>
		{/snippet}
	</FileUploadHandler>
</div>

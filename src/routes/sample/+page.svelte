<script lang="ts">
	import FileUploadHandler from '$lib/components/FileUploadHandler.svelte';
	import { Slider } from '@skeletonlabs/skeleton-svelte';
	import Papa from 'papaparse';

	let value: number[] = $state([10]);

	let columns: string[] = $state([]);
	let uniqueValues: Set<string> = $state(new Set<string>());

	const markers: number[] = [10, 25, 50, 75, 90];

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

		const newUniqueValues = new Set<string>();

		jsondata.data.forEach((element: { [key: string]: string }) =>
			newUniqueValues.add(element['AUTO ID*'])
		);

		uniqueValues = newUniqueValues;
		columns = jsondata.meta.fields!;
	};
</script>

<div class="w-full card preset-filled-surface-100-900 p-4">
	<h2 class="pb-4 h2">Sample Data</h2>
	<FileUploadHandler name="Count" {processFile}>
		{#snippet additions()}
			<form class="mx-auto w-full max-w-md space-y-4">
				<!-- Default -->
				<label class="label">
					<span class="label-text">Select Column to Sample</span>
					<select class="select">
						{#each columns as column (column)}
							<option value={column}>{column}</option>
						{/each}
					</select>
				</label>
				{#each uniqueValues as value}
					<label class="flex items-center space-x-2">
						<input class="checkbox" type="checkbox" {value} />
						<p>{value}</p>
					</label>
				{/each}
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
					{#each markers as marker}
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

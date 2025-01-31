<script lang="ts">
	import {
		filterJsonData,
		getUniqueColumnValues,
		jsonToCsv,
		parseCsv,
		recombineData,
		samplePercentage
	} from '../utils/csv';

	import { extractCounts } from '../utils/ecology';

	import * as XLSX from 'xlsx';

	let samplePercentInput = $state(10);

	let file: File | null = null;
	const handleFileChange = async (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			file = input.files[0];

			// Read the file
			const text = await file.text();
			const csv = parseCsv(text).data;

			const sample1 = samplePercentage(
				filterJsonData('AUTO ID*', 'PIPPIP', csv),
				samplePercentInput
			);
			const sample2 = samplePercentage(
				filterJsonData('AUTO ID*', 'PIPPYG', csv),
				samplePercentInput
			);
			const sample3 = samplePercentage(
				filterJsonData('AUTO ID*', 'Noise', csv),
				samplePercentInput
			);

			const recombinedData = recombineData([...sample1, ...sample2, ...sample3], csv as any);

			const toDownload = jsonToCsv(recombinedData);

			const blob = new Blob([toDownload], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${file.name}-processed-data.csv`;
			link.click();

			// Clean up the object URL
			URL.revokeObjectURL(url);
		}
	};

	const handleFileChangeCounts = async (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			Array.from(input.files).forEach(async (file) => {
				// Read the file
				const text = await file.text();
				const csv = parseCsv(text).data;

				csv.forEach((data, index) => {
					if (data['DATE-12'] === undefined) {
						data['DATE-12'] = csv[index === 0 ? index : index - 1]['DATE-12'];
					}
				});

				// Get unique dates
				const dates = getUniqueColumnValues('DATE-12', csv);

				const countedData = JSON.parse(JSON.stringify(extractCounts(dates, csv)));

				const rows = [];
				Object.entries(countedData).forEach(([date, metrics]) => {
					Object.entries(metrics as any).forEach(([metric, value]) => {
						rows.push({ Date: date, Metric: metric, Value: value });
					});
				});

				// Create a worksheet
				const worksheet = XLSX.utils.json_to_sheet(rows);

				// Create a workbook and append the worksheet
				const workbook = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

				// Create a downloadable Excel file
				XLSX.writeFile(workbook, `${file.name}-counted-data.xlsx`);
			});
		}
	};
</script>

<div>
	<hr />
	<label for="percentage-picker">Sample Percentage</label>
	<input type="number" id="percentage-picker" value={samplePercentInput} min="0" max="100" />
	<br />
	<label for="file-upload">Sample File Upload:</label>
	<input type="file" id="file-upload" accept=".csv" onchange={handleFileChange} />
	<br />
	<hr />
	<label for="table-counts">Count Table File Upload:</label>
	<input type="file" id="file-upload" accept=".csv" onchange={handleFileChangeCounts} multiple />
</div>

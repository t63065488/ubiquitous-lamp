import * as Papa from 'papaparse';

const parseCsv = (csvFile: string) => {
	const jsonData = Papa.parse(csvFile, {
		header: true,
		transformHeader: (header, index) => {
			if (header === '' && index === 0) {
				return 'ROWID';
			}
			return header;
		},
		skipEmptyLines: true
	});
	return jsonData;
};

const jsonToCsv = (csvData: any) => {
	return Papa.unparse(csvData);
};

/**
 *
 * @param column
 * @param value
 * @param data
 * @returns
 */
const filterJsonData = (column: string, value: string | number, data: any[]): any[] => {
	return data.filter((d) => d[column] === value);
};

const getUniqueColumnValues = (column: string, data: any[]) => {
	return Array.from(new Set(data.map((d) => d[column])));
};

/**
 * Randomly samples a percentage of the given array.
 * @param array - The input array to sample from.
 * @param percentage - The percentage (0-100) of the array to sample.
 * @returns A new array containing the randomly sampled elements.
 */
const samplePercentage = <T>(array: T[], percentage: number): T[] => {
	if (percentage < 0 || percentage > 100) {
		throw new Error('Percentage must be between 0 and 100.');
	}

	const sampleSize = Math.ceil((array.length * percentage) / 100);
	const shuffledArray = [...array]; // Clone the array to avoid modifying the original
	for (let i = shuffledArray.length - 1; i > 0; i--) {
		const randomIndex = Math.floor(Math.random() * (i + 1));
		[shuffledArray[i], shuffledArray[randomIndex]] = [shuffledArray[randomIndex], shuffledArray[i]];
	}

	return shuffledArray.slice(0, sampleSize);
};

/**
 * Takes two data inputs - the sampled data, and the source data. Resolves the diff and recombines the two.
 */
const recombineData = <T extends { ROWID: any }>(sampledData: T[], sourceData: T[]): T[] => {
	return Array.from(new Set([...sampledData, ...sourceData]));
};

export {
	parseCsv,
	filterJsonData,
	getUniqueColumnValues,
	samplePercentage,
	recombineData,
	jsonToCsv
};

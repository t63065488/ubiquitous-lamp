import { describe, expect, test } from 'vitest';
import { filterJsonData, parseCsv, samplePercentage } from './csv';
import { readFileSync } from 'fs';

describe('', () => {
	test('Test CSV parsing, filter, sample', () => {
		console.log('Start');
		const data = readFileSync('/home/user/git/ubiquitous-lamp/src/utils/Test.csv', 'utf-8');
		const parsed = parseCsv(data);
		const filtered = filterJsonData('AUTO ID*', 'PIPPIP', parsed.data);

		const sampled = samplePercentage(filtered, 10);
		expect(sampled.length).toEqual(Math.ceil(filtered.length / 10));
	});
});

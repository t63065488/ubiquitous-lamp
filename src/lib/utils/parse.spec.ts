import { describe, expect, it } from 'vitest';

import { countValues, defaultHeaderTransform, getUniqueValues, sampleRows } from './parse';

const rows = [
	{ colour: 'red', size: 'S' },
	{ colour: 'blue', size: 'M' },
	{ colour: 'red', size: 'M' },
	{ colour: 'red', size: 'S' },
	{ colour: '', size: 'L' }
];

describe('defaultHeaderTransform', () => {
	it('names an empty first header ID', () => {
		expect(defaultHeaderTransform('', 0)).toBe('ID');
	});

	it('names other empty headers by position', () => {
		expect(defaultHeaderTransform('', 3)).toBe('FIELD-3');
	});

	it('keeps non-empty headers', () => {
		expect(defaultHeaderTransform('Name', 0)).toBe('Name');
	});
});

describe('getUniqueValues', () => {
	it('returns each distinct value once, including blanks', () => {
		expect(getUniqueValues(rows, 'colour')).toEqual(new Set(['', 'blue', 'red']));
	});

	it('treats a missing column as blank', () => {
		expect(getUniqueValues(rows, 'missing')).toEqual(new Set(['']));
	});
});

describe('countValues', () => {
	it('returns CSV-ready rows sorted by count', () => {
		expect(countValues(rows, 'colour')).toEqual([
			{ colour: 'red', Count: '3' },
			{ colour: 'blue', Count: '1' },
			{ colour: '', Count: '1' }
		]);
	});

	it('splits counts by group', () => {
		expect(countValues(rows, 'colour', 'size')).toEqual([
			{ colour: '', Count: '1', size: 'L' },
			{ colour: 'blue', Count: '1', size: 'M' },
			{ colour: 'red', Count: '1', size: 'M' },
			{ colour: 'red', Count: '2', size: 'S' }
		]);
	});

	it('returns no rows for no data', () => {
		expect(countValues([], 'colour')).toEqual([]);
	});
});

describe('sampleRows', () => {
	const numbers = Array.from({ length: 100 }, (_, index) => index);

	it('returns the requested number of distinct rows in original order', () => {
		const sample = sampleRows(numbers, 10);
		expect(sample).toHaveLength(10);
		expect(new Set(sample).size).toBe(10);
		expect(sample).toEqual([...sample].sort((a, b) => a - b));
	});

	it('caps the sample at the number of rows', () => {
		expect(sampleRows(numbers, 500)).toEqual(numbers);
	});

	it('returns nothing for empty input or a non-positive count', () => {
		expect(sampleRows([], 5)).toEqual([]);
		expect(sampleRows(numbers, 0)).toEqual([]);
		expect(sampleRows(numbers, -1)).toEqual([]);
	});
});

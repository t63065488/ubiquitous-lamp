import { describe, expect, it } from 'vitest';
import { utils, write } from 'xlsx';

import { parseFile, readColumns } from './tabular';

const csvFile = (name: string, content: string) => new File([content], name, { type: 'text/csv' });

const xlsxFile = (name: string, cells: unknown[][]) => {
	const workbook = utils.book_new();
	utils.book_append_sheet(workbook, utils.aoa_to_sheet(cells), 'Sheet1');
	const buffer: ArrayBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
	return new File([buffer], name);
};

describe('parseFile', () => {
	it('parses CSV rows keyed by header, filling empty headers', async () => {
		const parsed = await parseFile(csvFile('data.csv', ',name,\n1,Ann,x\n\n2,Bob,y\n'));
		expect(parsed.fields).toEqual(['ID', 'name', 'FIELD-2']);
		expect(parsed.rows).toEqual([
			{ 'FIELD-2': 'x', ID: '1', name: 'Ann' },
			{ 'FIELD-2': 'y', ID: '2', name: 'Bob' }
		]);
	});

	it('parses the first sheet of an Excel file as strings', async () => {
		const parsed = await parseFile(
			xlsxFile('data.xlsx', [
				['name', 'age', ''],
				['Ann', 31, 'x'],
				['Bob', null, 'y']
			])
		);
		expect(parsed.fields).toEqual(['name', 'age', 'FIELD-2']);
		expect(parsed.rows).toEqual([
			{ age: '31', 'FIELD-2': 'x', name: 'Ann' },
			{ age: '', 'FIELD-2': 'y', name: 'Bob' }
		]);
	});
});

describe('readColumns', () => {
	it('returns the ordered union of columns across files', async () => {
		const columns = await readColumns([
			csvFile('a.csv', 'a,b\n1,2\n'),
			xlsxFile('b.xlsx', [
				['b', 'c'],
				[3, 4]
			])
		]);
		expect(columns).toEqual(['a', 'b', 'c']);
	});

	it('returns no columns for no files', async () => {
		expect(await readColumns([])).toEqual([]);
	});
});

import Papa from 'papaparse';
import { read, utils } from 'xlsx';

import { defaultHeaderTransform, type Row } from './parse';

interface ParsedFile {
	fields: string[];
	rows: Row[];
}

const isSpreadsheet = (file: File): boolean => /\.xlsx?$/i.test(file.name);

const parseCsv = async (file: File): Promise<ParsedFile> => {
	const result = Papa.parse<Row>(await file.text(), {
		header: true,
		skipEmptyLines: true,
		transformHeader: defaultHeaderTransform
	});
	return { fields: result.meta.fields ?? [], rows: result.data };
};

const parseSpreadsheet = async (file: File): Promise<ParsedFile> => {
	const workbook = read(await file.arrayBuffer());
	const sheet = workbook.Sheets[workbook.SheetNames[0]];
	if (!sheet) {
		return { fields: [], rows: [] };
	}

	const [header = [], ...body] = utils.sheet_to_json<unknown[]>(sheet, {
		blankrows: false,
		defval: '',
		header: 1,
		raw: false
	});
	const fields = header.map((cell, index) => defaultHeaderTransform(String(cell ?? ''), index));
	const rows = body.map(
		(cells): Row =>
			Object.fromEntries(fields.map((field, index) => [field, String(cells[index] ?? '')]))
	);
	return { fields, rows };
};

/**
 * Parses a CSV or Excel (first sheet) file into header-keyed rows.
 */
const parseFile = (file: File): Promise<ParsedFile> =>
	isSpreadsheet(file) ? parseSpreadsheet(file) : parseCsv(file);

/**
 * Returns the ordered union of column names across all files.
 */
const readColumns = async (files: File[]): Promise<string[]> => {
	const parsed = await Promise.all(files.map(parseFile));
	return [...new Set(parsed.flatMap(({ fields }) => fields))];
};

export { parseFile, readColumns };
export type { ParsedFile };

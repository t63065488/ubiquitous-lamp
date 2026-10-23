import Papa from 'papaparse';

import type { Row } from './parse';

const fileStem = (fileName: string): string => fileName.replace(/\.[^.]+$/, '');

const downloadCsv = (rows: Row[], fileName: string) => {
	const blob = new Blob([Papa.unparse(rows)], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	link.click();

	// Revoke after the click has been handled so the download isn't cancelled
	setTimeout(() => URL.revokeObjectURL(url), 0);
};

export { downloadCsv, fileStem };

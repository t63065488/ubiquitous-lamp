const defaultHeaderTransform = (header: string, index: number): string => {
	if (!header && index === 0) {
		return 'ID';
	}
	if (!header) {
		return `FIELD-${index}`;
	}
	return header;
};

const getUniqueValues = (data: { [key: string]: string }[], column: string): Set<string> => {
	const values: Set<string> = new Set<string>();
	data.forEach((row) => values.add(row[column]));
	return values;
};

export { defaultHeaderTransform, getUniqueValues };

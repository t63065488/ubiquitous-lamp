type Row = Record<string, string>;

const defaultHeaderTransform = (header: string, index: number): string => {
	if (!header && index === 0) {
		return 'ID';
	}
	if (!header) {
		return `FIELD-${index}`;
	}
	return header;
};

const getUniqueValues = (data: Row[], column: string): Set<string> => {
	const values: Set<string> = new Set<string>();
	data.forEach((row) => values.add(row[column] ?? ''));
	return values;
};

/**
 * Counts occurrences of each value in `column`, optionally split by `groupBy`.
 * Returns CSV-ready rows sorted by group, then by count descending.
 */
const countValues = (data: Row[], column: string, groupBy?: string): Row[] => {
	const counts = new Map<string, { count: number; group: string; value: string }>();
	data.forEach((row) => {
		const group = groupBy ? (row[groupBy] ?? '') : '';
		const value = row[column] ?? '';
		const key = JSON.stringify([group, value]);
		const entry = counts.get(key) ?? { count: 0, group, value };
		entry.count += 1;
		counts.set(key, entry);
	});

	return [...counts.values()]
		.sort((a, b) => a.group.localeCompare(b.group) || b.count - a.count)
		.map(({ count, group, value }) => ({
			...(groupBy ? { [groupBy]: group } : {}),
			[column]: value,
			Count: String(count)
		}));
};

/**
 * Picks `count` distinct rows at random (partial Fisher–Yates), keeping their original order.
 */
const sampleRows = <T>(rows: T[], count: number): T[] => {
	const indices = rows.map((_, index) => index);
	const sampleSize = Math.min(Math.max(count, 0), indices.length);
	for (let i = 0; i < sampleSize; i++) {
		const j = i + Math.floor(Math.random() * (indices.length - i));
		[indices[i], indices[j]] = [indices[j], indices[i]];
	}
	return indices
		.slice(0, sampleSize)
		.sort((a, b) => a - b)
		.map((index) => rows[index]);
};

export { countValues, defaultHeaderTransform, getUniqueValues, sampleRows };
export type { Row };

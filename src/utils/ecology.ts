const extractCounts = (
	dates: Date[],
	hourStart: number,
	hourEnd: number,
	data: any[]
): { [key: string]: { [key: string]: number } } => {
	const countByDate: { [key: string]: { [key: string]: number } } = {};
	dates.forEach((date) => {
		const counts = getCountForDay(date, hourStart, hourEnd, data);
		// console.log(counts);
		countByDate[formatDateToString(date)] = counts;
	});
	return countByDate;
};

const getCountForDay = (
	date: Date,
	hourStart: number,
	hourEnd: number,
	data: any[]
): { [key: string]: number } => {
	const counts: { [key: string]: number } = {};
	const nextDay = new Date(date.getDate() + 1);
	data
		.filter((d) => d['DATE'] === formatDateToString(date) || d['DATE'] === formatDateToString(nextDay))
		.filter((d) =>
			d['DATE'] === date
				? d['HOUR'] >= hourStart || d['HOUR'] === 0
				: d['HOUR'] <= hourEnd && d['HOUR'] !== 0
		)
		.forEach((row) => {
			counts[row['QA2'] || row['MANUAL ID'] || row['AUTO ID*']] =
				counts[row['QA2'] || row['MANUAL ID'] || row['AUTO ID*']] === undefined
					? 1
					: counts[row['QA2'] || row['MANUAL ID'] || row['AUTO ID*']] + 1;
		});
	return counts;
};

const formatDateToString = (date: Date): string => {
	const day = date.getDate().toString().padStart(2, '0'); // Add leading zero if necessary
	const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, so we add 1
	const year = date.getFullYear();

	return `${day}/${month}/${year}`;
};

export { extractCounts };

const extractCounts = (
	dates: string[],
	data: any[]
): { [key: string]: { [key: string]: number } } => {
	const countByDate: { [key: string]: { [key: string]: number } } = {};
	dates.forEach((date) => {
		console.log(`WORKING DATE ${date}`);
		const counts = getCountForDay(date, data);
		console.log(counts);
		countByDate[date] = counts;
	});
	return countByDate;
};

const getCountForDay = (
	date: string,
	data: any[]
): { [key: string]: number } => {
	const counts: { [key: string]: number } = {};
	data
		.filter((d) => d['DATE-12'] === date)
		.forEach((row) => {
			if (row['QA2']) {
				counts[row['QA2']] = counts[row['QA2']] ? counts[row['QA2']] + 1 : 1;
			} else if (row['MANUAL ID']) {
				counts[row['MANUAL ID']] = counts[row['MANUAL ID']] ? counts[row['MANUAL ID']] + 1 : 1;
			} else if (row['AUTO ID*']) {
				counts[row['AUTO ID*']] = counts[row['AUTO ID*']] ? counts[row['AUTO ID*']] + 1 : 1;
			} else {
				console.error('No valid value, row skipped');
			}
		});
	return counts;
};

export { extractCounts };

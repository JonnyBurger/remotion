export const dateString = (date: Date) =>
	date.getFullYear() +
	'-' +
	String(date.getMonth() + 1).padStart(2, '0') +
	'-' +
	String(date.getDate()).padStart(2, '0');

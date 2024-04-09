export const makeSafeSQL = (text?: string, lowerCase?: boolean) => {
	let safeText = text ? text.trim() : undefined;

	safeText = text ? text : undefined; // convert '' to null

	if (typeof safeText === 'string') {
		safeText = safeText.replace(/\u2013/g, '-'); // en-dash
		safeText = safeText.replace(/\u2014/g, '-'); // em-dash
		safeText = safeText.replace(/\u2015/g, '-'); // horizontal bar

		safeText = safeText.replace(/[\u2018\u2019]/g, "'"); // Mac single quotes
		safeText = safeText.replace(/[\u201C\u201D]/g, '"'); // Mac double quotes

		if (lowerCase) {
			safeText = safeText.toLowerCase();
		}
	}

	return safeText;
};

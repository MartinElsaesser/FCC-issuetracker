module.exports = function (obj, fields) {
	obj = { ...obj };
	let filteredEntries = Object.entries(obj).filter(([key, val]) => {
		let isNotEmpty = val !== "";
		let validField = fields.includes(key);
		return isNotEmpty && validField;
	});
	return Object.fromEntries(filteredEntries);
}
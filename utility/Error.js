class AppError extends Error {
	constructor(data, status) {
		super();
		this.data = data;
		this.status = status;
	}
}

module.exports = AppError;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose.model("Project", new Schema({
	name: {
		type: String,
		required: true
	},
	issues: [{
		type: mongoose.Types.ObjectId,
		ref: "Issue"
	}],
}));
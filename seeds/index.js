const Project = require("../models/Project");
const Issue = require("../models/Issue");
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/issue-tracker");

let projectD = {
	name: "apitest",
	issues: [],
};
let issuesD = [
	{
		issue_title: "Sudoku solver",
		issue_text: "Algorithm not working correctly",
		created_by: "Martin",
	},
	{
		issue_title: "Issue tracker",
		issue_text: "REST not finished",
		created_by: "Martin",
		assigned_to: "Martin",
		status_text: "work in progress"
	},
	{
		issue_title: "Todo app",
		issue_text: "Items don't appear",
		created_by: "Martin",
		assigned_to: "Martin",
		status_text: "work in progress",
		open: false
	},
]

!async function () {
	await Project.deleteMany({});
	await Issue.deleteMany({});
	let issues = await Issue.insertMany(issuesD);
	let issuesIds = issues.map(isu => isu._id);
	projectD.issues.push(...issuesIds);
	let project = await Project.create(projectD);
	mongoose.disconnect();
}()
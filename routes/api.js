'use strict';
const Project = require("../models/Project");
const Issue = require("../models/Issue");
const wrap = require("../utility/wAsync");
const AppError = require("../utility/Error");
const validateBody = require("../utility/validateBody");
const mongoose = require("mongoose");

module.exports = function (app) {

	app.get("/", function (req, res) {
		res.sendFile(__dirname + "/../views/index.html");
	});

	app.route('/api/issues/:project')

		.get(wrap(async function (req, res) {
			let project = req.params.project;
			let filter = req.query;
			// eiter get existing project
			let responseArr = [];
			const pData = await Project.findOne({ name: project }).populate({
				path: 'issues',
				match: filter,
			});
			if (pData) responseArr = pData.issues;
			// or create new project
			else await Project.create({ name: project });
			res.json(responseArr);
		}))
		.post(wrap(async function (req, res) {
			let pName = req.params.project;
			let body = req.body;
			if (!body.issue_title || !body.issue_text || !body.created_by) {
				throw new AppError({ error: "required field(s) missing" }, 200)
			}
			let issue = await Issue.create(body);
			let project = await Project.findOne({ name: pName });
			if (!project) project = await Project.create({ name: pName });
			project.issues.push(issue._id);
			project.save();
			res.json(issue.toObject({ versionKey: false }));
		}))
		.put(wrap(async function (req, res) {
			let fields = ["issue_title", "issue_text", "created_by", "assigned_to", "status_text", "open", "_id"];
			let pName = req.params.project;

			// parse body
			let body = validateBody(req.body, fields);
			if (!body._id)
				throw new AppError({ error: "missing _id" }, 200);
			else if (Object.keys(body).length < 2)
				throw new AppError({ error: "no update field(s) sent", "_id": _id }, 200);
			if (body.open === "false") body.open = false;
			else body.open = true;
			body.updated_on = Date.now();

			let project = await Project.findOne({ name: pName }).populate({
				path: 'issues',
				match: { _id: body._id },
			});
			if (!project || !project.issues.length) {
				throw new AppError({ error: "could not update", "_id": body._id }, 200);
			}

			try {
				let issue = await Issue.findByIdAndUpdate(body._id, body, { new: true });
				res.json({ result: "successfully updated", "_id": issue._id })
			} catch (error) {
				throw new AppError({ error: "could not update", "_id": body._id }, 200)
			}
		}))
		.delete(wrap(async function (req, res) {
			let body = req.body
			if (!body._id)
				throw new AppError({ error: "missing _id" }, 200);

			let pName = req.params.project;
			let project = await Project.findOne({ name: pName }).populate("issues");
			if (!project || !project.issues.length) {
				throw new AppError({ error: "could not delete", "_id": body._id }, 200);
			}

			try {
				let id;
				project.issues = project.issues.filter(i => {
					if (i._id.toString() === body._id) {
						i.remove();
						id = i._id.toString();
						return false;
					}
					return true;
				});
				await project.save();
				if (!id) throw Error();
				res.json({ result: "successfully deleted", "_id": id })
			} catch (error) {
				throw new AppError({ error: "could not delete", "_id": body._id }, 200);
			}
		}));

};

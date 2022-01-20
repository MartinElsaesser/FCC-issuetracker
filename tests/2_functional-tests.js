const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let id;

suite('Functional Tests', function () {
	test('POST /api/issues/{project} ever field', function (done) {
		let data = {
			issue_title: "New",
			issue_text: "lorem",
			created_by: "x",
			assigned_to: "y",
			status_text: "status"
		}
		chai
			.request(server)
			.post('/api/issues/apitest')
			.type("form")
			.send(data)
			.end(function (err, res) {
				let response = res.body;
				assert.equal(response.issue_title, data.issue_title, "title");
				assert.equal(response.issue_text, data.issue_text, "text");
				assert.equal(response.created_by, data.created_by, "created by");
				assert.equal(response.assigned_to, data.assigned_to, "assigned to");
				assert.equal(response.status_text, data.status_text, "status text");
				assert.equal(response.open, true, "open");
				assert.isDefined(response._id, "Id");
				assert.isDefined(response.created_on, "created");
				assert.isDefined(response.updated_on, "updated");
				id = response._id;
				done();
			});
	});
	test('POST /api/issues/{project} minimum fields', function (done) {
		let data = {
			issue_title: "New",
			issue_text: "lorem",
			created_by: "x",
		}
		chai
			.request(server)
			.post('/api/issues/apitest')
			.type("form")
			.send(data)
			.end(function (err, res) {
				let response = res.body;
				assert.equal(response.issue_title, data.issue_title, "title");
				assert.equal(response.issue_text, data.issue_text, "text");
				assert.equal(response.created_by, data.created_by, "created by");
				assert.equal(response.assigned_to, "", "assigned to");
				assert.equal(response.status_text, "", "status text");
				assert.equal(response.open, true, "open");
				assert.isDefined(response._id, "Id")
				assert.isDefined(response.created_on, "created")
				assert.isDefined(response.updated_on, "updated")
				done();
			});
	});
	test('POST /api/issues/{project} missing fields', function (done) {
		chai
			.request(server)
			.post('/api/issues/apitest')
			.type("form")
			.send({})
			.end(function (err, res) {
				assert.deepEqual(res.body, { error: 'required field(s) missing' }, "error");
				done();
			});
	});
	test('GET /api/issues/{project} view issues', function (done) {
		chai
			.request(server)
			.get('/api/issues/apitest')
			.type("form")
			.send({})
			.end(function (err, res) {
				assert.equal(res.status, 200, "status code")
				assert.isArray(res.body, "is array");
				done();
			});
	});
	test('GET /api/issues/{project} filter', function (done) {
		chai
			.request(server)
			.get('/api/issues/apitest?open=true')
			.type("form")
			.send({})
			.end(function (err, res) {
				res.body.forEach(issue => {
					assert.equal(issue.open, true, "issue open")
				});
				done();
			});
	});
	test('GET /api/issues/{project} multiple filters', function (done) {
		chai
			.request(server)
			.get('/api/issues/apitest?open=false&created_by=Martin')
			.type("form")
			.send({})
			.end(function (err, res) {
				res.body.forEach(issue => {
					assert.equal(issue.created_by, "Martin", "created by Martin")
					assert.equal(issue.open, false, "issue open")
				});
				done();
			});
	});
	test('PUT /api/issues/{project} one field', function (done) {
		let data = {
			_id: id,
			open: false,
		}
		chai
			.request(server)
			.put('/api/issues/apitest')
			.type("form")
			.send(data)
			.end(function (err, res) {
				assert.deepEqual(res.body, { result: 'successfully updated', _id: id })
				done();
			});
	});
	test('PUT /api/issues/{project} multiple fields', function (done) {
		let data = {
			_id: id,
			assigned_to: "Gustav",
			issue_text: "lorem lorem",
		}
		chai
			.request(server)
			.put('/api/issues/apitest')
			.type("form")
			.send(data)
			.end(function (err, res) {
				assert.deepEqual(res.body, { result: 'successfully updated', _id: id })
				done();
			});
	});
	test('PUT /api/issues/{project} missing id', function (done) {
		let data = {
			assigned_to: "Gustav",
			issue_text: "lorem lorem",
		}
		chai
			.request(server)
			.put('/api/issues/apitest')
			.type("form")
			.send(data)
			.end(function (err, res) {
				assert.deepEqual(res.body, { error: "missing _id" })
				done();
			});
	});
	test('PUT /api/issues/{project} missing fields', function (done) {
		let data = {
			_id: id
		}
		chai
			.request(server)
			.put('/api/issues/apitest')
			.type("form")
			.send(data)
			.end(function (err, res) {
				assert.deepEqual(res.body, { error: "no update field(s) sent", _id: id })
				done();
			});
	});
	test('PUT /api/issues/{project} invalid id', function (done) {
		let id = "ldasfdasf124"
		let data = {
			_id: id,
			assigned_to: "Gustav"
		}
		chai
			.request(server)
			.put('/api/issues/apitest')
			.type("form")
			.send(data)
			.end(function (err, res) {
				assert.deepEqual(res.body, { error: "could not update", _id: id })
				done();
			});
	});
	test('DELETE /api/issues/{project}', function (done) {
		let data = {
			_id: id,
		}
		chai
			.request(server)
			.delete('/api/issues/apitest')
			.type("form")
			.send(data)
			.end(function (err, res) {
				assert.deepEqual(res.body, { result: "successfully deleted", _id: id })
				done();
			});
	});
	test('DELETE /api/issues/{project} invalid id', function (done) {
		let id = "ldasfdasf124"
		let data = {
			_id: id,
		}
		chai
			.request(server)
			.delete('/api/issues/apitest')
			.type("form")
			.send(data)
			.end(function (err, res) {
				assert.deepEqual(res.body, { error: "could not delete", _id: id })
				done();
			});
	});
	test('DELETE /api/issues/{project} missing data', function (done) {
		let id = "ldasfdasf124"
		chai
			.request(server)
			.delete('/api/issues/apitest')
			.type("form")
			.send({})
			.end(function (err, res) {
				console.log(res.body);
				assert.deepEqual(res.body, { error: "missing _id" })
				done();
			});
	});
});

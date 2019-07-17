const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DBNAME = 'ecologie-api';
const MONGODB_COLLEC = 'associations';

const { check, validationResult } = require('express-validator/check');
const configuration = require('../services/configuration');
const validation = require('../services/validation');
const MongoCli = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const router = require('express').Router();

const options = [{
	attribute: "email",
	validator: check('email')
		.trim().isEmail()
		.withMessage(validation.EMAIL)
}, {
	attribute: "name",
	validator: check('name')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "birthdate",
	validator: check('birthdate')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "identifier",
	validator: check('identifier')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "phone",
	validator: check('phone')
		.trim().isMobilePhone(configuration.SET_PHONE)
		.withMessage(validation.PHONE)
}, {
	attribute: "location",
	validator: check('location')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "state",
	validator: check('state')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}];

/**
 * @PUT | CREATE Association
 *
 * @Route("/associations")
 */
router.put('/', validation.validate(options), async function (request, response) {

	try {
		// Form data
		const data = request.body;

		// Form validation
		const errors = validationResult(request);
		if (!errors.isEmpty())
			return response.status(422)
				.json({ errors: errors.array() });

		// Connect to MongoDB
		const client = new MongoCli(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Build Association
		const association = {
			email: data.email,
			name: data.name,
			birthdate: data.birthdate,
			identifier: data.identifier,
			phone: data.phone,
			location: data.location,
			state: data.state,
			createdAt: Date.now()
		};

		// Insert Association
		await col.insertOne(association);

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json(association);

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @GET | READ Association
 *
 * @Route("/associations")
 */
router.get('/', async function (request, response) {
  
	try {
		// Connect to MongoDB
		const client = new MongoCli(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find All Associations
		const associations = await col.find().toArray();

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json(associations);

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @GET | READ Some Association
 *
 * @Route("/associations/criteria")
 */
router.get('/criteria', async function (request, response) {

	try {
		// Form data
		const criteria = request.body;

		// Connect to MongoDB
		const client = new MongoCli(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find Some Associations
		const users = await col.find(criteria).toArray();

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json(users);

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @GET | READ Association
 *
 * @Route("/associations/{id}")
 */
router.get('/:id', async function (request, response) {
  
	try {
		// Identifier
		const id = request.params.id;

		// Connect to MongoDB
		const client = new MongoCli(MONGODB_URI);
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find Association
		const association = await col.findOne({ _id: ObjectId(id) });
		if (association === null) {
			return response.status(404)
				.json({ message: "Association introuvable" });
		}

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json(association);

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @PATCH | UPDATE Association
 *
 * @Route("/associations/:id")
 */
router.patch('/:id', validation.validate(options), async function (request, response) {

	try {
		// Identifier
		const id = request.params.id;

		// Form data
		const data = request.body;

		// Form validation
		const errors = validationResult(request);
		if (!errors.isEmpty())
			return response.status(422)
				.json({ errors: errors.array() });

		// Connect to MongoDB
		const client = new MongoCli(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find Association
		const item = await col.findOne({ _id: ObjectId(id) });
		if (item === null)
			return response.status(404)
				.json({ message: "Association introuvable" });

		// Build Association
		const association = {
			email: data.email,
			name: data.name,
			birthdate: data.birthdate,
			identifier: data.identifier,
			phone: data.phone,
			location: data.location,
			state: data.state,
			createdAt: data.createdAt
		};

		// Update Association
		await col.updateOne({ _id: ObjectId(id) },
			{ $set: association });

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json(association);

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @DELETE | DELETE Association
 *
 * @Route("/associations/:id")
 */
router.delete('/:id', async function (request, response) {

	try {
		// Identifier
		const id = request.params.id;

		// Connect to MongoDB
		const client = new MongoCli(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find Association
		const association = await col.findOne({ _id: ObjectId(id) });
		if (association === null)
			return response.status(404)
				.json({ message: "Association introuvable" });

		// Delete Association
		await col.deleteOne({ _id: ObjectId(id) });

		// Close Connection
		client.close();

		// Response
		return response.status(200)
				.json({ message: "Une Association a été supprimé" });

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

module.exports = router;
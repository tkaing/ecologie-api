const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DBNAME = 'ecologie-api';
const MONGODB_COLLEC = 'events';

const { check, validationResult } = require('express-validator/check');
const configuration = require('../services/configuration');
const validation = require('../services/validation');
const MongoCli = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const router = require('express').Router();

const options = [{
	attribute: "name",
	validator: check('name')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "capacity",
	validator: check('capacity')
		.isInt()
		.withMessage(validation.INTEGER)
}, {
	attribute: "deadline",
	validator: check('deadline')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "startOn",
	validator: check('startOn')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "endOn",
	validator: check('endOn')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "location",
	validator: check('location')
		.trim().isLatLong()
		.withMessage(validation.LOCATION)
}];

/**
 * @PUT | CREATE Event
 *
 * @Route("/events")
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

		// Build Event
		const event = {
			name: data.name,
			capacity: data.capacity,
			deadline: data.deadline,
			startOn: data.startOn,
			endOn: data.endOn,
			categories: data.categories,
			location: data.location,
			createdAt: Date.now()
		};

		// Next fields
		// event.participants

		// Insert Note
		await col.insertOne(event);

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json({ event: event });

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @GET | READ All Event
 *
 * @Route("/events")
 */
router.get('/', async function (request, response) {
  
	try {
		// Connect to MongoDB
		const client = new MongoCli(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find All Events
		const events = await col.find().toArray();

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json(events);

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @GET | READ Some Events
 *
 * @Route("/events/criteria")
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

		// Find Some Events
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
 * @GET | READ Event
 *
 * @Route("/events/{id}")
 */
router.get('/:id', async function (request, response) {
  
	try {
		// Identifier
		const id = request.params.id;

		// Connect to MongoDB
		const client = new MongoCli(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find Event
		const event = await col.findOne({ _id: ObjectId(id) });
		if (event === null) {
			return response.status(422)
				.json({ message: "Evénement introuvable" });
		}

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json(event);

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @PATCH | UPDATE Event
 *
 * @Route("/events/:id")
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

		// Find Event
		const item = await col.findOne({ _id: ObjectId(id) });
		if (item === null)
			return response.status(404)
				.json({ message: "Événement introuvable" });

		// Build Event
		const event = {
			name: data.name,
			capacity: data.capacity,
			deadline: data.deadline,
			startOn: data.startOn,
			endOn: data.endOn,
			categories: data.categories,
			location: data.location,
			createdAt: data.createdAt
		};

		// Update Event
		await col.updateOne({ _id: ObjectId(id) },
			{ $set: event });

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json(user);

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @DELETE | DELETE Event
 *
 * @Route("/events/:id")
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

		// Find Event
		const event = await col.findOne({ _id: ObjectId(id) });
		if (event === null)
			return response.status(422)
				.json({ message: "Événement introuvable" });

		// Delete Event
		await col.deleteOne({ _id: ObjectId(id) });

		// Close Connection
		client.close();

		// Response
		return response.status(200)
				.json({ message: "Un événement a été supprimé" });

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

module.exports = router;

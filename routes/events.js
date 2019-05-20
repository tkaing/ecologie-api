var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
var MONGODB_DBNAME = 'ecologie-api';
var MONGODB_COLLEC = 'events';

var { check, validationResult } = require('express-validator/check');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var express = require('express');
var router = express.Router();

/**
 * @PUT | CREATE Event
 *
 * @Route("/events")
 */
router.put('/', [
	// name
	check('name', 'Ce champ ne peut pas rester vide.')
	.not().isEmpty(),
	// capacity
	check('capacity', 'Ce champ doit contenir que des chiffres.')
	.isInt(),
	// registration deadline
	check('deadline', 'Ce champ doit être un timestamp.')
	.custom((value) => (new Date(parseInt(value))).getTime() > 0),
	// start on...
	check('startOn', 'Ce champ doit être un timestamp.')
	.custom((value) => (new Date(parseInt(value))).getTime() > 0),
	// end on...
	check('endOn', 'Ce champ doit être un timestamp.')
	.custom((value) => (new Date(parseInt(value))).getTime() > 0),
	// categories
	check('categories', 'Ce champ doit être un tableau.')
	.isArray(),
	// location
	check('location', 'Ce champ doit être une paire de latitude/longitude.')
	.isLatLong(),

], async function(request, response) {

	try {
		// Form data
		var data = request.body;

		// Form validation
		var errors = validationResult(request);
		if (!errors.isEmpty())
			return response.status(422)
				.json({ errors: errors.array() });

		// Connect to MongoDB
		const client = new MongoClient(MONGODB_URI);
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Prepare Event Resources
		var deadline = new Date(parseInt(data.deadline));
		var startOn = new Date(parseInt(data.startOn));
		var endOn = new Date(parseInt(data.endOn));

		// Build Event
		var event = {
			name: data.name,
			capacity: parseInt(data.capacity),
			deadline: deadline.getTime(),
			startOn: startOn.getTime(),
			endOn: endOn.getTime(),
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
router.get('/', async function(request, response) {
  
	try {
		// Connect to MongoDB
		const client = new MongoClient(MONGODB_URI);
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find All Events
		var events = await col.find().toArray();

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
 * @GET | READ Event
 *
 * @Route("/events/{id}")
 */
router.get('/:id', async function(request, response) {
  
	try {
		
		var id = request.params.id;

		// Connect to MongoDB
		const client = new MongoClient(MONGODB_URI);
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find Event
		var event = await col.findOne({ _id: ObjectId(id) });
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
 * @DELETE | DELETE Event
 *
 * @Route("/events/:id")
 */
router.delete('/:id', async function(request, response) {

	try {

		var id = request.params.id;

		// Connect to MongoDB
		const client = new MongoClient(MONGODB_URI);
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find Event
		var event = await col.findOne({ _id: ObjectId(id) });
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

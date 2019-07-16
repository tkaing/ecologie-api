const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DBNAME = 'ecologie-api';
const MONGODB_COLLEC = 'courses';

const { check, validationResult } = require('express-validator/check');
const configuration = require('../services/configuration');
const validation = require('../services/validation');
const MongoCli = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const router = require('express').Router();

const options = [{
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
* @PUT | CREATE Course
*
* @Route("/course")
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
			const client = new MongoCli(MONGODB_URI);
			await client.connect();

			// Move to database and collection
			const dbi = client.db(MONGODB_DBNAME);
			const col = dbi.collection(MONGODB_COLLEC);

			// Build Course
			const course = {
				startOn: startOn.getTime(),
				endOn: endOn.getTime(),
				location: data.location,
				createdAt: Date.now(),
				address: data.address,
				zip: data.zip,
				city: data.city,
				rating: data.rating,
				glassWeast: data.glassWeast,
				plasticWeast: data.plasticWeast,
				foodWeast:data.foodWeast,
				otherWeast:data.otherWeast,
				name: data.name
			};

			// Next fields
			// course: participants

			// Insert course
			await col.insertOne(course);

			// Response
			return response.status(200)
				.json({ course: course });

		} catch (e) {
			return response.status(500)
				.json({ stacktrace: e.stack });
		}
	});

/**
 * @GET | READ All Courses
 *
 * @Route("/course")
 */
router.get('/', async function (request, response) {
  
	try {
		// Connect to MongoDB
		const client = new MongoCli(MONGODB_URI);
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find All Events
		const courses = await col.find().toArray();

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json(courses);

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @GET | READ Some Courses
 *
 * @Route("/courses/criteria")
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

		// Find Some Courses
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
 * @GET | READ Course
 *
 * @Route("/courses/{id}")
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

		// Find Course
		const course = await col.findOne({ _id: ObjectId(id) });
		if (course === null) {
			return response.status(404)
				.json({ message: "Parcours introuvable" });
		}

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json(course);

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @PATCH | UPDATE Course
 *
 * @Route("/courses/:id")
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

		// Find Course
		const item = await col.findOne({ _id: ObjectId(id) });
		if (item === null) {
			return response.status(404)
				.json({ message: "Parcours introuvable" });
		}

		// Build
		const course = {
			startOn: data.start,
			endOn: data.end,
			theme: data.theme,
			location: data.location
		};

		// Update Association
		await col.updateOne({ _id: ObjectId(id) },
			{ $set: course });

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json(course);

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @DELETE | DELETE Course
 *
 * @Route("/course/:id")
 */
router.delete('/:id', async function (request, response) {

	try {
		// Identifier
		const id = request.params.id;

		// Connect to MongoDB
		const client = new MongoCli(MONGODB_URI);
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find Event
		const event = await col.findOne({ _id: ObjectId(id) });
		if (event === null) {
			return response.status(404)
				.json({ message: "Parcours introuvable" });
		}

		// Delete Event
		await col.deleteOne({ _id: ObjectId(id) });

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json({ message: "Un parcours a été supprimé" });

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

module.exports = router;

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
	attribute: "name",
	validator: check('name')
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
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "rating",
	validator: check('rating')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "address",
	validator: check('address')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "zip",
	validator: check('zip')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "city",
	validator: check('city')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "glassWaste",
	validator: check('glassWaste')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "plasticWaste",
	validator: check('plasticWaste')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "foodWaste",
	validator: check('foodWaste')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "otherWaste",
	validator: check('otherWaste')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}, {
	attribute: "association",
	validator: check('association')
		.trim().not().isEmpty()
		.withMessage(validation.NOT_BLANK)
}];

/**
 * @GET | find
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
* @PUT | create
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
				name: data.name,
				startOn: data.startOn,
				endOn: data.endOn,
				location: data.location,
				address: data.address,
				zip: data.zip,
				city: data.city,
				rating: data.rating,
				glassWaste: parseInt(data.glassWaste),
				plasticWaste: parseInt(data.plasticWaste),
				foodWaste: parseInt(data.foodWaste),
				otherWaste: parseInt(data.otherWaste),
				association: data.association,
				createdAt: Date.now()
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
 * @PATCH | update
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
			name: data.name,
			startOn: data.startOn,
			endOn: data.endOn,
			location: data.location,
			address: data.address,
			zip: data.zip,
			city: data.city,
			rating: data.rating,
			glassWaste: parseInt(data.glassWaste),
			plasticWaste: parseInt(data.plasticWaste),
			foodWaste: parseInt(data.foodWaste),
			otherWaste: parseInt(data.otherWaste),
			association: data.association
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
 * @DELETE | remove
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

/**
 * @GET | findAll
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
 * @POST | findBy criteria
 *
 * @Route("/courses/criteria")
 */
router.post('/criteria', async function (request, response) {

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
		const courses = await col.find(criteria).toArray();

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
 * @POST | findBy association
 *
 * @Route("/courses/association")
 */
router.post('/association', async function (request, response) {

	try {
		// Form data
		const idAssociation = request.body;

		// Connect to MongoDB
		const client = new MongoCli(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find Some Courses
		const courses = await col.find(idAssociation).toArray();

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

module.exports = router;

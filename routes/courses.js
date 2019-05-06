var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
var MONGODB_DBNAME = 'ecologie-api';
var MONGODB_COLLEC = 'associations';

var { check, validationResult } = require('express-validator/check');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var express = require('express');
var router = express.Router();



/**
* @PUT | CREATE Course
*
* @Route("/course")
*/

router.put('/', [
	//startOn
	check('startOn', 'Ce champ doit être un timestamp.')
	.custom((value) => (new Date(parseInt(value))).getTime() > 0),
	//endOn
	check('endOn', 'Ce champ doit être un timestamp.')
	.custom((value) => (new Date(parseInt(value))).getTime() > 0),
	//location
	check('location', 'Ce champ doit être une paire de latitude/longitude.')
	.isLatLong(),
	//Theme
	check('theme', 'Ce champ ne peut pas rester vide.')
	.not().isEmpty(),

	], async function(request, response) {
		try {
			// Form data
			var data = request.body;

			//Form validation
			var errors = validationResult(request);
			if (!errors.isEmpty())
				return response.status(422)
					.json({ errors: errors.array() });

			// Connect to MongoDB
			const client = new MongoClient(MONGODB_URL);
			await client.connect();

			//Move to database and collection
			const dbi = client.db(MONGODB_DBNAME);
			const col = dbi.collection(MONGODB_COLLEC);

			// Prepare Course Resources
			var startOn = new Date(parseInt(data.startOn));
			var endOn = new Date(parseInt(data.endOn));

			// Build Course
			var course = {
				startOn: startOn.getTime(),
				endOn: endOn.getTime(),
				location: data.location,
				createdAt: Date.now(),
				theme: data.theme
			}

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
 * @GET | READ Course
 *
 * @Route("/course")
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
		var courses = await col.find().toArray();

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.render('courses/courses', { courses: courses });

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
				.json({ message: "Course introuvable" });

		// Delete Event
		await col.deleteOne({ _id: ObjectId(id) });

		// Close Connection
		client.close();

		// Response
		return response.status(200)
				.json({ message: "Une course a été supprimé" });

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

module.exports = router;

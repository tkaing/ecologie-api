var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
var MONGODB_DBNAME = 'ecologie-api';
var MONGODB_COLLEC = 'associations';

var { check, validationResult } = require('express-validator/check');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var express = require('express');
var router = express.Router();

/**
 * @PUT | CREATE Association
 *
 * @Route("/associations")
 */
router.put('/', [
	// email
	check('email', "Ceci n'est pas une adresse valide.")
		.isEmail(),
	// name
	check('name', "Ce champ ne peut pas rester vide.")
		.not().isEmpty(), 
	// birthdate
	check('birthdate', 'ce champ doit être un timestamp')
		.custom((value) => (new Date(parseInt(value))).getTime() > 0), 
	// identifier (national id)
	check('identifier', "Ce champ ne peut pas rester vide.")
		.not().isEmpty(), 
	// phone
	check('phone', "Ceci n'est pas une adresse email valide.")
		.not().isEmpty(),
	// location
	check('location', 'Ce champ doit être une paire latitude/longitude.')
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
		const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);
		
		// Prepare Association Resources
		var birthdate = parseInt(data.birthdate);
		var createdAt = parseInt((Date.now()) / 1000);

		// Build Association
		var association = {
			email: data.email,
			name: data.name,
			birthdate: birthdate,
			identifier: data.identifier,
			phone: data.phone,
			location: data.location,
			createdAt: createdAt
		};

		// Insert Association
		await col.insertOne(association);

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json({ association: association });

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
router.get('/', async function(request, response) {
  
	try {
		// Connect to MongoDB
		const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find All Associations
		var associations = await col.find().toArray();

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json(associations);
		// return response.status(200)
		// 	.render('associations/associations', { associations: associations });

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
router.delete('/:id', async function(request, response) {

	try {

		var id = request.params.id;

		// Connect to MongoDB
		const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find Association
		var association = await col.findOne({ _id: ObjectId(id) });
		if (association === null)
			return response.status(422)
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

var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
var MONGODB_DBNAME = 'ecologie-api';
var MONGODB_COLLEC = 'users';

var { check, validationResult } = require('express-validator/check');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var express = require('express');
var router = express.Router();

/**
 * @PUT | CREATE User
 *
 * @Route("/users")
 */
router.put('/', [
	// email
	check('email')
		.isEmail()
		.withMessage("Ceci n'est pas une adresse valide."),
	// firstname
	check('firstname')
		.not().isEmpty()
		.withMessage("Ce champ ne peut pas rester vide."), 
	// lastname
	check('lastname')
		.not().isEmpty()
		.withMessage("Ce champ ne peut pas rester vide."), 

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

		// Build User
		var user = {
			email: data.email,
			firstname: data.firstname,
			lastname: data.lastname
		};
		
		// user.birthdate
		// user.phone
		// user.addressLongitude
		// user.addressLatitude
		// user.createdAt

		// Insert Note
		await col.insertOne(user);

		// Close Connection
		client.close();

		// Response
		return response.status(200)
			.json({ user: user });

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

/**
 * @GET | READ All User
 *
 * @Route("/users")
 */
router.get('/', async function(request, response) {
  
	try {
		// Connect to MongoDB
		const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find All Users
		var users = await col.find().toArray();

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
 * @GET | READ User
 *
 * @Route("/users/{id}")
 */
router.get('/:id', async function(request, response) {
  
	try {
		
		var id = request.params.id;

		// Connect to MongoDB
		const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true });
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Find User
		var user = await col.findOne({ _id: ObjectId(id) });
		if (user === null) {
			return response.status(422)
				.json({ message: "Utilisateur introuvable" });
		}

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
 * @DELETE | DELETE User
 *
 * @Route("/users/:id")
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

		// Find User
		var user = await col.findOne({ _id: ObjectId(id) });
		if (user === null)
			return response.status(422)
				.json({ message: "Utilisateur introuvable" });

		// Delete User
		await col.deleteOne({ _id: ObjectId(id) });

		// Close Connection
		client.close();

		// Response
		return response.status(200)
				.json({ message: "Un utilisateur a été supprimé" });

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});

module.exports = router;

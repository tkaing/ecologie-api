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
	check('email')
		.isEmail()
		.withMessage("Ceci n'est pas une adresse valide."),
	// name
	check('name')
		.not().isEmpty()
		.withMessage("Ce champ ne peut pas rester vide."), 
			// name
	check('birthdate')
	.not().isEmpty()
	.withMessage("Ce champ ne peut pas rester vide."), 
	// identifier (national id)
	check('identifier')
		.not().isEmpty()
		.withMessage("Ce champ ne peut pas rester vide."), 
	// email
	check('phone')
		.not().isEmpty()
		.withMessage("Ceci n'est pas une adresse email valide."),
	// name
	check('addressLongitude')
		.not().isEmpty()
		.withMessage("Ce champ ne peut pas rester vide."), 
	// identifier (national id)
	check('addressLatitude')
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
		const client = new MongoClient(MONGODB_URI);
		await client.connect();

		// Move to database and collection
		const dbi = client.db(MONGODB_DBNAME);
		const col = dbi.collection(MONGODB_COLLEC);

		// Build Association
		var association = {
			email: data.email,
			name: data.name,
			birthdate: data.birthdate,
			identifier: data.identifier,
			phone:data.phone,
			addressLongitude: data.addressLongitude,
			addressLatitude: data.addressLatitude,
			createdAt: dateNow()
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
		const client = new MongoClient(MONGODB_URI);
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
			.render('associations/associations', { associations: associations });

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
		const client = new MongoClient(MONGODB_URI);
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
				.json({ message: "Uns Association a été supprimé" });

	} catch (e) {
		// This will eventually be handled
		// ... by your error handling middleware
		return response.status(500)
			.json({ stacktrace: e.stack });
	}
});
function formatDigits(number){
    if(number < 10) {
        number = ('0' + number);
    }
    return number;
}
function dateNow(){
    var dateNow = new Date();
    var day = dateNow.getDate();
    var month = dateNow.getMonth();
    var year = dateNow.getFullYear();
    var hour = dateNow.getHours();
    var minutes = dateNow.getMinutes();
    var seconds = dateNow.getSeconds();
    month += 1;
    const dateFormatted = formatDigits(day) + '/' + formatDigits(month) + '/' + year + ' ' + formatDigits(hour) + ':' + formatDigits(minutes) + ':' + formatDigits(seconds);
    return dateFormatted;
}



module.exports = router;

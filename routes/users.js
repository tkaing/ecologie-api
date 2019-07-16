const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DBNAME = 'ecologie-api';
const MONGODB_COLLEC = 'users';

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
    attribute: "firstname",
    validator: check('firstname')
        .trim().not().isEmpty()
        .withMessage(validation.NOT_BLANK)
}, {
    attribute: "lastname",
    validator: check('lastname')
        .trim().not().isEmpty()
        .withMessage(validation.NOT_BLANK)
}, {
    attribute: "birthdate",
    validator: check('birthdate')
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
        .trim().isLatLong()
        .withMessage(validation.LOCATION)
}];

/**
 * @PUT | CREATE User
 *
 * @Route("/users")
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

        // Build User
        const user = {
            email: data.email,
            firstname: data.firstname,
            lastname: data.lastname,
            birthdate: data.birthdate,
            phone: data.phone,
            location: data.location,
            createdAt: Date.now()
        };

        // Insert User
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
router.get('/', async function (request, response) {

    try {
        // Connect to MongoDB
        const client = new MongoCli(MONGODB_URI, { useNewUrlParser: true });
        await client.connect();

        // Move to database and collection
        const dbi = client.db(MONGODB_DBNAME);
        const col = dbi.collection(MONGODB_COLLEC);

        // Find All Users
        const users = await col.find().toArray();

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
 * @GET | READ Some Users
 *
 * @Route("/users/criteria")
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

        // Find Some Users
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
 * @GET | READ User
 *
 * @Route("/users/{id}")
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

        // Find User
        const user = await col.findOne({ _id: ObjectId(id) });
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
 * @PATCH | UPDATE User
 *
 * @Route("/users/:id")
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

        // Find User
        const item = await col.findOne({ _id: ObjectId(id) });
        if (item === null)
            return response.status(404)
                .json({ message: "Utilisateur introuvable" });

        // Build User
        const user = {
            email: data.email,
            firstname: data.firstname,
            lastname: data.lastname,
            birthdate: data.birthdate,
            phone: data.phone,
            location: data.location,
            createdAt: data.createdAt,
        };

        // Update User
        await col.updateOne({ _id: ObjectId(id) },
            { $set: user });

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

        // Find User
        const user = await col.findOne({ _id: ObjectId(id) });
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

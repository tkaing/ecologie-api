const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DBNAME = 'ecologie-api';
const MONGODB_COLLEC = 'members';

const { check, validationResult } = require('express-validator/check');
const configuration = require('../services/configuration');
const validation = require('../services/validation');
const password = require('../services/password');
const MongoCli = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const CryptoJS = require('crypto-js');
const router = require('express').Router();

const options = [{
    attribute: "email",
    validator: check('email')
        .trim().isEmail()
        .withMessage(validation.EMAIL)
}, {
    attribute: "role",
    validator: check('role')
        .trim().not().isEmpty()
        .withMessage(validation.NOT_BLANK)
}, {
    attribute: "association",
    validator: check('association')
        .trim().not().isEmpty()
        .withMessage(validation.NOT_BLANK)
}];

/**
 * @PUT | CREATE Member
 *
 * @Route("/members")
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

        // Generate Password
        const source = password.generate();
        const encrypted = CryptoJS.AES.encrypt(source, password.SECRET);
        const decrypted = CryptoJS.AES.decrypt(encrypted, password.SECRET);

        // Build Member
        const member = {
            email: data.email,
            role: data.role,
            association: data.association,
            password: encrypted.toString(),
            createdAt: Date.now()
        };

        // Insert Member
        await col.insertOne(member);

        // Close Connection
        client.close();

        // Response
        return response.status(200)
            .json({ member: member, code: decrypted.toString() });

    } catch (e) {
        // This will eventually be handled
        // ... by your error handling middleware
        return response.status(500)
            .json({ stacktrace: e.stack });
    }
});

/**
 * @GET | READ All Member
 *
 * @Route("/members")
 */
router.get('/', async function (request, response) {

    try {
        // Connect to MongoDB
        const client = new MongoCli(MONGODB_URI, { useNewUrlParser: true });
        await client.connect();

        // Move to database and collection
        const dbi = client.db(MONGODB_DBNAME);
        const col = dbi.collection(MONGODB_COLLEC);

        // Find All Members
        const members = await col.find().toArray();

        // Close Connection
        client.close();

        // Response
        return response.status(200)
            .json(members);

    } catch (e) {
        // This will eventually be handled
        // ... by your error handling middleware
        return response.status(500)
            .json({ stacktrace: e.stack });
    }
});

/**
 * @POST | READ Some Members
 *
 * @Route("/members/login")
 */
router.post('/login', async function (request, response) {

    try {
        // Form data
        const criteria = request.body;

        // Connect to MongoDB
        const client = new MongoCli(MONGODB_URI, { useNewUrlParser: true });
        await client.connect();

        // Move to database and collection
        const dbi = client.db(MONGODB_DBNAME);
        const col = dbi.collection(MONGODB_COLLEC);

        // Find User
        const member = await col.findOne({ email: criteria.email });
        if (member === null) {
            return response.status(422)
                .json({ message: "Membre introuvable" });
        }

        // Check Password
        const bytes = CryptoJS.AES.decrypt(member.password, password.SECRET);
        if (bytes.toString() !== criteria.password) {
            return response.status(401)
                .json({ message: "Mot de passe incorrect" });
        }

        // Close Connection
        client.close();

        // Response
        return response.status(200)
            .json(member);

    } catch (e) {
        // This will eventually be handled
        // ... by your error handling middleware
        return response.status(500)
            .json({ stacktrace: e.stack });
    }
});

/**
 * @GET | READ Some Members
 *
 * @Route("/members/criteria")
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

        // Find Some Members
        const members = await col.find(criteria).toArray();

        // Close Connection
        client.close();

        // Response
        return response.status(200)
            .json(members);

    } catch (e) {
        // This will eventually be handled
        // ... by your error handling middleware
        return response.status(500)
            .json({ stacktrace: e.stack });
    }
});

/**
 * @GET | READ Member
 *
 * @Route("/members/{id}")
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

        // Find Member
        const member = await col.findOne({ _id: ObjectId(id) });
        if (member === null) {
            return response.status(422)
                .json({ message: "Membre introuvable" });
        }

        // Close Connection
        client.close();

        // Response
        return response.status(200)
            .json(member);

    } catch (e) {
        // This will eventually be handled
        // ... by your error handling middleware
        return response.status(500)
            .json({ stacktrace: e.stack });
    }
});

/**
 * @PATCH | UPDATE Member
 *
 * @Route("/members/:id")
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

        // Find Member
        const item = await col.findOne({ _id: ObjectId(id) });
        if (item === null)
            return response.status(404)
                .json({ message: "Membre introuvable" });

        // Build Member
        const member = {
            email: data.email,
            role: data.role,
            association: data.association,
            password: data.password,
            createdAt: data.createdAt
        };

        // Update Member
        await col.updateOne({ _id: ObjectId(id) },
            { $set: member });

        // Close Connection
        client.close();

        // Response
        return response.status(200)
            .json(member);

    } catch (e) {
        // This will eventually be handled
        // ... by your error handling middleware
        return response.status(500)
            .json({ stacktrace: e.stack });
    }
});

/**
 * @DELETE | DELETE Member
 *
 * @Route("/members/:id")
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

        // Find Member
        const member = await col.findOne({ _id: ObjectId(id) });
        if (member === null)
            return response.status(422)
                .json({ message: "Membre introuvable" });

        // Delete Member
        await col.deleteOne({ _id: ObjectId(id) });

        // Close Connection
        client.close();

        // Response
        return response.status(200)
            .json({ message: "Un membre a été supprimé" });

    } catch (e) {
        // This will eventually be handled
        // ... by your error handling middleware
        return response.status(500)
            .json({ stacktrace: e.stack });
    }
});

module.exports = router;

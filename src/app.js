import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import Joi from "joi";
import { v4 as uuid } from "uuid";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const db = await connectToDatabase();
const usersCollection = db.collection("users");
const postsCollection = db.collection("posts");
const sessionsCollection = db.collection("sessions");

app.post("/sign-up", async (req, res) => {
	const user = req.body;

	const schema = Joi.object({
		name: Joi.string().min(2).required(),
		email: Joi.string().email().required(),
		password: Joi.string().min(8).required(),
	});

	const validation = schema.validate(user, { abortEarly: false });

	if (validation.error) {
		const errors = validation.error.details.map(
			(details) => details.message
		);
		return res.status(422).send(errors);
	}

	try {
		const userExists = await usersCollection.findOne({ email: user.email });

		if (userExists)
			return res.status(409).send("E-mail already registered");

		const hashedPassword = bcrypt.hashSync(user.password, 10);

		await usersCollection.insertOne({ ...user, password: hashedPassword });
		return res.sendStatus(201);
	} catch (error) {
		console.log(error);
		return res.status(500).send("server error!");
	}
});

app.post("/sign-in", async (req, res) => {
	const token = uuid();

	return res.send(token);
});

const PORT = process.env.PORT || 5151;
app.listen(PORT, function () {
	console.log(`server is running on port ${PORT}`);
});

async function connectToDatabase() {
	const mongoClient = new MongoClient(process.env.MONGO_URI);
	await mongoClient.connect();
	console.log("connected to mongodb");
	const db = await mongoClient.db("my-blog-api");
	console.log("connected to database");
	return db;
}

// --- LIST OF STATUS CODES
// 200: Ok => Significa que deu tudo certo com a requisição
// 201: Created => Sucesso na criação do recurso
// 301: Moved Permanently => Significa que o recurso que você está tentando acessar foi movido pra outra URL
// 401: Unauthorized => Significa que você não tem acesso a esse recurso
// 404: Not Found => Significa que o recurso pedido não existe
// 409: Conflict => Significa que o recurso que você está tentando inserir já foi inserido
// 422: Unprocessable Entity => Significa que a requisição enviada não está no formato esperado
// 500: Internal Server Error => Significa que ocorreu algum erro desconhecido no servidor

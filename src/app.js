import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";

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

	try {
		const userExists = await usersCollection.findOne({ email: user.email });
		console.log(userExists);
		if (userExists)
			return res.status(409).send("E-mail already registered");

		const hashedPassword = bcrypt.hashSync(user.password, 10);
		console.log(hashedPassword);
	} catch (error) {}
});

const PORT = process.env.PORT || 5151;
app.listen(PORT, function () {
	console.log(`server is running on port ${PORT}`);
});

async function connectToDatabase() {
	const mongoClient = new MongoClient(process.env.MONGO_URI);
	await mongoClient.connect();
	console.log("connected to mongodb");
	const db = await mongoClient.db("my-api-uol");
	return db;
}

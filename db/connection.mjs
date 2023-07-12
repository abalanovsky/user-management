import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();
const connectionString = process.env.ATLAS_URI
const client = new MongoClient(connectionString);

let connection;
try {
    connection = await client.connect();
} catch(e) {
    console.error(e);
}

let db = connection.db("users");
export default db;

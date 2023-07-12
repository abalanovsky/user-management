import dotenv from 'dotenv';
import express from 'express';
import records from './routes/records.mjs';

dotenv.config();
const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use("/", records);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(process.env.MONGO_URI);

app.get('/', (req, res) => {
    res.send('Hello World');
    }
);

app.use('/auth', authRoutes);

app.listen(5000, () => {
    console.log('Server is running on port 5000');
    }
);
import express from  'express';
import dotenv from 'dotenv'
import { connectDB } from './config/db';

// Load environment variables
dotenv.config();

//connect to database
connectDB();

const app = express()
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

//start the server
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
import express, {Request, Response, NextFunction} from 'express';
import dotenv from 'dotenv'
import { connectDB } from './config/db';
import jobRoutes from './modules/job/job.routes';
import applicantRoutes from './modules/applicant/applicant.routes';
import screeningRoutes from "./modules/screening/screening.routes";

// Load environment variables from .env file
dotenv.config();

//connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Health Check Route
app.get("/health", (req:Request, res: Response) => {
    res.status(200).json({status: "ok", message: "Umurava Hire Lens API is running"});
});

//API Routes
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applicants", applicantRoutes);
app.use("/api/v1/screening", screeningRoutes);

//Error Handling
app.use((err: any, req:Request, res:Response, next:NextFunction) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "development" ? err.message: undefined,
    });
});

//start the server
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

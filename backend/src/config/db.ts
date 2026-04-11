import mongoose from 'mongoose';

export const connectDB = async () => {
    try{
        const mongoURI = process.env.MONGODB_URI; 

        if(!mongoURI){
            throw new Error("MONGODB_URI is not defined in the environment variables");
        }

        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch(error){
        console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
        process.exit(1); 
    }
};
import mongoose from 'mongoose';
import dotenv from "dotenv";
import { DB_NAME } from '../constants.js';


dotenv.config();
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect
        (`${process.env.MONGODB_URI}/${DB_NAME}`)
            console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);

    } catch(error) {
        console.log("MONGODB connection FAILED ",error);
      
    }
}

export default connectDB
import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const ConnectDB = async() =>{
    try{
        const connectInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
    }
    catch(error){
        console.log("Mongo connection failed ", error);
        process.exit(1);
    }
}

export default ConnectDB;
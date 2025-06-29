import dotenv from "dotenv"
import ConnectDB from "./db/index.js"
import {app} from "./app.js"

dotenv.config({
    path:"./.env"
})

const port = process.env.PORT || 8000;

ConnectDB()
.then(()=>{
    app.listen(port, ()=>{
        console.log("server is running on port: ", port);
    })
})
.catch((err)=>{
    console.log("Mongo_db connection failed: ", err);
})
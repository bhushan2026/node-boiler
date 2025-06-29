import express from "express"
import { upload } from "./middlewares/multer.middleware.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
import routes from "./routes/index.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(path.join(__dirname, "../public")));
app.use(cookieParser());

// Routes
app.use("/api/v1", routes);

app.get('/', (req, res)=>{
    res.send("Hello world!!!");
})

app.post('/', upload.single('image'), (req, res) => {
    console.log(req.file)
    res.send("post req")
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("ERROR: ", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    const errors = err.errors || [];
    
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export { app };


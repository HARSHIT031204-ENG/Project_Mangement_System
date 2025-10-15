import express from "express";
import cors from "cors"
import healthcheckroute from "./routes/healthroutes.js"
const app = express();

// basic configuration
app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true, limit : "16kb"}))
app.use(express.static("public"))

// cors 
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "HEAD", "PUT", "PATCH"],
    allowedHeaders: ["Authorization", "Content-Type"]
}))


app.use("/api/v1", healthcheckroute)

export default app;

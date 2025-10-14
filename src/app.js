import express from "express";
import cors from "cors"
const app = express();

// basic configuration
app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true, limit : "16kb"}))
app.use(express.static("public"))

// cors 
app.use(cors({
    origin: process.env.CORS_ORIGIN.split(",") || "http://localhost5173",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "HEAD", "PUT", "PATCH"],
    allowedHeaders: ["Authorization", "Content-Type"]
}))


app.get("/", (req, res) => {
  res.send("Hello brother ");
});

app.get("/home", (req, res) => {
  res.send("Hello home ");
});

export default app;

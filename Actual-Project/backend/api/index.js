import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";


// import uploadRoute from "./routes/upload.js";



const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
// app.use("/upload", uploadRoute);

app.listen(5000, () => console.log("Server running on port 5000"));

import express, { Request, Response } from "express";
import speechToText from "./speechToText";
import cors from "cors";
import "dotenv/config";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = express();

app.use(express.json({
  limit: "50mb",
}));

app.use(cors());

app.post("/speech-to-text", (req: Request, res: Response) => {
    speechToText(req, res);
});

app.get("/", (req, res) => {
    res.send("Speech to text is running");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
import express from "express";
import speechToText from "./speechToText.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json({
  limit: "50mb",
}));

app.post("/speech-to-text", (req, res) => {
    speechToText(req, res);
});

app.get("/", (req, res) => {
    res.send("Speech to text is running");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
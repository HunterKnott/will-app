import { Request, Response } from "express";
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY
});

export default async function speechToText(req: Request, res: Response) {
  const data = req.body;
  const audioBase64 = data?.audioUrl;

  if (!audioBase64) return res.status(422).send("No audio data was provided");

  try {
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const filePath = "./temp_audio.wav";
    fs.writeFileSync(filePath, audioBuffer);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      response_format: "text",
    });
    
    fs.unlinkSync(filePath);

    return res.send({ transcript: transcription });
  } catch (error) {
    console.error("Error converting speech to text: ", error);
    res.status(500).send("Internal Server Error");
  }
}

import { Request, Response } from "express";

export default async function speechToText(req: Request, res: Response) {
    const data = req.body;
    const audioUrl = data?.audioUrl;
    const audioConfig = data?.config;

    if (!audioUrl) return res.status(422).send("No audio URL was provided");
    if (!audioConfig) return res.status(422).send("No audio config was provided");

    try {
        const speechResult = await fetch("https://speech.googleapis.com/v1/speech:recognize", {
            method: "POST",
            body: JSON.stringify({
                audio: {
                    content: audioUrl
                },
                config: audioConfig,
            }),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-goog-api-key": `${process.env.EXPO_PUBLIC_GOOGLE_SPEECH_TO_TEXT_API_KEY}`,
            },
        }).then((response) => response.json());
        return res.send(speechResult);
    } catch (error) {
        console.error("Error converting speech to text: ", error);
        res.status(404).send(error);
        return error;
    }
};
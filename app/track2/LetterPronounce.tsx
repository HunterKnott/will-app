import { useEffect, useRef, useState } from "react";
import {
  Text,
  SafeAreaView,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { transcribeSpeech } from "@/app/utils/transcribeSpeech";
import { recordSpeech } from "@/app/utils/recordSpeech";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import useWebFocus from "@/hooks/useWebFocus";

export default function LetterPronounce() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [currentLetter, setCurrentLetter] = useState("");
  const [stars, setStars] = useState(0);
  const attemptsRef = useRef(0);
  const [transcribedSpeech, setTranscribedSpeech] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const isWebFocused = useWebFocus();
  const audioRecordingRef = useRef(new Audio.Recording());
  const webAudioPermissionsRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isWebFocused) {
      const getMicAccess = async () => {
        const permissions = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        webAudioPermissionsRef.current = permissions;
      };
      if (!webAudioPermissionsRef.current) getMicAccess();
    } else {
      if (webAudioPermissionsRef.current) {
        webAudioPermissionsRef.current
          .getTracks()
          .forEach((track) => track.stop());
        webAudioPermissionsRef.current = null;
      }
    }
  }, [isWebFocused]);

  useEffect(() => {
      Speech.speak("What is this letter's name?", { voice: "com.apple.ttsbundle.siri_Nicky_en-US_compact" });
  }, []);

  const pickRandomLetter = () => {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    setCurrentLetter(alphabet[randomIndex]);
  };

  const applyExceptions = (text: string) => {
    const exceptions: { [key: string]: string } = {
      "are": "R",
      "you": "U",
    };
    return exceptions[text.toLowerCase()] || text;
  }

  const handleSuccess = async () => {
    const successSound = new Audio.Sound();
    try {
      await successSound.loadAsync(require('@/assets/audio/right.mp3'));
      await successSound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }

    setStars((prev) => prev + 1);
    attemptsRef.current += 1;

    if (attemptsRef.current < 5) {
      pickRandomLetter();
    } else {
      // const completionSound = new Audio.Sound();
      // try {
      //   await completionSound.loadAsync(require('@/assets/audio/right.mp3'));
      //   await completionSound.playAsync();
      // } catch(error) {
      //   console.error("Error playing completion sound:", error);
      // }
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    await recordSpeech(
      audioRecordingRef,
      setIsRecording,
      !!webAudioPermissionsRef.current
    );
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      let speechTranscript = await transcribeSpeech(audioRecordingRef);
      speechTranscript = applyExceptions(speechTranscript?.trim() || "");
      const spokenText = speechTranscript?.trim().toUpperCase();
      setTranscribedSpeech(speechTranscript || "");

      if (spokenText === currentLetter) {
        handleSuccess();
      } else {
        const wrongSound = new Audio.Sound();
        try {
          await wrongSound.loadAsync(require('@/assets/audio/wrong.mp3'));
          await wrongSound.playAsync();
        } catch(error) {
          console.error("Error playing wrong sound:", error);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    pickRandomLetter();
  }, []);

  return (
    <SafeAreaView>
      <ScrollView className="p-5 h-full w-full">
        <View className="gap-10 h-full items-center justify-center flex-grow">
          <View className="flex flex-row gap-2">
            {Array.from({ length: stars }).map((_, index) => (
              <FontAwesome
                key={index}
                name="star"
                size={24}
                color="gold"
              />
            ))}
          </View>
          <Text className="text-9xl text-white">{currentLetter}</Text>
          <View className="bg-gray-300 w-full h-24 p-5 mb-5 rounded-md flex flex-row items-start justify-start">
            {isTranscribing ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text
                style={{
                  color: transcribedSpeech ? "#000" : "rgb(150,150,150)",
                }}
                className="text-base p-1 text-left w-full"
              >
                {transcribedSpeech ||
                  "Your transcribed text will be shown here"}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={{
              opacity: isRecording || isTranscribing ? 0.5 : 1,
            }}
            className="bg-red-500 w-20 h-20 mt-24 rounded-full flex items-center justify-center"
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={isRecording || isTranscribing}
          >
            {isRecording ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <FontAwesome name="microphone" size={40} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
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
import { useRouter } from 'expo-router';

export default function LetterName() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [currentLetter, setCurrentLetter] = useState("");
  const [usedLetters, setUsedLetters] = useState<string[]>([]);
  const [stars, setStars] = useState(0);
  const attemptsRef = useRef(0);
  const [transcribedSpeech, setTranscribedSpeech] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const isWebFocused = useWebFocus();
  const audioRecordingRef = useRef(new Audio.Recording());
  const webAudioPermissionsRef = useRef<MediaStream | null>(null);
  const router = useRouter();

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
      const playAudio = async () => {
        const sound = new Audio.Sound();
        try {
          await sound.loadAsync(require('@/assets/audio/LetterName.mp3'));
          await sound.playAsync();
        } catch (error) {
          console.error("Error playing audio:", error);
        }
      };
      playAudio();
  }, []);

  const pickRandomLetter = () => {
    if (usedLetters.length === alphabet.length) {
      setUsedLetters([]);
    }

    let remainingLetters = alphabet.filter(
      (letter) => !usedLetters.includes(letter)
    );

    const randomIndex = Math.floor(Math.random() * remainingLetters.length);
    const newLetter = remainingLetters[randomIndex];
  
    setUsedLetters((prev) => [...prev, newLetter]);
    setCurrentLetter(newLetter);
  };

  const applyExceptions = (text: string) => {
    const exceptions: { [key: string]: string } = {
      "bee": "B",
      "sea": "C",
      "gee": "G",
      "aye": "I",
      "jay": "J",
      "pea": "P",
      "pee": "P",
      "are": "R",
      "tea": "T",
      "you": "U",
      "why": "Y"
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
      console.log("Finished");
      router.push('../student');
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
      speechTranscript = applyExceptions(speechTranscript?.trim().toLowerCase() || "");
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
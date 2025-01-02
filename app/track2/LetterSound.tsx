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

export default function LetterSound() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
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
            await sound.loadAsync(require('@/assets/audio/LetterSound.mp3'));
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
        const patternExceptions: { [key: string]: { pattern: RegExp; replacement: string } } = {
          "pf+t": { pattern: /^pf+t$/i, replacement: "f" },
          "m+": { pattern: /^m+$/i, replacement: "m" },
          "s+": { pattern: /^s+$/i, replacement: "s" },
          "ps+t": { pattern: /^ps+t$/i, replacement: "s" },
          "s+h": { pattern: /^s+h$/i, replacement: "s" },
          "u[h]+": { pattern: /^u[h]+$/i, replacement: "u" },
          "k[s]+": { pattern: /^k[s]+$/i, replacement: "x" },
          "z+": { pattern: /^z+$/i, replacement: "z" }
        }

        const staticExceptions: { [key: string]: string } = {
          "buh": "b",
          "bye": "b",
          "de": "d",
          "duh": "d",
          "爹": "d",
          "eh": "e",
          "끝": "g",
          "guh": "g",
          "heh": "h",
          "huh": "h",
          "え": "i",
          "ええ": "i",
          "aye": "i",
          "ja": "j",
          "jeh": "j",
          "cheer": "j",
          "饿": "l",
          "la": "l",
          "blah": "l",
          "nuh": "n",
          "음": "n",
          "ねっ": "n",
          "ah": "o",
          "aw": "o",
          "oh": "o",
          "puh": "p",
          "滚": "q",
          "困": "q",
          "rah": "r",
          "ruh": "r",
          "ugh": "r",
          "tch": "t",
          "uh": "u",
          "what": "w",
        };

        const letterNormalizations: { [key: string]: { input: string[]; output: string } }[] = [
          { "a": { input: ["o"], output: "a" } },
          { "c": { input: ["k", "ㅋ", "看"], output: "c" } },
          { "j": { input: ["yeah"], output: "j" } },
          { "k": { input: ["c", "ㅋ", "看"], output: "k" } },
          { "y": { input: ["j", "yeah"], output: "y" } }
        ];

        const lowercaseText = text.toLowerCase();
        if (currentLetter) {
          const normalization = letterNormalizations.find(norm => currentLetter in norm);
          if (normalization) {
              const { input, output } = normalization[currentLetter];
              if (input.includes(lowercaseText)) {
                  return output;
              }
          }
        }

        for (const [_, { pattern, replacement }] of Object.entries(patternExceptions)) {
          if (pattern.test(lowercaseText)) {
            return replacement;
          }
        }

        return staticExceptions[lowercaseText] || text;
    };

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
          speechTranscript = applyExceptions(speechTranscript?.trim() || "").toLowerCase();
          const spokenText = speechTranscript?.trim().toLowerCase();
          setTranscribedSpeech(spokenText);

          console.log(spokenText);
    
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
// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, Image, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
// import FontAwesome from '@expo/vector-icons/FontAwesome';
// import { Audio } from 'expo-av';
// import { recordSpeech } from '@/app/utils/recordSpeech';
// import { transcribeSpeech } from '../utils/transcribeSpeech';
// // import * as Speech from 'expo-speech';
// // import Voice from '@react-native-voice/voice';

// export default function LetterPronounce() {
//     // const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
//     // const [currentLetter, setCurrentLetter] = useState('');
//     // const [stars, setStars] = useState(0);
//     // const [attempts, setAttempts] = useState(0);

//     // useEffect(() => {
//     //     pickRandomLetter();
//     //     Voice.onSpeechResults = handleSpeechResults;

//     //     return () => {
//     //         Voice.destroy().then(Voice.removeAllListeners);
//     //     };
//     // }, []);

//     // const pickRandomLetter = () => {
//     //     const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
//     //     setCurrentLetter(randomLetter);
//     //     Speech.speak("What is this letter's name?");
//     // };

//     // const handleSpeechResults = (e: { value?: string[] }) => {
//     //     if (e.value && e.value.length > 0) {
//     //         const spokenText = e.value[0].toUpperCase();
//     //         if (spokenText === currentLetter) {
//     //             Speech.speak('Good job!');
//     //             setStars(stars + 1);
//     //             setAttempts(attempts + 1);

//     //             if (attempts < 4) {
//     //                 pickRandomLetter();
//     //             } else {
//     //                 Speech.speak('You finished all the letters!');
//     //             }
//     //         } else {
//     //             Speech.speak('Try again.');
//     //         }
//     //     }
//     // };

//     // const startListening = async () => {
//     //     try {
//     //         await Voice.start('en-US');
//     //     } catch (error) {
//     //         console.error('Error starting voice recognition:', error);
//     //     }
//     // };

//     const [transcribedSpeech, setTranscribedSpeech] = useState("");
//     const [isRecording, setIsRecording] = useState(false);
//     const [isTranscribing, setIsTranscribing] = useState(false);
//     const audioRecordingRef = useRef(new Audio.Recording());

//     const startRecording = async () => {
//         setIsRecording(true);
//         await recordSpeech(
//           audioRecordingRef,
//           setIsRecording,
//           !!webAudioPermissionsRef.current
//         );
//       };

//       const stopRecording = async () => {
//         setIsRecording(false);
//         setIsTranscribing(true);
//         try {
//           const speechTranscript = await transcribeSpeech(audioRecordingRef);
//           setTranscribedSpeech(speechTranscript || "");
//         } catch (e) {
//           console.error(e);
//         } finally {
//           setIsTranscribing(false);
//         }
//       };

//     return (
//         <View className='flex-1 bg-white justify-center items-center'>
//             <TouchableOpacity>
//                 <FontAwesome name="microphone" size={40} color="black" />
//             </TouchableOpacity>
//         </View>

//         // <View className="flex-1 bg-white justify-center items-center">
//         //     <Text className="text-black text-9xl">{currentLetter}</Text>
//         //     <TouchableOpacity
//         //         onPress={startListening}
//         //         className="mt-5 bg-blue-500 px-4 py-2 rounded-full"
//         //     >
//         //         <Text className="text-white text-lg">Say the Letter</Text>
//         //     </TouchableOpacity>
//         //     <View className="flex-row mt-5">
//         //         {[...Array(stars)].map((_, index) => (
//         //             <Image
//         //                 key={index}
//         //                 source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Red_star.svg/1200px-Red_star.svg.png' }}
//         //                 style={{ width: 30, height: 30, margin: 5 }}
//         //             />
//         //         ))}
//         //     </View>
//         // </View>
//     );
// }

import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import transcribeSpeech from "@/app/utils/transcribeSpeech";
import recordSpeech from "@/app/utils/recordSpeech";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import useWebFocus from "@/hooks/useWebFocus";

export default function LetterPronounce() {
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
      const speechTranscript = await transcribeSpeech(audioRecordingRef);
      setTranscribedSpeech(speechTranscript || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView style={styles.mainScrollContainer}>
        <View style={styles.mainInnerContainer}>
          <Text style={styles.title}>Welcome to the Speech-to-Text App</Text>
          <View style={styles.transcriptionContainer}>
            {isTranscribing ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text
                style={{
                  ...styles.transcribedText,
                  color: transcribedSpeech ? "#000" : "rgb(150,150,150)",
                }}
              >
                {transcribedSpeech ||
                  "Your transcribed text will be shown here"}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={{
              ...styles.microphoneButton,
              opacity: isRecording || isTranscribing ? 0.5 : 1,
            }}
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

const styles = StyleSheet.create({
  mainScrollContainer: {
    padding: 20,
    height: "100%",
    width: "100%",
  },
  mainInnerContainer: {
    gap: 75,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 35,
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  transcriptionContainer: {
    backgroundColor: "rgb(220,220,220)",
    width: "100%",
    height: 300,
    padding: 20,
    marginBottom: 20,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  transcribedText: {
    fontSize: 20,
    padding: 5,
    color: "#000",
    textAlign: "left",
    width: "100%",
  },
  microphoneButton: {
    backgroundColor: "red",
    width: 75,
    height: 75,
    marginTop: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
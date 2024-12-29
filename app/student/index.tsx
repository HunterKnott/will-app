import React, { useState } from 'react';
import { View, Text, TextInput, Image } from 'react-native';
import NavButton from '../NavButton';
import { useRouter } from 'expo-router';

export default function StudentLogin() {
    const [studentNumber, setStudentNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    const handlePress = () => {
        if (studentNumber.trim() === '') {
            setErrorMessage('The field is empty, please enter a valid student number');
        } else {
            setErrorMessage('');
            // router.push('../instructions');
            router.push('../track2');
        }
    };

    return (
        <View className="flex-1 bg-black">
            {/* Header Image */}
            <Image
                source={require('@/assets/images/Lamb-app.png')}
                style={{ width: '100%', height: '35%' }}
                className="absolute top-0"
                resizeMode="cover"
            />

            {/* Black section */}
            <View className="flex-1 mt-96 px-5">
                <Text className="text-white text-2xl font-bold mb-6">
                    Please enter a student ID:
                </Text>
                <TextInput
                    className="bg-white text-black rounded p-4 mb-5"
                    placeholder="Student ID"
                    placeholderTextColor="#aaa"
                    value={studentNumber}
                    onChangeText={setStudentNumber}
                    keyboardType='numeric'
                />
                <NavButton
                    color="#16a085"
                    text="START"
                    onPress={handlePress}
                />
                {errorMessage ? (
                    <Text className="text-red-500 mt-2.5">
                        {errorMessage}
                    </Text>
                ) : null}
                <View className='my-4' />
                <NavButton
                    color='#CD6155'
                    text="BACK"
                    navigateTo='../(tabs)'
                />
            </View>
        </View>
    );
}

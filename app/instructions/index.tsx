import React, { useState } from 'react';
import { View, Text, TextInput, Image } from 'react-native';
import NavButton from '../NavButton';

export default function Instructions() {
    return (
        <View className='flex-1 bg-black'>
            {/* Header Image */}
            <Image
                source={require('@/assets/images/Lamb-app.png')}
                style={{ width: '100%', height: '35%' }}
                className="absolute top-0"
                resizeMode="cover"
            />
        </View>
    )
}
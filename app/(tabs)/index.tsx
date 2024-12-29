import { Image } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import NavButton from '@/app/NavButton';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/Lamb-app.png')}
          className='absolute top-0'
          style={{ width: '100%', height: '100%' }}
          resizeMode='cover'
        />
      }>
      <ThemedView className='flex flex-row items-center gap-8'>
        <ThemedText type="title">Are you a...</ThemedText>
        <HelloWave />
      </ThemedView>
      <NavButton
        color="#CD6155"
        text="STUDENT"
        navigateTo='../student'
      />
      <NavButton
        color="#2E86C1"
        text="TEACHER"
        link="https://www.google.com"
      />
    </ParallaxScrollView>
  );
}
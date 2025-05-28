import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding/firstscreen" />
      <Stack.Screen name="onboarding/secondscreen" />
    </Stack>
  );
}

import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding/firstScreen" />
      <Stack.Screen name="onboarding/secondScreen" />
    </Stack>
  );
}

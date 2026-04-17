import { Stack } from 'expo-router';

export default function KidsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="lily-pad-leap" options={{ headerShown: false }} />
      <Stack.Screen name="hungry-chameleon" options={{ headerShown: false }} />
      <Stack.Screen name="jungle-explorer" options={{ headerShown: false }} />
    </Stack>
  );
}

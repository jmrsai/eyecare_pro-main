import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as any),
});

export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('eye-breaks', {
      name: 'Eye Breaks',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync() as any;
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync() as any;
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

export const scheduleBreakReminder = async (minutes: number) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for an Eye Break! 👁️",
      body: "Look 20 feet away for 20 seconds. (20-20-20 Rule)",
      data: { url: '/exercises/quick-break' },
    },
    trigger: {
      seconds: minutes * 60,
      repeats: true,
    } as any,
  });
};

export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

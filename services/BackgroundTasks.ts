import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MISSED_MEDICATION_TASK = 'BACKGROUND_MISSED_MEDICATION_CHECK';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
}

// 1. Define the task
TaskManager.defineTask(MISSED_MEDICATION_TASK, async () => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const stored = await AsyncStorage.getItem('medications');
    if (!stored) return BackgroundFetch.BackgroundFetchResult.NoData;

    const medications: Medication[] = JSON.parse(stored);
    let missedCount = 0;

    for (const med of medications) {
      for (const time of med.times) {
        const [hour, minute] = time.split(':').map(Number);
        
        // Check if a medication was due in the last 30 minutes
        const diffMinutes = (currentHour * 60 + currentMinute) - (hour * 60 + minute);
        
        if (diffMinutes > 0 && diffMinutes <= 30) {
          // In a real app, we'd check if the user "logged" it as taken.
          // For this prototype, we'll just trigger a follow-up if it's within this window.
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Missed Medication?",
              body: `Just a follow-up: Did you take your ${med.name} (${med.dosage})?`,
              data: { medId: med.id },
            },
            trigger: null, // Send immediately
          });
          missedCount++;
        }
      }
    }

    return missedCount > 0 
      ? BackgroundFetch.BackgroundFetchResult.NewData 
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// 2. Register the task
export async function registerBackgroundTasks() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(MISSED_MEDICATION_TASK);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(MISSED_MEDICATION_TASK, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background task registered');
  }
}

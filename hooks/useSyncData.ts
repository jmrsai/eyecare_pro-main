
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { supabase } from '../lib/supabase';

const SYNC_TASK = 'BACKGROUND_MEDICAL_SYNC';

TaskManager.defineTask(SYNC_TASK, async () => {
  try {
    const localLogs = await getLocalUnsyncedResults(); // Custom SQLite fetch
    if (localLogs.length > 0) {
      const { error } = await supabase.from('test_results').insert(localLogs);
      if (!error) await markAsSynced(localLogs);
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register task in your App.js
export async function registerSyncTask() {
  return BackgroundFetch.registerTaskAsync(SYNC_TASK, {
    minimumInterval: 15 * 60, // 15 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

// These functions are placeholders and need to be implemented
async function getLocalUnsyncedResults() {
  // Implement your logic to get unsynced results from SQLite
  return [];
}

async function markAsSynced(logs) {
  // Implement your logic to mark logs as synced in SQLite
}

/**
 * Background task registration. Uses expo-task-manager + expo-background-fetch
 * so the device can process one packet at a time while the phone is charging
 * and connected to Wi-Fi. All gating logic lives here.
 */

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Config } from '../constants/config';
import { useListenStore } from '../store/useListenStore';
import { processOnePacket } from './packetManager';

const TASK_NAME = Config.backgroundTaskName;

TaskManager.defineTask(TASK_NAME, async () => {
  const { userId, settings, state } = useListenStore.getState();
  if (!userId || state === 'paused') {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  // Quiet-hours gating is enforced by the OS scheduler + user settings.
  // We still honor it defensively.
  const hour = new Date().getHours();
  const { quietStartHour, quietEndHour } = settings;
  const inQuiet =
    quietStartHour < quietEndHour
      ? hour >= quietStartHour && hour < quietEndHour
      : hour >= quietStartHour || hour < quietEndHour;
  if (!inQuiet) {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  const ok = await processOnePacket(userId);
  return ok
    ? BackgroundFetch.BackgroundFetchResult.NewData
    : BackgroundFetch.BackgroundFetchResult.NoData;
});

/**
 * Register the task with the OS. Safe to call multiple times.
 */
export async function registerBackgroundTask(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (isRegistered) return;
  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: Config.minPacketIntervalMs / 1000,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterBackgroundTask(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (isRegistered) {
    await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
  }
}

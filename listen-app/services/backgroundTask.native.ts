/**
 * Background task registration (native implementation).
 *
 * Uses expo-task-manager + expo-background-fetch so the device can process
 * one packet at a time while the phone is charging and connected to Wi-Fi.
 *
 * IMPORTANT: `expo-task-manager` is NOT available in Expo Go on SDK 54+.
 * It only exists inside custom dev-clients / production builds. If we were
 * to call `TaskManager.defineTask(...)` at module load time, it would
 * throw on Expo Go and take the whole app down with a black screen.
 *
 * We therefore keep the module top-level completely side-effect free, and
 * defer every call to TaskManager / BackgroundFetch into explicit async
 * functions that catch their own errors. On Expo Go those functions are
 * harmless no-ops; on a dev-client they behave exactly as before.
 *
 * Metro picks this file on iOS / Android via the `.native.ts` suffix; the
 * web bundle uses `backgroundTask.web.ts` which is a pure no-op.
 */

import { Config } from '../constants/config';
import { useListenStore } from '../store/useListenStore';
import { processOnePacket } from './packetManager';

const TASK_NAME = Config.backgroundTaskName;
let taskDefined = false;

type TaskManagerLike = {
  defineTask: (name: string, handler: () => Promise<number>) => void;
  isTaskRegisteredAsync: (name: string) => Promise<boolean>;
};

type BackgroundFetchLike = {
  BackgroundFetchResult: { NoData: number; NewData: number; Failed: number };
  registerTaskAsync: (
    name: string,
    options: {
      minimumInterval: number;
      stopOnTerminate?: boolean;
      startOnBoot?: boolean;
    },
  ) => Promise<void>;
  unregisterTaskAsync: (name: string) => Promise<void>;
};

/**
 * Lazily resolve the native modules. Returns null if either module is
 * missing (i.e. we're running inside Expo Go, which does not ship
 * expo-task-manager). This is wrapped in try/catch because on SDK 54 a
 * missing module may throw instead of returning an undefined export.
 */
function loadNative(): {
  TaskManager: TaskManagerLike;
  BackgroundFetch: BackgroundFetchLike;
} | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TaskManager = require('expo-task-manager') as TaskManagerLike;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const BackgroundFetch = require('expo-background-fetch') as BackgroundFetchLike;
    if (typeof TaskManager?.defineTask !== 'function') return null;
    if (typeof BackgroundFetch?.registerTaskAsync !== 'function') return null;
    return { TaskManager, BackgroundFetch };
  } catch {
    return null;
  }
}

function ensureTaskDefined(modules: {
  TaskManager: TaskManagerLike;
  BackgroundFetch: BackgroundFetchLike;
}): void {
  if (taskDefined) return;
  const { TaskManager, BackgroundFetch } = modules;
  try {
    TaskManager.defineTask(TASK_NAME, async () => {
      const { userId, settings, state } = useListenStore.getState();
      if (!userId || state === 'paused') {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }
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
    taskDefined = true;
  } catch {
    // On Expo Go, TaskManager.defineTask may throw. Silently give up —
    // `registerBackgroundTask` will then just not register.
  }
}

/** Register the task with the OS. No-op in Expo Go. Safe to call repeatedly. */
export async function registerBackgroundTask(): Promise<void> {
  const modules = loadNative();
  if (!modules) return;
  ensureTaskDefined(modules);
  if (!taskDefined) return;
  try {
    const { TaskManager, BackgroundFetch } = modules;
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) return;
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: Config.minPacketIntervalMs / 1000,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch {
    // no-op
  }
}

/** Stop the background task. No-op in Expo Go. */
export async function unregisterBackgroundTask(): Promise<void> {
  const modules = loadNative();
  if (!modules) return;
  try {
    const { TaskManager, BackgroundFetch } = modules;
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
    }
  } catch {
    // no-op
  }
}

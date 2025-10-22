/**
 * Utility for managing lesson progress in localStorage.
 * Used to restore progress after page refresh or browser crash.
 */

export interface LessonProgress {
  lessonId: string;
  videoWatchedTime: number; // seconds
  taskElapsedTime: number; // seconds
  timestamp: number; // Date.now()
}

const STORAGE_PREFIX = "hanabi_lesson_progress";
const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes - only restore recent progress

/**
 * Save lesson progress to localStorage
 */
export const saveLessonProgress = (
  userId: string,
  progress: LessonProgress
): void => {
  if (!userId || !progress.lessonId) return;

  try {
    const key = `${STORAGE_PREFIX}_${userId}_${progress.lessonId}`;
    const data = {
      ...progress,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    // Silently fail if localStorage is full or blocked
    console.warn("Failed to save lesson progress:", error);
  }
};

/**
 * Load lesson progress from localStorage
 * Returns null if not found or too old
 */
export const loadLessonProgress = (
  userId: string,
  lessonId: string
): LessonProgress | null => {
  if (!userId || !lessonId) return null;

  try {
    const key = `${STORAGE_PREFIX}_${userId}_${lessonId}`;
    const data = localStorage.getItem(key);

    if (!data) return null;

    const progress: LessonProgress = JSON.parse(data);

    // Check if data is too old
    const age = Date.now() - progress.timestamp;
    if (age > MAX_AGE_MS) {
      // Clean up old data
      localStorage.removeItem(key);
      return null;
    }

    return progress;
  } catch (error) {
    console.warn("Failed to load lesson progress:", error);
    return null;
  }
};

/**
 * Clear lesson progress from localStorage
 */
export const clearLessonProgress = (
  userId: string,
  lessonId: string
): void => {
  if (!userId || !lessonId) return;

  try {
    const key = `${STORAGE_PREFIX}_${userId}_${lessonId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to clear lesson progress:", error);
  }
};

/**
 * Clean up all old lesson progress entries (older than MAX_AGE_MS)
 * Call this on app startup or periodically
 */
export const cleanupOldProgress = (): void => {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    // Find all progress keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const progress = JSON.parse(data);
            const age = now - progress.timestamp;
            if (age > MAX_AGE_MS) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid data, mark for removal
          keysToRemove.push(key);
        }
      }
    }

    // Remove old entries
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} old lesson progress entries`);
    }
  } catch (error) {
    console.warn("Failed to cleanup old progress:", error);
  }
};



import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';

export interface DailyActivity {
  addedWordsCount: number;
  mangaAddedCount: number;
  streak: number;
}

/**
 * Get today's date at midnight (start of day)
 */
const getStartOfDay = (date: Date = new Date()): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

/**
 * Get tomorrow's date at midnight (end of current day)
 */
const getEndOfDay = (date: Date = new Date()): Date => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

/**
 * Get yesterday's date at midnight
 */
const getYesterdayStart = (): Date => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getStartOfDay(yesterday);
};

/**
 * Fetch today's daily activities
 */
export const getDailyActivities = async (): Promise<DailyActivity> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return {
      addedWordsCount: 0,
      mangaAddedCount: 0,
      streak: 0,
    };
  }

  try {
    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    const activitiesRef = collection(db, 'users', user.uid, 'activities');
    // Query from user's subcollection
    const userActivitiesQuery = query(activitiesRef);

    const activitiesSnapshot = await getDocs(userActivitiesQuery);
    const allActivities = activitiesSnapshot.docs.map((doc) => ({
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.(),
    }));

    // Sort by timestamp descending and filter activities to only today's activities
    const activities = allActivities
      .filter((activity) => {
        if (!activity.timestamp) return false;
        const activityDate = getStartOfDay(activity.timestamp);
        return activityDate.getTime() === startOfDay.getTime();
      })
      .sort((a, b) => {
        const timeA = a.timestamp?.getTime?.() ?? 0;
        const timeB = b.timestamp?.getTime?.() ?? 0;
        return timeB - timeA;
      });

    // Count different activity types
    const mangaAddedActivities = activities.filter((a) => a.type === 'manga_add');
    const wordAddedActivities = activities.filter((a) => a.type === 'word_add');

    // Calculate streak
    const streak = await calculateStreak(user.uid);

    return {
      mangaAddedCount: mangaAddedActivities.length,
      addedWordsCount: wordAddedActivities.length,
      streak,
    };
  } catch (error) {
    console.error('Error fetching daily activities:', error);
    return {
      mangaAddedCount: 0,
      addedWordsCount: 0,
      streak: 0,
    };
  }
};

/**
 * Calculate the current reading streak for the user
 * A streak is maintained when the user has activities on consecutive days
 */
export const calculateStreak = async (userId: string): Promise<number> => {
  try {
    const activitiesRef = collection(db, 'users', userId, 'activities');

    // Get all activities for the user from their subcollection
    const userActivitiesQuery = query(activitiesRef);

    const activitiesSnapshot = await getDocs(userActivitiesQuery);
    const activities = activitiesSnapshot.docs
      .map((doc) => ({
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.(),
      }))
      .sort((a, b) => {
        const timeA = a.timestamp?.getTime?.() ?? 0;
        const timeB = b.timestamp?.getTime?.() ?? 0;
        return timeB - timeA;
      });

    if (activities.length === 0) {
      return 0;
    }

    let streak = 0;
    let currentDate = getStartOfDay();

    for (const activity of activities) {
      const activityDate = getStartOfDay(activity.timestamp);

      // Check if activity is on the current date we're checking
      if (activityDate.getTime() === currentDate.getTime()) {
        // Activity on this date exists, move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
        // Increment streak only if we haven't already counted this day
        if (
          streak === 0 ||
          getStartOfDay(activities[0].timestamp).getTime() !== getStartOfDay().getTime()
        ) {
          streak++;
        }
      } else if (activityDate.getTime() < currentDate.getTime()) {
        // Activity is from an earlier date
        const daysDifference = Math.floor(
          (currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDifference === 1) {
          // Activity is from yesterday, continue streak
          currentDate = activityDate;
          streak++;
        } else {
          // Gap in days, streak is broken
          break;
        }
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
};

/**
 * Check if user had activity yesterday (for streak maintenance)
 */
export const hadActivityYesterday = async (userId: string): Promise<boolean> => {
  try {
    const yesterdayStart = getYesterdayStart();

    const activitiesRef = collection(db, 'users', userId, 'activities');
    const userActivitiesQuery = query(activitiesRef);

    const activitiesSnapshot = await getDocs(userActivitiesQuery);
    const allActivities = activitiesSnapshot.docs.map((doc) => ({
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.(),
    }));

    // Filter to check for yesterday's activity
    return allActivities.some((activity) => {
      if (!activity.timestamp) return false;
      const activityDate = getStartOfDay(activity.timestamp);
      return activityDate.getTime() === yesterdayStart.getTime();
    });
  } catch (error) {
    console.error('Error checking yesterday activity:', error);
    return false;
  }
};

/**
 * Get activity statistics for a specific date range
 */
export const getActivityStats = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalActivities: number;
  mangaStarted: number;
  wordsAdded: number;
  wordsLearned: number;
  daysActive: number;
}> => {
  try {
    const activitiesRef = collection(db, 'users', userId, 'activities');
    const userActivitiesQuery = query(activitiesRef);

    const activitiesSnapshot = await getDocs(userActivitiesQuery);
    const allActivities = activitiesSnapshot.docs.map((doc) => ({
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.(),
    }));

    // Filter activities by date range client-side
    const activities = allActivities.filter((activity) => {
      if (!activity.timestamp) return false;
      const activityTime = activity.timestamp.getTime();
      return activityTime >= startDate.getTime() && activityTime <= endDate.getTime();
    });

    const uniqueDays = new Set(activities.map((a) => getStartOfDay(a.timestamp).toISOString()));

    return {
      totalActivities: activities.length,
      mangaStarted: activities.filter((a) => a.type === 'manga_add').length,
      wordsAdded: activities.filter((a) => a.type === 'word_add').length,
      wordsLearned: activities.filter((a) => a.type === 'word_update' && a.newStatus === 'learned')
        .length,
      daysActive: uniqueDays.size,
    };
  } catch (error) {
    console.error('Error getting activity stats:', error);
    return {
      totalActivities: 0,
      mangaStarted: 0,
      wordsAdded: 0,
      wordsLearned: 0,
      daysActive: 0,
    };
  }
};

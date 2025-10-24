import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";

interface Activity {
  id: string;
  type: string;
  userId: string;
  mangaId?: string;
  mangaTitle?: string;
  word?: string;
  translation?: string;
  context?: string;
  data?: Record<string, any>;
  changes?: Record<string, { from: any; to: any }>;
  timestamp?: { seconds: number; nanoseconds: number } | null;
}


const activityIcons: Record<string, string> = {
  manga_add: "📚",
  manga_update: "✏️",
  word_add: "📝",
  word_update: "🔄",
};

const formatTimestamp = (
  timestamp: Activity["timestamp"]
): string => {
  if (!timestamp?.seconds) return "Just now";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleString();
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "activities"), orderBy("timestamp", "desc") ,limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Activity[] = []; 
      snapshot.forEach((doc) =>
      fetched.push({ ...(doc.data() as Activity), id: doc.id }),
      );
      setActivities(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

const renderActivityMessage = (activity: Activity) => {
  const { type, mangaTitle, mangaId, word, translation, data = {}, changes = {} } = activity;
  const changeText =
    Object.keys(changes).length > 0
      ? Object.entries(changes)
          .map(([key, val]) => `${key}: ${val.from ?? "N/A"} → ${val.to ?? "N/A"}`)
          .join(", ")
      : "No changes";

  switch (type) {
    case "manga_add":
      return `➕ Added manga: ${activity.mangaTitle ?? data.mangaTitle ?? "Unknown"}`;

    case "manga_update":
      return `✏️ Updated manga (${activity.mangaTitle ?? data.mangaTitle ?? mangaId ?? "Unknown"}): ${changeText}`;

    case "word_add":
      return `📝 Added word: ${activity.word ?? data.word ?? "Unknown"} (${activity.translation ?? data.translation ?? ""})`;

    case "word_update":
      return `🔄 Updated word: ${activity.word ?? data.word ?? "Unknown"} (${changeText})`;

    default:
      return "Performed an activity";
  }
};


  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Activity Feed</h2>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-[16px] bg-white shadow-md">
      <h2 className="text-xl font-bold mb-4">Activity Feed</h2>
      {activities.length === 0 ? (
        <div className="text-gray-500">No activities yet.</div>
      ) : (
        <ul className="space-y-2 max-h-[500px] overflow-y-auto">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition flex justify-between items-start"
            >
              <div className="flex items-start space-x-2">
                <span className="text-xl">
                  {activityIcons[activity.type] ?? "✨"}
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {renderActivityMessage(activity)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityFeed;


import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { getMangaDetails } from 'src/services/anilistApi';

interface Activity {
  id: string;
  type: string;
  userId: string;
  mangaId?: string;
  mangaTitle?: string;
  coverImage?: string;
  word?: string;
  translation?: string;
  context?: string;
  data?: Record<string, any>;
  changes?: Record<string, { from: any; to: any }>;
  timestamp?: { seconds: number; nanoseconds: number } | null;
}

const formatTimestamp = (timestamp: Activity['timestamp']): string => {
  if (!timestamp?.seconds) return 'Just now';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleString();
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Activity[] = [];
      snapshot.forEach((doc) => fetched.push({ ...(doc.data() as Activity), id: doc.id }));
      setActivities(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderActivityMessage = (activity: Activity) => {
    const { type, mangaTitle, mangaId, word, translation, data = {}, changes = {} } = activity;
    const changeEntries =
      Object.keys(changes).length > 0
        ? Object.entries(changes).map(
            ([key, val]) => `${key}: ${val.from ?? 'N/A'} → ${val.to ?? 'N/A'}`
          )
        : [];

    switch (type) {
      case 'manga_add':
        return {
          title: `Added manga: ${activity.mangaTitle ?? data.mangaTitle ?? 'Unknown'}`,
          changes: [],
        };

      case 'manga_update': {
        const title = activity.mangaTitle ?? data.mangaTitle ?? mangaId ?? 'Unknown';
        return { title: `Updated manga: ${title}`, changes: changeEntries };
      }

      case 'manga_delete':
        return {
          title: `Deleted manga: ${activity.mangaTitle ?? data.mangaTitle ?? mangaId ?? 'Unknown'}`,
          changes: [],
        };

      case 'word_add': {
        const translation = activity.translation ?? data.translation;
        const translationText = translation ? ` - ${translation}` : '';
        return {
          title: `Added "${activity.word ?? data.word ?? 'Unknown'}"${translationText} from ${activity.mangaTitle}`,
          changes: [],
        };
      }

      case 'word_update': {
        const wordName = activity.word ?? data.word ?? 'Unknown';
        return {
          title: `Updated "${wordName}" from ${activity.mangaTitle}`,
          changes: changeEntries,
        };
      }

      case 'word_delete': {
        const wordName = activity.word ?? data.word ?? 'Unknown';
        return {
          title: `Deleted "${wordName}" from ${activity.mangaTitle}`,
          changes: [],
        };
      }

      default:
        return { title: 'Performed an activity', changes: [] };
    }
  };

  if (loading) {
    return (
      <div className='min-h-[400px] rounded-lg p-4'>
        <div className='animate-pulse space-y-3'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='flex gap-3'>
              <div className='h-28 w-16 flex-shrink-0 rounded-[8px] bg-gray-200'></div>
              <div className='flex-1 space-y-2'>
                <div className='h-4 w-3/4 rounded bg-gray-200'></div>
                <div className='h-3 w-1/2 rounded bg-gray-200'></div>
                <div className='h-3 w-full rounded bg-gray-200'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-lg'>
      {activities.length === 0 ? (
        <div className='flex min-h-[400px] items-center justify-center py-8 text-center text-gray-400'>
          No activities yet.
        </div>
      ) : (
        <ul className='max-h-[500px] space-y-3 overflow-y-auto'>
          {activities.map((activity) => (
            <li key={activity.id} className='flex cursor-pointer gap-3 rounded-md p-3 transition'>
              {activity.coverImage &&
                (activity.type === 'manga_add' ||
                  activity.type === 'manga_update' ||
                  activity.type === 'manga_delete' ||
                  activity.type === 'word_add' ||
                  activity.type === 'word_update' ||
                  activity.type === 'word_delete') && (
                  <img
                    src={activity.coverImage}
                    alt={activity.mangaTitle ?? 'Manga'}
                    className='h-28 w-16 flex-shrink-0 rounded-[8px] object-cover'
                  />
                )}
              <div className='flex flex-1 flex-col'>
                <div className='flex items-center gap-2'>
                  <div>
                    <p className='text-sm font-medium text-violet-600'>
                      {renderActivityMessage(activity).title}
                    </p>
                    {renderActivityMessage(activity).changes.length > 0 && (
                      <div className='mt-1 text-sm text-gray-900'>
                        {renderActivityMessage(activity).changes.map((change, i) => (
                          <div key={i}>{change}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <p className='mt-1 text-xs text-gray-500'>{formatTimestamp(activity.timestamp)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityFeed;

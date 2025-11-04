/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from 'firebase-functions';
import { onRequest } from 'firebase-functions/https';
import * as logger from 'firebase-functions/logger';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Fetch manga by genre from AniList API
export const getMangaByGenre = onRequest({ cors: true }, async (request, response) => {
  // Only allow GET requests
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { genre } = request.query;

    // Validate genre parameter
    if (!genre || typeof genre !== 'string') {
      response.status(400).json({ error: 'Genre parameter is required' });
      return;
    }

    // AniList GraphQL query
    const query = `
       query {
         Page(page: 1, perPage: 50) {
           media(
             genre: "${genre}"
             type: MANGA
             sort: SCORE_DESC
             isAdult: false
           ) {
              id
              title {
                romaji
                english
              }
              description
              bannerImage
              coverImage {
                large
              }
              averageScore
              popularity
           }
         }
       }
     `;

    const anilistResponse = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!anilistResponse.ok) {
      throw new Error('Failed to fetch from AniList API');
    }

    const data = await anilistResponse.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    const media = data.data.Page.media;

    // Filter for manga with reasonable popularity and scores
    const filtered = media.filter(
      (m: { popularity: number; averageScore: number; description?: string }) =>
        m.popularity > 1000 && m.popularity < 50000 && m.averageScore > 60
    );

    // Return random manga from filtered list
    const selectedManga =
      filtered.length > 0
        ? filtered[Math.floor(Math.random() * filtered.length)]
        : media[Math.floor(Math.random() * media.length)];

    if (!selectedManga) {
      response.status(404).json({ error: 'No manga found for this genre' });
      return;
    }

    response.status(200).json(selectedManga);
  } catch (error) {
    logger.error('Error fetching manga by genre:', error);
    response.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

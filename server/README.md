# Simple Vocabulary Manga Backend

A lightweight Node.js/Express backend that provides AniList API integration with basic caching.

## 🚀 Features

- **AniList API Integration** - Search and fetch manga data
- **Simple Caching** - Reduces API calls for better performance
- **Minimal Endpoints** - Just what you need, nothing more
- **CORS Enabled** - Frontend can communicate seamlessly

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm package manager

## 🛠️ Installation

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## 🌐 API Endpoints

### Search Manga
```
GET /api/search?q=query&limit=10
```

**Parameters:**
- `q` (required): Search query string
- `limit` (optional): Results limit (default: 10)

**Example:**
```bash
curl "http://localhost:3002/api/search?q=One%20Piece&limit=5"
```

### Get Manga Details
```
GET /api/manga/:id
```

**Parameters:**
- `id` (required): Manga ID from AniList

**Example:**
```bash
curl "http://localhost:3002/api/manga/30013"
```

### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "port": 3002
}
```

## 💾 Caching

- **Search Results**: 30 minutes TTL
- **Manga Details**: 2 hours TTL
- **Automatic**: No configuration needed

## 🧪 Testing

Run the test script to verify all endpoints work:

```bash
npm test
```

**Expected Output:**
```
🧪 Testing simplified backend...

1. Testing health...
✅ Health: OK Port: 3002 

2. Testing search...
✅ Search results: 3 manga
   Cached: No
   First result: One Piece 

3. Testing manga details...
✅ Manga details: One Piece
   Cached: Yes 

🎉 All tests passed! Backend is working perfectly!
```

## 🔧 Configuration

- **Port**: 3002 (configurable via PORT environment variable)
- **Frontend Integration**: Update `BACKEND_URL` in `src/services/anilistApi.js`

## 📊 What You Get

### Search Response
```json
{
  "data": {
    "Page": {
      "media": [
        {
          "id": 30013,
          "title": {
            "romaji": "ONE PIECE",
            "english": "One Piece"
          },
          "description": "As a child, Monkey D. Luffy...",
          "coverImage": {
            "large": "https://..."
          },
          "genres": ["Action", "Adventure"],
          "averageScore": 91,
          "chapters": null,
          "status": "RELEASING"
        }
      ]
    }
  },
  "cached": false
}
```

### Manga Details Response
```json
{
  "data": {
    "Media": {
      "id": 30013,
      "title": {
        "romaji": "ONE PIECE",
        "english": "One Piece",
        "native": "ONE PIECE"
      },
      "description": "As a child, Monkey D. Luffy...",
      "coverImage": {
        "large": "https://..."
      },
      "genres": ["Action", "Adventure"],
      "averageScore": 91,
      "chapters": null,
      "volumes": null,
      "status": "RELEASING",
      "startDate": {
        "year": 1997
      }
    }
  },
  "cached": false
}
```

## 🚀 Benefits

- **Simple**: Just 3 endpoints, easy to understand
- **Fast**: Caching reduces API calls
- **Reliable**: Error handling and validation
- **Scalable**: Can easily add more features later

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   lsof -ti:3002 | xargs kill -9
   ```

2. **CORS Errors**
   - Ensure frontend is calling the correct port (3002)
   - Check if backend is running

3. **API Errors**
   - Check network connectivity
   - Verify AniList API is accessible

## 📈 Future Enhancements

- [ ] Rate limiting
- [ ] More search filters
- [ ] User authentication
- [ ] Advanced caching strategies

## 🤝 Contributing

This backend was developed in collaboration between AI Assistant and User.

## 📄 License

MIT License

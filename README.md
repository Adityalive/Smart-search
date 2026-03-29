<p align="center">
  <img src="https://img.shields.io/badge/Smart--search-AI%20Knowledge%20Base-00C896?style=for-the-badge&logo=searchengin&logoColor=white" alt="Smart-search Badge"/>
</p>

<h1 align="center">🧠 Smart-search</h1>

<p align="center">
  <strong>Your AI-Powered Personal Knowledge Base</strong><br/>
  Save anything from the web. Let AI organize it. Search semantically. Visualize connections.
</p>

<p align="center">
  <a href="https://smart-search-4kcq.onrender.com">🌐 Live Demo</a> •
  <a href="#-chrome-extension">🧩 Get Extension</a> •
  <a href="#-features">✨ Features</a> •
  <a href="#-tech-stack">🛠 Tech Stack</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Qdrant-Vector%20DB-DC382D?logo=qdrant&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?logo=google&logoColor=white" />
</p>

---

## 📖 What is Smart-search?

Smart-search is a full-stack **AI-powered knowledge management platform** that helps you save, organize, and rediscover content from across the web. Instead of bookmarking links and forgetting about them, Smart-search:

- 🏷️ **Auto-tags** your saved content using Google Gemini AI
- 🔍 **Searches semantically** — find "machine learning resources" even if you saved it as "neural network tutorial"
- 🗂️ **Clusters** similar items into smart folders automatically
- 🕸️ **Visualizes** your knowledge as an interactive 3D graph
- 🔁 **Resurfaces** forgotten content using spaced repetition
- 🧩 **Captures** content instantly via a Chrome Extension

---

## ✨ Features

### 📥 Save Anything
Save URLs, articles, PDFs, images, and videos. Smart-search scrapes the content using Cheerio and extracts titles, descriptions, and text automatically.

### 🤖 AI-Powered Organization
Every saved item is processed by a **BullMQ background worker** that:
- Sends content to **Google Gemini AI** for intelligent tag suggestions
- Generates **vector embeddings** for semantic understanding
- Stores embeddings in **Qdrant** for blazing-fast similarity search

### 🔍 Semantic Search
Go beyond keyword matching. Search by *meaning* — query "productivity tips" and find articles about "time management strategies" or "GTD methodology."

### 🗂️ Smart Clustering
Items are automatically grouped into topic-based clusters using vector similarity. No manual folder organization needed.

### 🕸️ Knowledge Graph
Explore your saved knowledge as an interactive **3D force-directed graph** powered by Three.js. Nodes represent items, edges represent semantic similarity. Click any node to explore related content.

### 🔁 Memory Resurface
A `node-cron` scheduled job identifies items saved 30, 60, and 90 days ago and resurfaces them — helping you review and retain knowledge over time.

### 📊 Rich Media Previews
Every saved link displays a beautiful preview card with extracted metadata, favicons, and dynamically generated banners for items without images.

### 📜 History
Track all your saved items chronologically with date-grouped sections (Today, Yesterday, and by date).

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Redux Toolkit, React Router 7, Tailwind CSS, Three.js |
| **Backend** | Node.js, Express 5, Mongoose |
| **Database** | MongoDB Atlas |
| **Vector DB** | Qdrant Cloud |
| **AI** | Google Gemini API (tagging + embeddings) |
| **Queue** | BullMQ + Redis (background processing) |
| **Scraping** | Cheerio, Puppeteer |
| **File Upload** | Multer + ImageKit |
| **Auth** | JWT (HttpOnly cookies) |
| **Extension** | Chrome Manifest V3 |
| **Deployment** | Render (unified service) |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Chrome Extension                       │
│              (Save URLs, Images, Videos)                  │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼─────────────────────────────────┐
│                   Express 5 Server                        │
│  ┌─────────────┐  ┌──────────┐  ┌─────────────────────┐  │
│  │  Static SPA  │  │ API Routes│  │  Helmet + CORS      │  │
│  │  (React App) │  │ /api/*   │  │  Security Layer     │  │
│  └─────────────┘  └────┬─────┘  └─────────────────────┘  │
│                        │                                  │
│  ┌─────────────────────▼──────────────────────────────┐   │
│  │              BullMQ Job Queue                       │   │
│  │   ┌──────────┐  ┌───────────┐  ┌───────────────┐   │   │
│  │   │ Scraping  │  │ AI Tagging │  │ Embedding Gen │   │   │
│  │   └──────────┘  └───────────┘  └───────────────┘   │   │
│  └────────────────────────────────────────────────────┘   │
└───────────┬──────────────┬──────────────┬────────────────┘
            │              │              │
   ┌────────▼───┐  ┌───────▼──────┐  ┌───▼──────┐
   │  MongoDB   │  │    Qdrant    │  │  Redis   │
   │  (Atlas)   │  │   (Vectors)  │  │  (Queue) │
   └────────────┘  └──────────────┘  └──────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))
- **Redis** (local or [Redis Cloud](https://redis.com/try-free/))
- **Qdrant** ([Qdrant Cloud](https://cloud.qdrant.io/) — free tier available)
- **Google Gemini API Key** ([Get one free](https://makersuite.google.com/app/apikey))

### 1. Clone the repo

```bash
git clone https://github.com/Adityalive/Smart-search.git
cd Smart-search
```

### 2. Set up environment variables

Create `Backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/smart-search
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5174
NODE_ENV=development

# AI & Vector Search
GEMINI_API_KEY=your-gemini-key
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-key

# Background Jobs
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password

# File Uploads
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
```

### 3. Install dependencies & run

```bash
# Install both Backend and Frontend dependencies
npm run install-all

# Start Backend (terminal 1)
cd Backend
npm run dev

# Start Frontend (terminal 2)
cd Frontend
npm run dev
```

Open **http://localhost:5174** in your browser.

---

## 🧩 Chrome Extension

The Smart-search Chrome Extension lets you save any webpage, image, or video to your knowledge base with **one click** — directly from your browser.

### How to Install

Since this is a free, open-source project, the extension is distributed via **GitHub Releases** (no Chrome Web Store fees required).

#### Step 1 — Download

1. Go to the [**Releases page**](https://github.com/Adityalive/Smart-search/releases)
2. Download the latest `smart-search-extension.zip`
3. Unzip the file to a folder on your computer
4. Here is the folder:https://drive.google.com/drive/folders/1KksV-FbZlfYjJbwN4_mLTIXc-EfeLEol?usp=sharing
> **Alternative:** Clone this repo and use the `extension/` folder directly.

#### Step 2 — Load in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the unzipped `extension/` folder
5. The Smart-search icon will appear in your toolbar! 🎉

#### Step 3 — Connect to Your Account

1. Visit the [Smart-search app](https://smart-search-4kcq.onrender.com) and **log in**
2. The extension will automatically sync your authentication
3. Now click the extension icon on any page → **"Save URL"** → Done!

### Extension Features

| Feature | Description |
|---|---|
| 💾 **Save URL** | Saves the current tab with title & URL |
| 🖼️ **Save as Image** | Tags the item as an image for smart clustering |
| 🎬 **Save as Video** | Tags the item as a video for smart clustering |
| 🖱️ **Right-click Menu** | Right-click any image → "Save Image to Smart-search" |
|  |

---

## 📁 Project Structure

```
Smart-search/
├── Backend/
│   ├── server.js                  # Entry point
│   └── src/
│       ├── app.js                 # Express app setup
│       ├── config/                # Database config
│       ├── controllers/           # Route handlers
│       │   ├── auth.controller.js
│       │   ├── item.controller.js
│       │   ├── cluster.controller.js
│       │   └── graph.controller.js
│       ├── middleware/            # Auth & upload middleware
│       ├── models/               # Mongoose schemas
│       ├── routes/               # API route definitions
│       ├── services/             # AI & scraping services
│       ├── workers/              # BullMQ background workers
│       ├── jobs/                 # Cron jobs (resurface)
│       ├── utils/                # Qdrant, helpers
│       └── public/               # Static files (built frontend)
├── Frontend/
│   └── src/
│       ├── app/                  # Redux store
│       ├── components/           # Layout, shared UI
│       ├── features/             # Feature modules
│       │   ├── auth/             # Login, Register
│       │   ├── items/            # Save & manage items
│       │   ├── clusters/         # Smart folders
│       │   └── graph/            # Knowledge graph
│       └── pages/                # Route pages
├── extension/                    # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── background.js             # Service worker
│   ├── popup.html / popup.js     # Extension popup UI
│   └── content.js                # Auth sync script
└── package.json                  # Root build scripts
```

---

## 🌐 Deployment

Smart-search is deployed as a **unified service** on [Render](https://render.com). The backend serves the React frontend as static files.

### Deploy Your Own

1. Fork this repo
2. Create a new **Web Service** on Render
3. Set:
   - **Build Command:** `npm install && npm run build` (in Backend)
   - **Start Command:** `npm start`
4. Add all environment variables from `.env` to the Render **Environment** tab
5. Deploy! 🚀

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Log in and receive JWT |
| `POST` | `/api/auth/logout` | Log out |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/items` | Save a new item (URL/PDF) |
| `GET` | `/api/items` | Get all user items |
| `DELETE` | `/api/items/:id` | Delete an item |
| `GET` | `/api/items/clusters` | Get AI-clustered groups |
| `GET` | `/api/items/graph` | Get knowledge graph data |
| `GET` | `/api/items/search?q=` | Semantic search |
| `GET` | `/api/items/:id/related` | Find related items |
| `GET` | `/api/items/resurface` | Get resurfaced memories |

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Adityalive">Aditya</a>
</p>

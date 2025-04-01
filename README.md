# 🔎 Web URL Deconstructor & Crawler

A React + Express app that takes any public website URL and deconstructs it to:

Display URL components (protocol, hostname, path, query, etc.)

Crawl the site and list all discovered internal sub-URLs

Visually show the loading progress and errors (if any)

## 🚀 Features

- ✅ Real-time URL parsing with validation
- ✅ Sub-URL crawling via backend using axios + cheerio
- ✅ Friendly UI with status handling and live updates
- ✅ Proxy setup for smooth React ↔ Express communication
- ✅ Fully working CORS & environment-based porting

## 🧱 Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | React + TypeScript |
| Backend | Express + Axios + Cheerio |
| Styling | CSS Modules (vanilla) |
| Tooling | Concurrently, Dotenv |

## 🛠️ Setup Instructions

### Prerequisites

- Node.js installed
- IDE (VSCode Recommended)

1. Clone the repo via `git clone git@github.com:mahtabnejad90/web-url-deconstructor.git`

2. Redirect your terminal path into the clone repo from step 1 `cd url-deconstructor` for the rest of the steps

3. Enter `npm install` 

4. Run the frontend and backend concurrently via `npm run dev`

## 🌐 Usage

1. Type in a valid full URL (e.g. https://news.ycombinator.com)

2. Hit Crawl URL

3. View:

     - Deconstructed components of the URL

     - Discovered sub-URLs in a scrollable list

## 🧪 Testing

### Test URLs

Try crawling:

- ✅ https://news.ycombinator.com
- ✅ https://en.wikipedia.org/wiki/Web_crawler
- ✅ https://playwright.dev
- ⚠️ Avoid: https://example.com (too simple), JavaScript-heavy sites

## 💡 Future Ideas

- Add E2E testing via Playwright
- Add performance metrics
- Add Depth-Level indicator
- Export discovered links to CSV
- Filter links by type (internal/external)
- Deploy on Vercel + Render for frontend/backend

## Author

Built by [Mahtab](https://github.com/mahtabnejad90) 🐧👩🏻‍💻
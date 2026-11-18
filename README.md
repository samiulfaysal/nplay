# 🎬 Netfly - Free Movie & TV-Series Streaming Platform

A modern, scalable, dark-themed cinematic web application for streaming free movies and TV series, powered by TMDB metadata and resilient multi-server streaming resolvers.

🚀 Tech Stack

Frontend: Next.js (App Router), React, TypeScript

Styling: Tailwind CSS (Responsive Cinematic Dark UI)

Backend & Database: Supabase (PostgreSQL for metadata, watch history, and auth)

Video Player: Plyr / Video.js (Supports HLS .m3u8 adaptive streaming & .mp4)

Deployment: GitHub + Vercel

🗄️ Data Sources & Architecture

Metadata Provider (TMDB API):

Automatically fetches movie & TV-series posters, backdrops, synopses, cast details, release years, IMDb ratings, and runtimes.

Streaming Providers (ProviderCore):

Backend utility service inspired by SparkBoxCore (from FLIXORA-BOX) to resolve and aggregate third-party streaming links (e.g., MovieBox, WeFeed) and serve them securely to the frontend player.

Database (Supabase):

Stores custom curated lists, user watchlists, caching layers, and admin-managed direct links.

✨ Core Features

Advanced Navigation & Filtering: Browse by Movies, TV-Series, Top IMDb, Genres (Action, Horror, Romance, Sci-Fi, etc.), and Countries.

Rich Content Cards: Displays HD quality badges, IMDb ratings, duration, and quick hover previews.

Dedicated Watch Experience (/watch/[id]):

Adaptive HLS video player with quality switching.

Full movie/episode metadata and description.

"Suggestions" and "Latest Movies / TV-Series" grids for continuous discovery.

Serverless Scalability: Hosted on Vercel with global CDN caching for fast load times.

🛠️ Local Setup & Installation

1. Clone the Repository

git clone https://github.com/YOUR-USERNAME/my-movie-site.git
cd my-movie-site


2. Install Dependencies

npm install
# or
yarn install


3. Configure Environment Variables

Create a .env.local file in the root directory of your project and add your Supabase and TMDB credentials:

NEXT_PUBLIC_SUPABASE_URL=https://******************.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_******
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here


Note: Ensure .env.local is listed in your .gitignore file so your keys are never exposed publicly on GitHub.

4. Run the Development Server

npm run dev


Open http://localhost:3000 in your browser to view the application.

🌐 Deployment (GitHub + Vercel)

Push to GitHub:

git add .
git commit -m "Initial project setup"
git push -u origin main


Import to Vercel:

Log in to Vercel with your GitHub account.

Click Add New... > Project and import your repository.

Add Environment Variables:

In the Vercel project configuration screen, open Environment Variables and add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and NEXT_PUBLIC_TMDB_API_KEY.

Deploy:

Click Deploy. Any future git push to the main branch will automatically trigger a live update.

📋 Roadmap

[x] Project Architecture & Data Source Planning

[x] Supabase Database Connection Setup

[ ] Next.js Frontend & Cinematic UI Scaffolding

[ ] TMDB Metadata Integration

[ ] ProviderCore Streaming Link Resolver

[ ] HLS Video Player & Watch Page Implementation

[ ] Vercel Production Deployment
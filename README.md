# Project: File Uploader

A Google Drive-inspired file storage app built with Node.js and Express. Users can upload images, organise them into folders, and share folders via time-limited links.

## Features

- **Authentication** — sign up and log in with a username and password; sessions are persisted in the database
- **File uploads** — upload JPEG, PNG, GIF, and WebP images up to 5MB, stored on Cloudinary
- **Folders** — create and delete folders; deleting a folder removes all its files from Cloudinary automatically
- **File management** — view file details (name, size, upload date), download, and delete files
- **Shared folders** — generate time-limited share links (1–30 days) for folders; anyone with the link can view and download files without an account

## Tech Stack

- **Runtime** — Node.js with Express 5
- **Database** — PostgreSQL via Neon, managed with Prisma 7
- **Storage** — Cloudinary
- **Auth** — Passport.js (local strategy) with bcrypt
- **Sessions** — express-session with Prisma session store
- **Templating** — EJS
- **Validation** — express-validator
- **Security** — Helmet

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Cloudinary](https://cloudinary.com) account

### Installation

1. Clone the repository and install dependencies:

```bash
   git clone https://github.com/bowman025/project-file-uploader.git
   cd img-stack
   npm install
```

2. Create a `.env` file in the root directory:

```env
   DATABASE_URL=your_neon_pooled_connection_string
   DIRECT_URL=your_neon_direct_connection_string
   SESSION_SECRET=your_session_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   STORAGE_MODE=cloudinary
```

3. Run database migrations:

```bash
   npx prisma migrate dev
```

4. Start the development server:

```bash
   node --watch app.js
```

The app will be available at `http://localhost:3000`.

## Deployment

The app is configured for deployment on [Render](https://render.com). Set all environment variables from the `.env` file in your Render dashboard, and set `NODE_ENV=production`.

## Acknowledgements

Built as part of [The Odin Project](https://www.theodinproject.com/lessons/nodejs-file-uploader) Node.js curriculum.

# Adnan Portfolio

A MERN portfolio with a public React site and a secured content-management dashboard. Portfolio data, links, images, certificates, and the resume are stored in MongoDB/Cloudinary and update without rebuilding the site.

## Requirements

- Node.js 20+
- MongoDB Atlas database
- Cloudinary account

## Run locally

1. Create local environment files:

   ```powershell
   Copy-Item server/.env.example server/.env
   Copy-Item client/.env.example client/.env
   ```

2. In `server/.env`, set `MONGODB_URI`, `JWT_SECRET`, admin credentials, and all three Cloudinary values. Keep `CLIENT_URL=http://localhost:5173`.

3. Install and start the API:

   ```powershell
   cd server
   npm ci
   npm run seed:admin      # only when no admin exists yet
   npm run seed:portfolio  # optional sample content
   npm run dev
   ```

4. In a second terminal, start the client:

   ```powershell
   cd client
   npm ci
   npm run dev
   ```

Open `http://localhost:5173`. Admin is at `/admin/login`; API health is at `http://localhost:5000/api/health`.

## Checks

```powershell
cd server; npm run check
cd ../client; npm run build
```

## Deploy on Render

Create two services from the same GitHub repository.

### Backend — Web Service

| Setting | Value |
| --- | --- |
| Root directory | `server` |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health check path | `/api/health` |

Set `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `CLIENT_URL` (the deployed frontend URL). Never commit these secrets.

### Frontend — Static Site

| Setting | Value |
| --- | --- |
| Root directory | `client` |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |

Set `VITE_API_URL` to `https://your-api.onrender.com/api`, then deploy. Update the backend `CLIENT_URL` to the final frontend `onrender.com` URL and redeploy the backend once.

In MongoDB Atlas, allow the backend network in Network Access. For an initial hobby deployment, `0.0.0.0/0` is the simplest option; use a narrower rule when you have a stable egress IP.

Free Render web services sleep after 15 minutes without traffic, so the first API request can be slow. The static frontend remains available.

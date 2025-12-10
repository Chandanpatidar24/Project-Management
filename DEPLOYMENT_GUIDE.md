# 🚀 Vercel Deployment Guide (Monorepo Strategy)

Since your project has both `client` and `server` in one folder, you must deploy them as **Two Separate Projects** on Vercel.

## 1. Deploying the Backend (Server)
This will give us the API URL we need for the frontend.

1.  Go to **Vercel Dashboard** > **Add New...** > **Project**.
2.  Import your Repository (`Project-Management`).
3.  **Configure Project**:
    *   **Project Name**: `promanage-server` (or similar)
    *   **Framework Preset**: Other
    *   **Root Directory**: Click "Edit" and select `server`. **(Crucial Step!)**
4.  **Environment Variables**:
    *   Add `MONGO_URI`: `your_atlas_connection_string`
    *   Add `JWT_SECRET`: `your_random_secret`
    *   Add `NODE_ENV`: `production`
5.  Click **Deploy**.
6.  Once done, go to the **Dashboard** for this project and copy the **Domain** (e.g., `https://promanage-server.vercel.app`).

---

## 2. Deploying the Frontend (Client)
Now we connect the frontend to that backend.

1.  Go to **Vercel Dashboard** > **Add New...** > **Project**.
2.  Import the **Same Repository** again.
3.  **Configure Project**:
    *   **Project Name**: `promanage-client`
    *   **Framework Preset**: Vite
    *   **Root Directory**: Click "Edit" and select `client`. **(Crucial Step!)**
4.  **Environment Variables**:
    *   Add `VITE_API_URL`: Paste your Backend URL from Step 1 (e.g., `https://promanage-server.vercel.app/api`).
    *   **Important**: Add `/api` at the end of the URL.
5.  Click **Deploy**.

## 📝 Why did we change the code?
*   **`vercel.json`**: Vercel uses "Serverless Functions". This file tells Vercel: "Hey, take all requests and send them to my `index.js` file". Without this, you get **404 Errors**.
*   **`api.js` update**: On your laptop, the server is at `localhost:5000`. On the internet, it's at `https://your-app.vercel.app`. We updated the code to listen to `VITE_API_URL` so it automatically switches!

# 🎓 AI-Powered Learning Platform

An easy-to-use, full-stack web app that helps you learn anything faster.

You tell it your learning goal (e.g., "Learn Python basics" or "Understand Photosynthesis"), and it uses **Google Gemini AI** to:
- 📚 Create a structured, step-by-step study plan
- 🧠 Give you quizzes to test your knowledge
- 📊 Provide AI-powered feedback on how you're doing

This guide is written so that **anyone**, even a complete beginner, can set it up and run it. Just follow the steps in order.

---

## 📖 Table of Contents

1. [What You Need Before Starting](#-what-you-need-before-starting)
2. [Project Structure (What's Inside)](#-project-structure-whats-inside)
3. [Step 1: Set Up the Backend](#-step-1-set-up-the-backend)
4. [Step 2: Set Up the Frontend](#-step-2-set-up-the-frontend)
5. [Step 3: Run the App](#-step-3-run-the-app)
6. [Environment Variables Explained](#-environment-variables-explained)
7. [Troubleshooting](#-troubleshooting)

---

## ✅ What You Need Before Starting

Before you begin, make sure you have these three things installed/ready:

| What | Why | Minimum Version |
|------|-----|------------------|
| **Node.js** | Runs both the backend and frontend | v18 or higher |
| **MongoDB** | Stores app data (can be local or a free cloud database like MongoDB Atlas) | Any running instance |
| **Gemini API Key** | Powers the AI features (study plans, quizzes, feedback) | Free from Google AI Studio |

> 💡 **New to this?** Don't worry — you don't need to be an expert. Just install Node.js from [nodejs.org](https://nodejs.org), and sign up for a free MongoDB Atlas account and a free Gemini API key from Google AI Studio.

---

## 📁 Project Structure (What's Inside)

Here's a simple map of the project so you know where everything lives:

```
├─ Backend/                     → The "engine" of the app (Node.js/Express API)
│   ├─ src/
│   │   ├─ index.js             → Starting point: connects to database & starts server
│   │   ├─ app.js                → Sets up all the app's routes
│   │   ├─ controllers/
│   │   │   └─ geminiController.js  → Talks to Gemini AI to create study plans
│   │   └─ db/
│   │       └─ index.js          → Connects to MongoDB
│   └─ package.json              → List of backend dependencies
│
├─ project frontend/             → The part you see and click on (React + Vite)
│   ├─ src/
│   │   ├─ main.jsx               → Starting point of the website
│   │   ├─ App.jsx                → Main app layout
│   │   ├─ api/axiosInstance.js   → Connects frontend to backend
│   │   ├─ components/            → Reusable UI pieces (buttons, cards, etc.)
│   │   ├─ pages/                 → Full pages (Dashboard, Quiz, etc.)
│   │   └─ lib/gemini.js          → Describes the AI's response format
│   └─ package.json               → List of frontend dependencies
```

**In short:**
- `Backend/` = the brain (handles data + talks to AI)
- `project frontend/` = the face (what users see in the browser)

---

## ⚙️ Step 1: Set Up the Backend

The backend is the part that connects to the database and to Gemini AI.

1. **Open a terminal and go into the Backend folder:**
   ```bash
   cd Backend
   ```

2. **Install the required packages:**
   ```bash
   npm install
   ```

3. **Create a file named `.env`** inside the `Backend` folder, and paste this into it:
   ```text
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   ```
   Replace `your_mongodb_connection_string` and `your_gemini_api_key` with your real values.

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

   ✅ If everything works, you'll see a message saying it's connected to MongoDB and running on port `8000`.

---

## 🎨 Step 2: Set Up the Frontend

The frontend is the website you'll actually interact with.

1. **Open a new terminal window** (keep the backend one running) and go into the frontend folder:
   ```bash
   cd "project frontend"
   ```

2. **Install the required packages:**
   ```bash
   npm install
   ```

3. **Create a file named `.env.local`** inside the `project frontend` folder, and add:
   ```text
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the frontend:**
   ```bash
   npm run dev
   ```

   ✅ This will start a local website, usually at `http://localhost:3000`.

---

## 🚀 Step 3: Run the App

Once both servers are running:

1. Make sure the **backend** is running (Step 1).
2. Make sure the **frontend** is running (Step 2).
3. Open your browser and go to:
   ```
   http://localhost:3000
   ```

### What happens next?
- You'll enter a **learning goal** on the site.
- The frontend sends this to the backend.
- The backend asks **Gemini AI** to generate a structured study plan (in JSON format).
- After you complete a quiz, the backend can ask Gemini again to generate a **personalized feedback report**.

---

## 🔑 Environment Variables Explained

These are small settings files that hold your private keys and configuration. Never share these publicly or upload them to GitHub.

| Variable | Goes In | What It Does |
|----------|---------|---------------|
| `PORT` | `Backend/.env` | The port the backend server runs on (default: `8000`) |
| `MONGO_URI` | `Backend/.env` | Your MongoDB database connection link |
| `GEMINI_API_KEY` | Both `Backend/.env` **and** `project frontend/.env.local` | Your Google Gemini API key, needed for AI features |

---

## 🛠️ Troubleshooting

**"Cannot connect to MongoDB"**
→ Double-check your `MONGO_URI` is correct and that your MongoDB instance is running (or that your IP is allowed if using Atlas).

**"Gemini API errors / no AI response"**
→ Make sure your `GEMINI_API_KEY` is valid and added to *both* the backend `.env` and frontend `.env.local`.

**"Port already in use"**
→ Another app might be using port `8000` or `3000`. Either close that app or change the `PORT` value in your `.env` file.

**Frontend loads but nothing works**
→ Make sure the backend server is running *first*, before you use the site.

---

## 📄 License

No license file is currently included in this project. Please refer to the individual `package.json` files for author details.

---

*This README was written to be beginner-friendly — if you get stuck, re-read the step you're on slowly, and make sure every file/folder name matches exactly.*

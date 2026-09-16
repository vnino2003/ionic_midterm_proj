# Midterm Project — Simple Notes Organizer

A mobile-friendly Notes Organizer app built with **Ionic Framework + Vue 3 + Firebase Realtime Database**. Users can create, read, update, and delete notes with title, content, category, date created, and status (Important or Normal).

**Topic #20** from the Midterm Project list.

---

## Features

- **Create** notes with title, content, category, and status
- **Read** all notes in real-time (auto-updates when database changes)
- **Update** existing notes via edit button
- **Delete** notes via trash button
- **Filter** notes by status: All, Important, or Normal
- **Categories**: Personal, School, Work, Ideas, Other (color-coded borders)
- **Date tracking**: auto-records when each note was created
- **Toast notifications**: success/error feedback on every action

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Ionic Framework** | 8.x | Mobile UI components (cards, modals, FABs, toasts, chips) |
| **Vue 3** | 3.5.x | JavaScript framework (Composition API with `<script setup>`) |
| **Firebase Realtime Database** | 11.x SDK | Cloud NoSQL database — stores notes in real-time |
| **Capacitor** | 6.x | Native bridge — wraps the web app into an Android APK |
| **Vite** | 6.x | Fast build tool |
| **TypeScript** | 5.7.x | Type-safe JavaScript |
| **Ionicons** | 7.x | Icon library for UI icons |
| **Vue Router** | 4.x | Client-side routing |
| **GitHub Actions** | — | CI/CD — builds the Android APK in the cloud (manual trigger) |

---

## Prerequisites / Requirements

Before setting up the project, make sure you have the following installed:

| Requirement | Version | Download |
|---|---|---|
| **Node.js** | 22+ | https://nodejs.org |
| **npm** | 10+ | Comes with Node.js |
| **Git** | Latest | https://git-scm.com |
| **Firebase account** | — | https://console.firebase.google.com |

---

## Step-by-Step Setup Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/vnino2003/ionic_midterm_proj.git
cd ionic_midterm_proj
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs the following packages:
- `@ionic/vue` and `@ionic/vue-router` — Ionic UI framework for Vue
- `firebase` — Firebase JavaScript SDK (v11) for database operations
- `vue` and `vue-router` — Vue 3 framework and router
- `ionicons` — Icon library
- `vite` — Build tool
- `typescript` and `vue-tsc` — TypeScript support

### Step 3: Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Enter a project name (e.g., `ionic-midterm`)
4. Disable Google Analytics (optional, not needed for this app)
5. Click **"Create project"**
6. Wait for the project to be created, then click **"Continue"**

### Step 4: Create a Realtime Database

1. In the Firebase Console sidebar, go to **Build > Realtime Database**
2. Click **"Create Database"**
3. Choose a location/region (e.g., **Singapore / asia-southeast1**)
4. Select **"Start in test mode"** — this sets the security rules to allow read/write access:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

**Why test mode (true/true)?**
By default, Firebase Realtime Database starts in **locked mode** where `.read` and `.write` are set to `false`. This blocks all read and write operations from the app. We change both rules to `true` so the app can perform CRUD operations (Create, Read, Update, Delete) without requiring user authentication. This is appropriate for development and school projects. For production apps, you would add proper authentication rules.

### Step 5: Register a Web App in Firebase

1. In the Firebase Console, go to **Project Settings** (gear icon at top-left)
2. Scroll down to **"Your apps"** section
3. Click the web icon **(</>)** to add a web app
4. Enter an app nickname (e.g., `notes-organizer-web`)
5. Click **"Register app"**
6. Firebase will show you the config object — you will need these values in the next step

### Step 6: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase credentials from Step 5:
   ```
   VITE_FIREBASE_API_KEY="your-api-key-here"
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   VITE_FIREBASE_DATABASE_URL="https://your-project-default-rtdb.region.firebasedatabase.app"
   ```

3. The **Database URL** is found in: **Realtime Database > Data tab** — it's the URL shown at the top of the page (e.g., `https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app`)

**Important:** The `.env` file is excluded from git via `.gitignore` to keep your credentials private. Never commit this file.

### Step 7: Run the App

```bash
npm run dev
```

Open http://localhost:5173 in your browser. The app is now running and connected to Firebase.

---

## How It Works

### Firebase Initialization (`src/firebase.ts`)

The app reads Firebase credentials from environment variables (prefixed with `VITE_` so Vite exposes them to the frontend) and initializes the Firebase app and Realtime Database connection:

```typescript
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
```

### Data Structure in Firebase

```json
{
  "notes": {
    "-NxAbCdEfG": {
      "title": "Study for Midterms",
      "content": "Review chapters 5-8...",
      "category": "School",
      "dateCreated": "2026-09-16T12:00:00.000Z",
      "status": "Important"
    }
  }
}
```

Each note is stored under a unique key generated by Firebase `push()`. The `notes` node is the root collection.

### CRUD Operations

| Operation | Firebase Function | What It Does |
|---|---|---|
| **Create** | `push()` + `set()` | Generates a unique key and writes the note data |
| **Read** | `onValue()` | Real-time listener — UI updates automatically when data changes in Firebase |
| **Update** | `set()` | Overwrites the existing note at its key, preserving the original dateCreated |
| **Delete** | `remove()` | Removes the note by its key from the database |

### App Flow

```
User taps [+] FAB button
    → Modal opens with form (title, content, category, status)
    → User fills form and taps "Save Note"
    → push() + set() writes to Firebase
    → onValue() listener fires automatically
    → notes array updates → UI re-renders with new card
```

---

## Folder Structure

```
ionic-midterm_project/
├── .github/
│   └── workflows/
│       └── build-apk.yml       # GitHub Actions — builds APK (manual trigger)
├── android/                    # Capacitor Android project (auto-generated)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/.../MainActivity.java
│   │   │   ├── res/            # Android resources (icons, splash, layouts)
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle        # App-level Gradle config
│   ├── build.gradle            # Project-level Gradle config
│   ├── gradle/                 # Gradle wrapper
│   └── variables.gradle        # SDK/build tool versions
├── src/
│   ├── main.ts                 # App bootstrap — Vue + Ionic + Router
│   ├── App.vue                 # Root component
│   ├── firebase.ts             # Firebase initialization (reads .env vars)
│   ├── router/
│   │   └── index.ts            # Routes: "/" → "/home"
│   ├── views/
│   │   └── HomePage.vue        # Main app — all CRUD UI and logic
│   ├── theme/
│   │   └── variables.css       # Custom color theme
│   └── vite-env.d.ts           # TypeScript env variable declarations
│
├── .env                        # Firebase credentials (NOT in git)
├── .env.example                # Template — copy to .env and fill in
├── .gitignore                  # Excludes .env, node_modules, dist
├── capacitor.config.ts         # Capacitor config (appId, appName, webDir)
├── index.html                  # HTML entry point
├── ionic.config.json           # Ionic project config
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript config
└── vite.config.ts              # Vite build config
```

---

## Key File: `src/views/HomePage.vue`

This single file contains the entire app UI and logic:

**UI Components Used:**
- `IonFab` + `IonFabButton` — floating [+] button to add notes
- `IonModal` — full-screen form for creating/editing notes
- `IonInput` — text input for title
- `IonTextarea` — multi-line input for content
- `IonSelect` + `IonSelectOption` — dropdown for category (Personal, School, Work, Ideas, Other)
- `IonToast` — popup notification for success/error feedback
- Custom filter chips — All / Important / Normal with active state styling
- Custom status toggle — Normal / Important with color-coded selection
- Note cards — color-coded left border per category, status badge, edit/delete icons

**Firebase Functions Used:**
- `dbRef(database, 'notes')` — points to the "notes" node in the database
- `push(ref)` — generates a unique key for a new note
- `set(ref, data)` — writes or updates data at a reference
- `remove(ref)` — deletes data at a reference
- `onValue(ref, callback)` — listens for real-time changes

---

## Firebase Security Rules Explained

The Realtime Database uses the following rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

| Rule | Default | Our Setting | Why |
|---|---|---|---|
| `.read` | `false` | `true` | Allows the app to read/fetch notes from the database without authentication |
| `.write` | `false` | `true` | Allows the app to create, update, and delete notes without authentication |

**Default (`false`):** When you first create a Realtime Database in locked mode, both read and write are denied. The app would get "Permission denied" errors on every operation.

**Test mode (`true`):** Allows any client to read and write data. This is suitable for development, testing, and school projects where authentication is not required.

**Production consideration:** For a production app, you would replace these rules with authentication-based rules, e.g.:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

---

## Building the Android APK

The project uses **Capacitor** to wrap the web app into a native Android APK, and **GitHub Actions** to build it in the cloud.

### What is Capacitor?

Capacitor is a native bridge that takes your web app (HTML/CSS/JS built by Vite into `dist/`) and packages it inside a native Android WebView. The result is a `.apk` file you can install on any Android phone — the app looks and feels like a native app but runs your Ionic/Vue code inside.

### How the APK Build Works (Step by Step)

The GitHub Actions workflow (`.github/workflows/build-apk.yml`) runs these steps automatically in the cloud:

```
1. Checkout           → Downloads your code from GitHub
2. Setup Node.js 22   → Installs Node.js to run npm commands
3. npm ci             → Installs all dependencies (Ionic, Vue, Firebase, etc.)
4. npm run build      → Vite compiles Vue/TypeScript into static HTML/CSS/JS in dist/
5. Setup Java 21      → Installs Java (required by Android's Gradle build system)
6. npx cap sync       → Copies dist/ into android/app/src/main/assets/public/
                         so the Android app can load the web files
7. gradlew assembleDebug → Gradle compiles the Android project into an APK
8. Upload artifact    → Saves the APK as a downloadable file on GitHub
```

### How to Get the APK

1. Go to your repo: https://github.com/vnino2003/ionic_midterm_proj
2. Click the **"Actions"** tab
3. Click **"Build Notes Organizer APK"** on the left sidebar
4. Click the **"Run workflow"** dropdown button (top right)
5. Click the green **"Run workflow"** button
6. Wait for the build to finish (takes ~3-5 minutes, green checkmark when done)
7. Click on the completed workflow run
8. Scroll down to **"Artifacts"** section
9. Click **"NotesOrganizer-APK"** to download the `.zip` file
10. Extract the `.zip` → you get `NotesOrganizer.apk`
11. Transfer the APK to your phone and install it

**Note:** The workflow is set to **manual trigger only** (`workflow_dispatch`). It does NOT run automatically on push — you have to click "Run workflow" each time you want a new APK.

### Why Manual Trigger?

The workflow uses `workflow_dispatch` instead of `on: push` so you control exactly when to build. This saves GitHub Actions minutes and lets you push code changes without triggering a build every time. When you're ready for a new APK, you manually trigger it from the Actions tab.

### Capacitor Config (`capacitor.config.ts`)

```typescript
const config: CapacitorConfig = {
  appId: 'com.example.notesorganizer',   // Unique Android package name
  appName: 'Notes Organizer',             // App name shown on the phone
  webDir: 'dist'                          // Folder where Vite outputs the build
};
```

- **appId** — The unique identifier for the Android app (like a package name in Java). Must be in reverse-domain format.
- **appName** — The name that appears under the app icon on your phone.
- **webDir** — Tells Capacitor where to find the built web files. Vite outputs to `dist/` when you run `npm run build`.

---

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install all dependencies |
| `npm run dev` | Start dev server (http://localhost:5173) |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npx cap sync android` | Copy web build into Android project |

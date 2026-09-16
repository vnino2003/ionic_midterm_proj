# Midterm Project — Simple Notes Organizer

A mobile-friendly Notes Organizer app built with **Ionic Framework + Vue 3 + Firebase Realtime Database**. Users can create, read, update, and delete notes with title, content, category, date created, and status (Important or Normal). The app is built as a web app and then packaged into an Android APK using **Capacitor**.

**Topic #20** from the Midterm Project list.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [How the Project Was Built (Full Explanation)](#how-the-project-was-built-full-explanation)
4. [Folder Structure & What Each File Does](#folder-structure--what-each-file-does)
5. [How Firebase Works in This App](#how-firebase-works-in-this-app)
6. [How the `.env` File Works](#how-the-env-file-works)
7. [How Each CRUD Operation Works](#how-each-crud-operation-works)
8. [How Capacitor Turns the Web App into an Android APK](#how-capacitor-turns-the-web-app-into-an-android-apk)
9. [How GitHub Actions Builds the APK](#how-github-actions-builds-the-apk)
10. [Firebase Security Rules Explained](#firebase-security-rules-explained)
11. [Prerequisites / Requirements](#prerequisites--requirements)
12. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
13. [Commands](#commands)

---

## Features

- **Create** notes with title, content, category, and status
- **Read** all notes in real-time (auto-updates when database changes)
- **Update** existing notes via edit button
- **Delete** notes with confirmation dialog
- **Search** notes by title, content, or category
- **Filter** notes by status (All, Important, Normal) and by category
- **Sort** notes by newest, oldest, or title A–Z
- **View modes** — grid view or list view
- **Categories**: Personal, School, Work, Ideas, Other (color-coded)
- **Connection status** — shows live Firebase connection indicator
- **Responsive** — works on mobile and desktop with sidebar navigation
- **Toast notifications** — success/error feedback on every action

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Ionic Framework** | 8.x | Mobile UI components (modals, toasts, buttons, inputs) |
| **Vue 3** | 3.5.x | JavaScript framework (Composition API with `<script setup>`) |
| **Firebase Realtime Database** | 11.x SDK | Cloud NoSQL database — stores notes in real-time |
| **Capacitor** | 8.x | Native bridge — wraps the web app into an Android APK |
| **Vite** | 6.x | Fast build tool — compiles Vue/TypeScript into static files |
| **TypeScript** | 5.7.x | Type-safe JavaScript |
| **Ionicons** | 7.x | Icon library for UI icons |
| **Vue Router** | 4.x | Client-side routing |
| **GitHub Actions** | — | CI/CD — builds the Android APK in the cloud (manual trigger) |

---

## How the Project Was Built (Full Explanation)

This section explains the full architecture — how every piece connects, from writing Vue code to getting an APK on your phone.

### Layer 1: Vue 3 — The JavaScript Framework

**Vue 3** is the JavaScript framework that handles the app's logic and UI rendering. We use the **Composition API** with `<script setup>`, which is Vue's modern syntax.

How it works:
- You write `.vue` files that contain three sections: `<template>` (HTML), `<script setup>` (JavaScript/TypeScript logic), and `<style>` (CSS)
- Vue's **reactivity system** tracks variables created with `ref()` and `computed()` — when a variable changes, Vue automatically re-renders the parts of the UI that depend on it
- For example, when `notes.value` changes (after Firebase sends new data), all the note cards in the template re-render automatically

```
Vue Component Structure:
┌──────────────────────────────────────────────────────┐
│  <template>     → What the user sees (HTML)          │
│  <script setup> → Logic, variables, functions (TS)   │
│  <style scoped> → How it looks (CSS, scoped to file) │
└──────────────────────────────────────────────────────┘
```

### Layer 2: Ionic Framework — The UI Component Library

**Ionic** sits on top of Vue and provides pre-built mobile UI components. Instead of building buttons, modals, inputs, and toasts from scratch, we import them from `@ionic/vue`.

Components used in this app:
- `IonPage`, `IonContent` — page structure
- `IonModal` — the popup form for creating/editing notes
- `IonInput`, `IonTextarea` — text fields in the form
- `IonSelect`, `IonSelectOption` — dropdown for category selection
- `IonToast` — popup notification (e.g., "Note saved")
- `IonButton`, `IonIcon` — buttons and icons
- `IonSpinner` — loading spinner when saving

Ionic also provides `@ionic/vue-router` which wraps Vue Router for page transitions.

### Layer 3: Vite — The Build Tool

**Vite** is the build tool that processes your source code:

**During development (`npm run dev`):**
- Starts a local dev server at http://localhost:5173
- Serves `.vue` files with hot module replacement (HMR) — when you save a file, the browser updates instantly without a full page reload
- Resolves `import` statements, handles TypeScript, and processes CSS

**During production build (`npm run build`):**
- Compiles all `.vue`, `.ts`, and `.css` files into optimized static files
- Outputs everything into the `dist/` folder:
  - `dist/index.html` — the single HTML page
  - `dist/assets/*.js` — all JavaScript bundled and minified
  - `dist/assets/*.css` — all CSS bundled and minified
- These are plain static files — they can run in any browser or web server

```
Source Code (what you write)          Build Output (what runs)
─────────────────────────────         ──────────────────────────
src/main.ts                           dist/index.html
src/App.vue                     →     dist/assets/index-abc123.js
src/views/HomePage.vue          →     dist/assets/index-abc123.css
src/firebase.ts
src/components/NoteCard.vue
src/utils/notes.ts
```

**Key config — `vite.config.ts`:**
```typescript
export default defineConfig({
  plugins: [vue()],           // Enables .vue file processing
  resolve: {
    alias: { '@': './src' }   // So you can write @/firebase instead of ../firebase
  }
})
```

### Layer 4: Firebase Realtime Database — The Backend

**Firebase Realtime Database** is a cloud-hosted NoSQL database by Google. Instead of setting up your own server, database, and API, Firebase gives you a ready-to-use database that your app connects to directly from the frontend.

Key characteristics:
- **NoSQL** — data is stored as a JSON tree, not tables/rows like SQL
- **Real-time** — when data changes in the database, all connected clients receive the update instantly via WebSocket
- **Serverless** — no backend server needed; the app talks to Firebase directly using the JavaScript SDK

### Layer 5: Capacitor — The Native Bridge

**Capacitor** takes your web app and wraps it inside a native Android application. Here's what actually happens:

1. You run `npm run build` → Vite outputs static files to `dist/`
2. You run `npx cap sync android` → Capacitor copies `dist/` into `android/app/src/main/assets/public/`
3. The Android app's `MainActivity.java` loads a **WebView** (a built-in browser component) and points it to the copied web files
4. The result is a native Android app that's basically your web app running inside a full-screen browser — but the user sees it as a normal app with an icon on their home screen

```
Your Web App (dist/)
    ↓ cap sync
Android Project (android/)
    ↓ Gradle build
APK File (NotesOrganizer.apk)
    ↓ Install
App on phone (runs in a WebView)
```

**`capacitor.config.ts`:**
```typescript
const config: CapacitorConfig = {
  appId: 'com.example.notesorganizer',  // Unique Android package name
  appName: 'Notes Organizer',            // Name shown under the app icon
  webDir: 'dist'                         // Where Vite outputs the build
};
```

- **appId** — The unique identifier for the Android app, like a reverse-domain package name (`com.example.notesorganizer`). Every Android app must have a unique one.
- **appName** — The label shown under the app icon on the phone's home screen.
- **webDir** — Tells Capacitor where to find the built web files. This must match Vite's output directory.

### Layer 6: GitHub Actions — Cloud Build

Since building an Android APK requires Java, Gradle, and the Android SDK (which are large and complex), we use **GitHub Actions** to build it in the cloud instead of locally. GitHub provides a free Ubuntu virtual machine that runs the build for us.

---

## Folder Structure & What Each File Does

```
ionic-midterm_project/
│
├── .github/
│   └── workflows/
│       └── build-apk.yml           # GitHub Actions workflow — builds the APK
│
├── android/                         # Capacitor Android project (auto-generated)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/public/       # Where cap sync copies your dist/ files
│   │   │   ├── java/.../MainActivity.java  # Android entry point — loads WebView
│   │   │   ├── res/                 # Android resources (icons, splash screens)
│   │   │   └── AndroidManifest.xml  # Android app config (permissions, app name)
│   │   └── build.gradle             # App-level Gradle build config
│   ├── build.gradle                 # Project-level Gradle config
│   ├── gradle/                      # Gradle wrapper (build system)
│   ├── gradlew                      # Gradle executable (Linux/Mac)
│   ├── gradlew.bat                  # Gradle executable (Windows)
│   └── variables.gradle             # SDK versions, build tool versions
│
├── src/                             # YOUR SOURCE CODE — everything you write
│   ├── main.ts                      # App entry point — bootstraps Vue + Ionic
│   ├── App.vue                      # Root Vue component
│   ├── firebase.ts                  # Firebase initialization and database connection
│   ├── router/
│   │   └── index.ts                 # Vue Router — defines app routes/pages
│   ├── views/
│   │   └── HomePage.vue             # Main page — all CRUD UI and logic
│   ├── components/
│   │   └── NoteCard.vue             # Reusable note card component
│   ├── utils/
│   │   └── notes.ts                 # Helper functions (filtering, sorting, types)
│   ├── theme/
│   │   └── variables.css            # Custom colors, fonts, global styles
│   └── vite-env.d.ts                # TypeScript declarations for env variables
│
├── .env                             # Firebase credentials (NOT in git — private)
├── .env.example                     # Template — shows what .env should look like
├── .gitignore                       # Files excluded from git (node_modules, .env, dist)
├── capacitor.config.ts              # Capacitor config (appId, appName, webDir)
├── index.html                       # HTML entry point — loads main.ts
├── ionic.config.json                # Ionic project metadata
├── package.json                     # Dependencies and npm scripts
├── package-lock.json                # Exact dependency versions (auto-generated)
├── tsconfig.json                    # TypeScript compiler settings
└── vite.config.ts                   # Vite build tool configuration
```

### What Each Key File Does

**`index.html`** — The single HTML file. The browser loads this first. It contains a `<div id="app">` and a `<script>` tag that loads `main.ts`. Everything else is rendered dynamically by Vue inside that div.

**`src/main.ts`** — The app's entry point. It:
1. Creates the Vue app instance with `createApp(App)`
2. Installs the Ionic plugin with `.use(IonicVue)` so Ionic components work
3. Installs the Router with `.use(router)` so page navigation works
4. Imports all Ionic CSS files (normalize, structure, typography, etc.)
5. Imports the custom theme from `theme/variables.css`
6. Mounts the app to `#app` div after the router is ready

**`src/App.vue`** — The root component. Contains `<ion-app>` and `<ion-router-outlet>`. The router outlet is where page components (like HomePage) get rendered.

**`src/router/index.ts`** — Defines the app's routes:
- `/` redirects to `/home`
- `/home` loads `HomePage.vue`

**`src/firebase.ts`** — Initializes Firebase:
1. Reads credentials from environment variables (`import.meta.env.VITE_FIREBASE_*`)
2. Calls `initializeApp()` with those credentials to connect to your Firebase project
3. Calls `getDatabase()` to get a reference to the Realtime Database
4. Exports `database` so other files can use it

**`src/views/HomePage.vue`** — The main page with all the app logic:
- **Template** — Sidebar navigation, filter chips, search bar, sort/view toggle, note cards grid, modal form for creating/editing, reader modal for viewing a note, toast notifications
- **Script** — All CRUD functions (`loadNotes`, `saveNote`, `confirmDelete`), filter/search/sort logic, Firebase listeners, form validation, connection status tracking
- **Style** — Layout and visual design (sidebar, cards, responsive breakpoints)

**`src/components/NoteCard.vue`** — A reusable component for displaying a single note card. Receives a `note` prop and emits events (`read`, `edit`, `delete`) when buttons are clicked.

**`src/utils/notes.ts`** — Shared types and helper functions:
- `Note` interface — defines the shape of a note object
- `categories` — the list of categories (Personal, School, Work, Ideas, Other)
- `selectNotes()` — filters and sorts the notes array based on active filters
- `formatDate()` — converts ISO date string to readable format
- `categoryClass()` — returns CSS class name for color-coding

**`src/theme/variables.css`** — Global CSS variables and styles:
- Colors: `--canvas` (background), `--accent` (green primary), `--ink` (text), `--muted` (secondary text)
- Category colors: each category has its own `--category-color`, `--category-bg`, `--category-text`
- Button styles: `.primary-button`, `.secondary-button`, `.icon-button`
- Ionic overrides: `--ion-color-primary`, `--ion-background-color`, etc.

---

## How Firebase Works in This App

### Step 1: Creating the Firebase Project

1. Go to https://console.firebase.google.com
2. Create a new project (e.g., `ionic-midterm-8763e`)
3. Go to **Build > Realtime Database** and click **Create Database**
4. Choose a region (e.g., Singapore / asia-southeast1)
5. Set to **test mode** (read/write = true)

### Step 2: Registering a Web App

1. Go to **Project Settings > Your apps > Add web app (</>)**
2. Firebase generates a config object with these values:
   - `apiKey` — identifies your Firebase project (not a secret per se, but should be protected)
   - `authDomain` — used for authentication redirects
   - `projectId` — your Firebase project's unique ID
   - `storageBucket` — for file storage (not used in this app)
   - `messagingSenderId` — for push notifications (not used in this app)
   - `appId` — unique identifier for this specific web app
3. The **databaseURL** is NOT included in the config snippet — you get it from the Realtime Database page. It looks like `https://your-project-default-rtdb.region.firebasedatabase.app`

### Step 3: Connecting the App to Firebase

The credentials go into the `.env` file. The app reads them at build time through `import.meta.env.VITE_FIREBASE_*` and passes them to `initializeApp()` in `firebase.ts`.

```
Firebase Console                     .env file                           firebase.ts
──────────────                       ─────────                           ───────────
apiKey: "AIzaS..."         →    VITE_FIREBASE_API_KEY="AIzaS..."   →   import.meta.env.VITE_FIREBASE_API_KEY
databaseURL: "https://..." →    VITE_FIREBASE_DATABASE_URL="..."   →   import.meta.env.VITE_FIREBASE_DATABASE_URL
(etc.)                                                                  ↓
                                                                   initializeApp(config)
                                                                        ↓
                                                                   getDatabase(app)
                                                                        ↓
                                                                   export { database }
                                                                        ↓
                                                                   HomePage.vue imports and uses it
```

---

## How the `.env` File Works

### What is `.env`?

`.env` is a configuration file that stores sensitive values (like API keys) outside of your source code. It's a simple text file with `KEY="value"` pairs, one per line.

### Why Use `.env` Instead of Hardcoding?

1. **Security** — The `.env` file is in `.gitignore`, so it's never pushed to GitHub. Your API keys stay private.
2. **Flexibility** — Different developers can have different Firebase projects. Each person creates their own `.env` with their own credentials.
3. **Best practice** — A `.env.example` file (without real values) is committed to git as a template. New developers copy it to `.env` and fill in their own credentials.

### How Vite Reads `.env`

Vite has built-in `.env` support:
- It reads the `.env` file when the dev server starts or when you build
- Only variables prefixed with `VITE_` are exposed to the frontend code (for security — prevents accidentally exposing server-side secrets)
- You access them with `import.meta.env.VITE_VARIABLE_NAME`

```
.env file:
    VITE_FIREBASE_API_KEY="AIzaSyB-xxxxx"

In code (firebase.ts):
    import.meta.env.VITE_FIREBASE_API_KEY  // → "AIzaSyB-xxxxx"
```

### The `.env` File Contents

```
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_DATABASE_URL="https://your-project-default-rtdb.region.firebasedatabase.app"
```

Each value comes from your Firebase Console. The `DATABASE_URL` comes from the Realtime Database page (not the config snippet).

---

## How Each CRUD Operation Works

### Data Structure in Firebase

All notes are stored under a single `notes` node in the Realtime Database:

```json
{
  "notes": {
    "-NxAbCdEfG": {
      "title": "Study for Midterms",
      "content": "Review chapters 5-8...",
      "category": "School",
      "dateCreated": "2026-09-16T12:00:00.000Z",
      "status": "Important"
    },
    "-NyBcDeFgH": {
      "title": "Buy groceries",
      "content": "Milk, eggs, bread...",
      "category": "Personal",
      "dateCreated": "2026-09-15T08:30:00.000Z",
      "status": "Normal"
    }
  }
}
```

Each note has a **unique key** (like `-NxAbCdEfG`) generated by Firebase `push()`.

### CREATE — Adding a New Note

```
User taps "New note" button
    → Modal opens with empty form
    → User fills in title, content, category, status
    → User taps "Save note"
    → Code runs:
        const target = push(dbRef(database, 'notes'))   // Generate unique key
        await set(target, {                              // Write data at that key
          title: "Study for Midterms",
          content: "Review chapters 5-8...",
          category: "School",
          dateCreated: "2026-09-16T12:00:00.000Z",
          status: "Important"
        })
    → Firebase adds the note to the database
    → onValue() listener fires automatically
    → UI updates with the new note card
```

- `push()` creates a new child reference under `notes/` with a unique auto-generated key
- `set()` writes the data at that reference

### READ — Loading All Notes (Real-Time)

```
App starts (onMounted)
    → Code runs:
        onValue(dbRef(database, 'notes'), (snapshot) => {
          const data = snapshot.val()        // Get all notes as an object
          notes.value = Object.entries(data) // Convert to array for Vue
        })
    → Firebase sends current data immediately
    → Firebase keeps the connection open via WebSocket
    → Whenever ANY client adds/edits/deletes a note:
        → Firebase pushes the update to ALL connected clients
        → The callback fires again with the new data
        → Vue re-renders the UI automatically
```

- `onValue()` is a **real-time listener** — it doesn't just fetch once, it stays connected
- This means if you open the app on two devices, changes on one instantly appear on the other

### UPDATE — Editing an Existing Note

```
User taps edit icon on a note card
    → Modal opens with the note's current data pre-filled
    → User modifies fields
    → User taps "Save changes"
    → Code runs:
        const target = dbRef(database, 'notes/-NxAbCdEfG')  // Point to existing key
        await set(target, {
          title: "Study for Midterms (Updated)",
          content: "Review chapters 5-10...",
          category: "School",
          dateCreated: "2026-09-16T12:00:00.000Z",  // Keep original date
          status: "Important"
        })
    → Firebase overwrites the data at that key
    → onValue() fires → UI updates
```

- We use `set()` on the existing key (not `push()`, which would create a new one)
- The original `dateCreated` is preserved so the note keeps its creation date

### DELETE — Removing a Note

```
User taps delete icon on a note card
    → Confirmation dialog appears ("Delete this note?")
    → User confirms
    → Code runs:
        const target = dbRef(database, 'notes/-NxAbCdEfG')
        await remove(target)          // Delete the note at this key
    → Firebase removes the node from the database
    → onValue() fires → UI updates (card disappears)
```

- `remove()` deletes the entire node at that reference

### Summary of Firebase Functions

| Function | Import | What It Does |
|---|---|---|
| `initializeApp(config)` | `firebase/app` | Connects to your Firebase project |
| `getDatabase(app)` | `firebase/database` | Gets reference to the Realtime Database |
| `ref(database, path)` | `firebase/database` | Points to a specific location in the database (aliased as `dbRef`) |
| `push(ref)` | `firebase/database` | Generates a new child reference with a unique key |
| `set(ref, data)` | `firebase/database` | Writes/overwrites data at a reference |
| `remove(ref)` | `firebase/database` | Deletes data at a reference |
| `onValue(ref, callback)` | `firebase/database` | Listens for real-time changes — callback fires on every update |

---

## How Capacitor Turns the Web App into an Android APK

### The Problem

A web app runs in a browser — you can't install it on an Android phone as a standalone app with an icon. We need something to wrap it.

### The Solution: Capacitor

Capacitor creates a native Android project that contains a **WebView** — which is basically a browser component built into Android. The app loads your web files (HTML/CSS/JS) inside this WebView.

### Step-by-Step Process

```
Step 1: Install Capacitor
    npm install @capacitor/core @capacitor/cli @capacitor/android

Step 2: Initialize
    npx cap init "Notes Organizer" "com.example.notesorganizer" --web-dir dist
    → Creates capacitor.config.ts

Step 3: Add Android platform
    npx cap add android
    → Creates the entire android/ folder with a native Android project

Step 4: Build the web app
    npm run build
    → Vite compiles everything into dist/

Step 5: Copy web files to Android
    npx cap sync android
    → Copies dist/ → android/app/src/main/assets/public/
    → Updates Android plugin dependencies

Step 6: Build the APK
    cd android && ./gradlew assembleDebug
    → Gradle compiles the Android project into an APK file
    → Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### What's Inside the Android Project

- **`MainActivity.java`** — The Android entry point. Extends `BridgeActivity` (from Capacitor). When the app opens, it loads the WebView and points it to `assets/public/index.html` — your built web app.
- **`AndroidManifest.xml`** — Declares the app's package name, permissions, and main activity.
- **`assets/public/`** — Your entire built web app lives here after `cap sync`.
- **`build.gradle`** — Gradle build configuration (SDK version, dependencies, etc.).

---

## How GitHub Actions Builds the APK

### What is GitHub Actions?

GitHub Actions is a CI/CD service built into GitHub. It runs commands on a virtual machine (Ubuntu Linux) in the cloud. You define the steps in a YAML workflow file.

### The Workflow File (`.github/workflows/build-apk.yml`)

```yaml
name: Build Notes Organizer APK

on:
  workflow_dispatch:          # Manual trigger only (not on push)

jobs:
  build-apk:
    runs-on: ubuntu-latest    # Uses a free Ubuntu virtual machine
    steps:
      # 1. Download your code from GitHub
      - name: Checkout project
        uses: actions/checkout@v4

      # 2. Install Node.js 22 (needed for npm)
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      # 3. Install all npm packages (Ionic, Vue, Firebase, etc.)
      - name: Install npm dependencies
        run: npm ci

      # 4. Build the web app (Vite compiles to dist/)
      - name: Build Ionic application
        run: npm run build

      # 5. Install Java 21 (needed by Gradle/Android build)
      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      # 6. Copy dist/ into android project
      - name: Sync Capacitor Android
        run: npx cap sync android

      # 7. Make Gradle executable
      - name: Make Gradle executable
        run: chmod +x android/gradlew

      # 8. Compile the Android project into an APK
      - name: Build Android APK
        working-directory: android
        run: ./gradlew assembleDebug

      # 9. Rename the output APK
      - name: Rename APK
        run: cp android/app/build/outputs/apk/debug/app-debug.apk NotesOrganizer.apk

      # 10. Upload APK as a downloadable artifact
      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: NotesOrganizer-APK
          path: NotesOrganizer.apk
          retention-days: 30
```

### How to Get the APK

1. Go to https://github.com/vnino2003/ionic_midterm_proj
2. Click the **"Actions"** tab
3. Click **"Build Notes Organizer APK"** on the left
4. Click **"Run workflow"** dropdown (top right) → click **"Run workflow"**
5. Wait ~3-5 minutes for the build (green checkmark = done)
6. Click the completed run → scroll to **"Artifacts"**
7. Download **"NotesOrganizer-APK"** → extract → install `NotesOrganizer.apk` on your phone

### Why Manual Trigger (`workflow_dispatch`)?

The workflow uses `workflow_dispatch` instead of `on: push`. This means it does NOT build automatically when you push code. You manually click "Run workflow" when you want a new APK. This saves GitHub Actions minutes and lets you push code freely without triggering builds.

---

## Firebase Security Rules Explained

The Realtime Database uses these rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Why Change from `false` to `true`?

| Rule | Default (Locked Mode) | Our Setting (Test Mode) | Why |
|---|---|---|---|
| `.read` | `false` — blocks all reads | `true` — allows all reads | The app needs to fetch notes from the database. If this is `false`, the `onValue()` listener gets "Permission denied" errors. |
| `.write` | `false` — blocks all writes | `true` — allows all writes | The app needs to create, update, and delete notes. If this is `false`, `push()`, `set()`, and `remove()` all fail with "Permission denied". |

**Default locked mode (`false`):** Firebase creates the database with both rules set to `false` for security. This blocks ALL operations — the app cannot read or write any data. This is the safe default so you don't accidentally expose an open database.

**Test mode (`true`):** We change both to `true` so the app works without authentication. Anyone with the database URL can read/write data. This is fine for development and school projects.

**Production apps** would use authentication-based rules:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```
This would require users to log in before they can access notes.

---

## Prerequisites / Requirements

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

### Step 3: Create a Firebase Project and Realtime Database

1. Go to https://console.firebase.google.com
2. Click **"Add project"** → name it → create
3. Go to **Build > Realtime Database** → **Create Database**
4. Choose region (e.g., Singapore / asia-southeast1)
5. Select **"Start in test mode"**
6. Go to **Project Settings > Your apps > Web app (</>) > Register**
7. Copy the config values

### Step 4: Configure `.env`

```bash
cp .env.example .env
```

Fill in your Firebase credentials. Get the Database URL from the Realtime Database page.

### Step 5: Run the App

```bash
npm run dev
```

Open http://localhost:5173

---

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install all dependencies |
| `npm run dev` | Start dev server (http://localhost:5173) |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npx cap sync android` | Copy web build into Android project |

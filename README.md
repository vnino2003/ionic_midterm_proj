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
| **Vite** | 6.x | Fast build tool |
| **TypeScript** | 5.7.x | Type-safe JavaScript |

---

## Folder Structure

```
ionic-midterm_project/
├── src/
│   ├── main.ts                 # App bootstrap — Vue + Ionic + Router
│   ├── App.vue                 # Root component
│   ├── firebase.ts             # Firebase init — connects to Realtime Database
│   ├── router/
│   │   └── index.ts            # Routes: "/" → "/home"
│   ├── views/
│   │   └── HomePage.vue        # Main app — all CRUD UI and logic
│   ├── theme/
│   │   └── variables.css       # Custom purple/pastel color theme
│   └── vite-env.d.ts           # TypeScript env variable declarations
│
├── .env                        # Firebase credentials (NOT in git)
├── .env.example                # Template for .env setup
├── .gitignore                  # Excludes .env, node_modules, dist
├── index.html                  # HTML entry point
├── ionic.config.json           # Ionic project config
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript config
└── vite.config.ts              # Vite build config
```

---

## How It Works

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

### CRUD Operations

| Operation | Firebase Function | Description |
|---|---|---|
| **Create** | `push()` + `set()` | Generates unique key, writes note data |
| **Read** | `onValue()` | Real-time listener — UI updates automatically when data changes |
| **Update** | `set()` | Overwrites existing note at its key, preserves original dateCreated |
| **Delete** | `remove()` | Removes note by its key |

### App Flow

```
User taps [+] FAB button
    → Modal opens with form (title, content, category, status)
    → User fills form and taps "Save Note"
    → push() + set() writes to Firebase
    → onValue() listener fires
    → notes array updates → UI re-renders with new card
```

---

## How to Set Up

### Prerequisites

- **Node.js 22+** — https://nodejs.org
- **Git** — https://git-scm.com
- **Firebase project** with Realtime Database enabled

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/vnino2003/ionic_midterm_proj.git
cd ionic_midterm_proj

# 2. Install dependencies
npm install

# 3. Create .env from template
cp .env.example .env

# 4. Add your Firebase credentials to .env
#    Get from: Firebase Console → Project Settings → Your apps → Web app config
#    Database URL from: Realtime Database → Data tab (URL at top)

# 5. Start dev server
npm run dev

# 6. Open http://localhost:5173
```

### Firebase Setup

1. Go to https://console.firebase.google.com
2. Create project (or use existing one)
3. Go to **Build → Realtime Database → Create Database**
4. Choose region (e.g., Singapore / asia-southeast1)
5. Set security rules to test mode:
   ```json
   { "rules": { ".read": true, ".write": true } }
   ```
6. Go to **Project Settings → Your apps → Web app (</>) → Register**
7. Copy the config values into your `.env` file

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

**Firebase Functions:**
- `dbRef(database, 'notes')` — points to the "notes" node in the database
- `push(ref)` — generates a unique key for a new note
- `set(ref, data)` — writes or updates data at a reference
- `remove(ref)` — deletes data at a reference
- `onValue(ref, callback)` — listens for real-time changes

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server (http://localhost:5173) |
| `npm run build` | Build for production into `dist/` |

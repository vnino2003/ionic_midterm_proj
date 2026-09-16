# Notes Organizer: UI update

## Existing application, verified from code

The application has one routed page (`/home`, with `/` redirecting there), built with Vue 3, Ionic 8, TypeScript, and Vite. Capacitor packages it for Android. Firebase Realtime Database stores notes at `notes/<key>` and delivers live updates through `onValue`.

Each note retains the original fields: `title`, `content`, `category`, `dateCreated`, and `status`. Categories remain Personal, School, Work, Ideas, and Other; status remains Normal or Important. Creating uses `push`/`set`, editing uses `set` while retaining the creation date, and deletion uses `remove`. There is no authentication or additional page hidden elsewhere in the source.

## Design and interaction changes

- Off-white canvas, olive primary actions, subtle borders, consistent typography, and soft category labels replace the previous purple styling.
- Desktop sidebar includes status and category counts. Small screens use status buttons and a category selector. Cards adapt from three columns to two to one.
- Search matches title, content, and category. Search, category, and status filters compose together. Sorting and a compact list option help larger collections.
- Selecting a card opens its full text, including line breaks. Editing is available from both the card and reader.
- The editor retains Ionic inputs, textarea, category selector, and modals. Save and Cancel remain visible in its footer. Empty/whitespace-only notes cannot be saved, and repeated submissions are blocked while saving.
- Closing a changed draft asks before discarding it. Failed writes retain the draft and show an inline error. Browser reload/close also requests confirmation for unsaved changes where supported.
- Deleting a note now asks for confirmation; confirmed deletion is still permanent, as in the original app.
- Loading placeholders, connection feedback, read-error retry, first-note guidance, and filter-specific empty states replace ambiguous blank views.
- Semantic buttons, icon labels, keyboard focus, zoom support, reduced-motion styling, and safe-area spacing improve accessibility.
- Creating a note clears filters so the newly saved note is visible. The selected sort order remains in effect.

## Implementation

- `src/views/HomePage.vue`: workspace, responsive navigation, editor, reader, and existing Firebase operations; listeners are unsubscribed on unmount.
- `src/components/NoteCard.vue`: reusable note card.
- `src/utils/notes.ts`: shared note types, payload creation, filtering, sorting, and display helpers.
- `src/theme/variables.css`: shared colors, controls, modal styling, and reduced-motion rules.
- `index.html` and `public/favicon.svg`: matching browser theme/favicon and enabled page zoom.

No runtime dependency, route, database schema, Firebase configuration, Android application ID, or build workflow was changed. There are no demo notes in the production application.

## Verification

Run `npm test`, `npm run typecheck`, and `npm run build` from the project root. The Node regression tests cover composed filters, case-insensitive searching, all sort modes without mutating source records, required fields, whitespace trimming, retained creation dates/status/category, line breaks, and legacy display fallbacks.

Browser checks used a separate local server with an in-memory Firebase substitute; production data was not edited. Checked note creation, full-text reading, reader-to-editor transition, editing with the original date intact, combined filters, sorting, layout switching, deletion cancellation/confirmation, draft retention, discard confirmation, disabled empty saves, failed-save recovery, load errors, and retry. The normal app's live database connection and empty state were checked separately.

Responsive browser inspection covers desktop, tablet, and narrow phone widths. Native Android packaging and device keyboard behavior still require an emulator or device check. The existing Vite build emits a large-chunk advisory for the Ionic/Firebase bundle; it is not a build failure.

For an updated Android app, run `npm run build`, then `npx cap sync android`, and rebuild the APK using the existing process.

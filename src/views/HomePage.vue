<template>
  <IonPage>
    <IonContent class="workspace-content">
      <div class="app-shell">
        <aside class="sidebar" aria-label="Notes navigation">
          <a class="brand" href="/home" @click.prevent="resetFilters"><span class="brand-icon"><IonIcon :icon="journalOutline" aria-hidden="true" /></span><span>Notes<span class="brand-period">.</span></span></a>
          <p class="sidebar-caption">A little space for your mind.</p>
          <button class="primary-button sidebar-create" @click="openModal"><IonIcon :icon="addOutline" aria-hidden="true" /> New note</button>
          <nav class="main-navigation" aria-label="Note status">
            <p class="nav-label">WORKSPACE</p>
            <button v-for="item in statusItems" :key="item.value" class="nav-item" :class="{ selected: filterStatus === item.value }" :aria-pressed="filterStatus === item.value" @click="filterStatus = item.value"><IonIcon :icon="item.icon" aria-hidden="true" /><span>{{ item.label }}</span><span class="nav-count">{{ statusCount(item.value) }}</span></button>
          </nav>
          <nav class="category-navigation" aria-label="Note categories">
            <p class="nav-label">CATEGORIES <button v-if="filterCategory !== 'all'" class="text-button" @click="filterCategory = 'all'">Reset</button></p>
            <button v-for="category in categories" :key="category" class="nav-item" :class="[categoryClass(category), { selected: filterCategory === category }]" :aria-pressed="filterCategory === category" @click="filterCategory = filterCategory === category ? 'all' : category"><span class="category-dot" /><span>{{ category }}</span><span class="nav-count">{{ categoryCount(category) }}</span></button>
          </nav>
          <div class="sidebar-bottom">
            <div class="sidebar-note"><IonIcon :icon="leafOutline" aria-hidden="true" /><p>Make room for<br /><strong>your next idea.</strong></p></div>
            <div class="connection-label" role="status"><span class="connection-dot" :class="{ online: connected && !loadError }" />{{ loadError ? 'Connection issue' : connected ? 'Connected · live updates' : 'Waiting for connection' }}</div>
          </div>
        </aside>
        <main class="main-panel">
          <header class="topbar">
            <a class="mobile-brand brand" href="/home" @click.prevent="resetFilters"><span class="brand-icon"><IonIcon :icon="journalOutline" aria-hidden="true" /></span><span>Notes.</span></a>
            <div class="breadcrumb"><IonIcon :icon="albumsOutline" aria-hidden="true" /><span>Workspace</span><span class="breadcrumb-divider">/</span><strong>{{ pageTitle }}</strong></div>
            <span class="topbar-date">{{ today }}</span>
            <span class="mobile-connection" :title="connected ? 'Connected' : 'Waiting for connection'"><span class="connection-dot" :class="{ online: connected && !loadError }" /><span class="sr-only">{{ connected ? 'Connected' : 'Waiting for connection' }}</span></span>
          </header>
          <div class="workspace">
            <section class="page-heading" aria-labelledby="page-title">
              <div><p class="eyebrow">YOUR THOUGHTS, TOGETHER</p><h1 id="page-title">{{ pageTitle }}<span class="heading-period">.</span></h1><p class="page-description">{{ pageDescription }}</p></div>
              <button class="primary-button heading-create" @click="openModal"><IonIcon :icon="addOutline" aria-hidden="true" /> New note</button>
            </section>
            <div class="mobile-filters" aria-label="Filter note status"><button v-for="item in statusItems" :key="item.value" :class="{ active: filterStatus === item.value }" :aria-pressed="filterStatus === item.value" @click="filterStatus = item.value">{{ item.label }} <span>{{ statusCount(item.value) }}</span></button></div>
            <section class="tools-bar" aria-label="Search and organize notes">
              <div class="search-field"><IonIcon :icon="searchOutline" aria-hidden="true" /><input v-model="searchQuery" type="search" aria-label="Search notes" placeholder="Search your notes…" /><button v-if="searchQuery" class="icon-button" aria-label="Clear search" @click="searchQuery = ''"><IonIcon :icon="closeOutline" aria-hidden="true" /></button></div>
              <div class="tools-right">
                <div class="mobile-category select-wrap"><select v-model="filterCategory" aria-label="Filter category"><option value="all">All categories</option><option v-for="category in categories" :key="category">{{ category }}</option></select><IonIcon :icon="chevronDownOutline" aria-hidden="true" /></div>
                <div class="select-wrap sort-select"><IonIcon :icon="swapVerticalOutline" aria-hidden="true" /><select v-model="sortOrder" aria-label="Sort notes"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select><IonIcon :icon="chevronDownOutline" aria-hidden="true" /></div>
                <div class="view-toggle" aria-label="Note layout"><button class="icon-button" :class="{ active: viewMode === 'grid' }" :aria-pressed="viewMode === 'grid'" aria-label="Grid view" @click="viewMode = 'grid'"><IonIcon :icon="gridOutline" aria-hidden="true" /></button><button class="icon-button" :class="{ active: viewMode === 'list' }" :aria-pressed="viewMode === 'list'" aria-label="List view" @click="viewMode = 'list'"><IonIcon :icon="listOutline" aria-hidden="true" /></button></div>
              </div>
            </section>
            <div class="results-line"><p role="status">{{ loading ? 'Gathering your notes…' : `${filteredNotes.length} ${filteredNotes.length === 1 ? 'note' : 'notes'}${hasFilters ? ' found' : ' in your workspace'}` }}</p><button v-if="hasFilters" class="text-button" @click="resetFilters">Clear filters <IonIcon :icon="closeOutline" aria-hidden="true" /></button><span v-else class="results-hint"><IonIcon :icon="starOutline" aria-hidden="true" /> A star marks what matters</span></div>
            <div v-if="loadError" class="notice" role="alert"><IonIcon :icon="cloudOfflineOutline" aria-hidden="true" /><div><strong>We couldn’t load your notes</strong><p>Check your connection and try again. Your saved notes haven’t been changed.</p></div><button class="secondary-button" @click="loadNotes">Try again</button></div>
            <div v-else-if="loading" class="notes-grid" aria-label="Loading notes" aria-busy="true"><div v-for="n in 6" :key="n" class="skeleton-card"><span /><span /><span /><span /></div></div>
            <section v-else-if="filteredNotes.length" class="notes-grid" :class="{ 'list-view': viewMode === 'list' }" aria-label="Notes">
              <NoteCard v-for="note in filteredNotes" :key="note.key" :note="note" @read="selectedNote = $event" @edit="startEdit" @delete="confirmDelete" />
              <button v-if="!hasFilters" class="new-note-card" @click="openModal"><span class="new-note-symbol"><IonIcon :icon="addOutline" aria-hidden="true" /></span><strong>A fresh page awaits</strong><span>Capture a thought, big or small.</span></button>
            </section>
            <section v-else class="empty-state">
              <div class="empty-art" aria-hidden="true"><div class="paper paper-back" /><div class="paper paper-front"><IonIcon :icon="hasFilters ? searchOutline : createOutline" /><span /><span /><span /></div><span class="paper-leaf"><IonIcon :icon="leafOutline" /></span></div>
              <p class="eyebrow">{{ hasFilters ? 'A LITTLE EXPLORING' : 'SPACE FOR SOMETHING GOOD' }}</p><h2>{{ hasFilters ? 'No notes found' : 'Every idea starts somewhere.' }}</h2>
              <p>{{ hasFilters ? 'Try another search or clear your filters to find your notes.' : 'A passing thought, a plan, a little inspiration. Give it a home here.' }}</p>
              <button v-if="hasFilters" class="secondary-button" @click="resetFilters">Clear filters</button><button v-else class="primary-button" @click="openModal"><IonIcon :icon="addOutline" aria-hidden="true" /> Create your first note</button>
            </section>
            <footer class="workspace-footer"><span>A clearer space. A clearer mind.</span><span>NOTES ORGANIZER</span></footer>
          </div>
        </main>
      </div>
    </IonContent>
    <IonModal ref="editorModal" :is-open="showModal" :can-dismiss="canDismissEditor" class="note-modal" aria-labelledby="editor-heading" @did-dismiss="resetEditor">
      <IonHeader class="ion-no-border"><IonToolbar class="editor-toolbar"><IonTitle id="editor-heading">{{ editingKey ? 'Edit note' : 'A fresh page' }}</IonTitle><IonButtons slot="end"><IonButton aria-label="Close editor" :disabled="saving" @click="closeEditor"><IonIcon slot="icon-only" :icon="closeOutline" /></IonButton></IonButtons></IonToolbar></IonHeader>
      <IonContent class="editor-content">
        <form id="note-form" class="editor-form" @submit.prevent="saveNote">
          <p class="editor-intro">{{ editingKey ? 'A little refinement goes a long way.' : 'Get it out of your head and into a note.' }}</p>
          <div class="form-group"><IonInput v-model="form.title" label="Title" label-placement="stacked" placeholder="Give your note a title" :required="true" :disabled="saving" class="title-input" /></div>
          <div class="form-group"><IonTextarea v-model="form.content" label="Your note" label-placement="stacked" placeholder="Let your thoughts take shape…" :rows="7" :auto-grow="true" :required="true" :disabled="saving" class="content-input" /><span class="character-count">{{ form.content.length }} characters</span></div>
          <div class="editor-options">
            <div class="form-group"><IonSelect v-model="form.category" label="Category" label-placement="stacked" interface="popover" :disabled="saving"><IonSelectOption v-for="category in categories" :key="category" :value="category">{{ category }}</IonSelectOption></IonSelect></div>
            <fieldset class="form-group status-field"><legend>Status</legend><div class="status-toggle"><button type="button" :class="{ active: form.status === 'Normal' }" :aria-pressed="form.status === 'Normal'" :disabled="saving" @click="form.status = 'Normal'"><IonIcon :icon="ellipseOutline" aria-hidden="true" /> Normal</button><button type="button" :class="{ active: form.status === 'Important' }" :aria-pressed="form.status === 'Important'" :disabled="saving" @click="form.status = 'Important'"><IonIcon :icon="starOutline" aria-hidden="true" /> Important</button></div></fieldset>
          </div>
          <p v-if="saveError" class="form-error" role="alert">{{ saveError }}</p><p class="form-hint">A title and note are required. Save when you’re ready.</p>
        </form>
      </IonContent>
      <IonFooter class="ion-no-border editor-footer"><button class="secondary-button" :disabled="saving" @click="closeEditor">Cancel</button><button type="submit" form="note-form" class="primary-button" :disabled="!isFormValid || saving"><IonSpinner v-if="saving" name="crescent" /><IonIcon v-else :icon="checkmarkOutline" aria-hidden="true" />{{ saving ? 'Saving…' : editingKey ? 'Save changes' : 'Save note' }}</button></IonFooter>
    </IonModal>
    <IonModal ref="readerModal" :is-open="!!selectedNote" class="note-modal reader-modal" aria-labelledby="reader-heading" @did-dismiss="selectedNote = null">
      <IonHeader class="ion-no-border"><IonToolbar class="editor-toolbar"><IonTitle>Your note</IonTitle><IonButtons slot="end"><IonButton aria-label="Close note" @click="selectedNote = null"><IonIcon slot="icon-only" :icon="closeOutline" /></IonButton></IonButtons></IonToolbar></IonHeader>
      <IonContent class="editor-content"><article v-if="selectedNote" class="reader" :class="categoryClass(selectedNote.category)"><div class="reader-meta"><span class="category-badge"><span class="category-dot" />{{ selectedNote.category }}</span><span class="reader-status"><IonIcon :icon="selectedNote.status === 'Important' ? starOutline : ellipseOutline" aria-hidden="true" />{{ selectedNote.status }}</span></div><h1 id="reader-heading">{{ selectedNote.title }}</h1><p class="reader-date">Created {{ formatDate(selectedNote.dateCreated) }}</p><div class="reader-body">{{ selectedNote.content }}</div></article></IonContent>
      <IonFooter class="ion-no-border editor-footer"><button class="secondary-button" @click="selectedNote = null">Close</button><button class="primary-button" @click="editSelectedNote"><IonIcon :icon="createOutline" aria-hidden="true" /> Edit note</button></IonFooter>
    </IonModal>
    <IonToast :is-open="!!toastMessage" :message="toastMessage" :duration="3000" position="bottom" :color="toastColor" @did-dismiss="toastMessage = ''" />
  </IonPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonFooter, IonIcon, IonModal, IonInput, IonTextarea, IonSelect, IonSelectOption, IonToast, IonSpinner, alertController } from '@ionic/vue'
import { addOutline, createOutline, closeOutline, journalOutline, albumsOutline, starOutline, ellipseOutline, leafOutline, searchOutline, chevronDownOutline, swapVerticalOutline, gridOutline, listOutline, cloudOfflineOutline, checkmarkOutline } from 'ionicons/icons'
import { database } from '@/firebase'
import { ref as dbRef, push, set, remove, onValue } from 'firebase/database'
import NoteCard from '@/components/NoteCard.vue'
import { categories, emptyForm, isValidNote, notePayload, selectNotes, categoryClass, formatDate, type Note, type StatusFilter, type SortOrder } from '@/utils/notes'

const notes = ref<Note[]>([])
const loading = ref(true)
const loadError = ref(false)
const connected = ref(false)
const showModal = ref(false)
const editorModal = ref<InstanceType<typeof IonModal> | null>(null)
const readerModal = ref<InstanceType<typeof IonModal> | null>(null)
const editingKey = ref<string | null>(null)
const editingDate = ref('')
const selectedNote = ref<Note | null>(null)
const filterStatus = ref<StatusFilter>('all')
const filterCategory = ref('all')
const searchQuery = ref('')
const sortOrder = ref<SortOrder>('newest')
const viewMode = ref<'grid' | 'list'>('grid')
const toastMessage = ref('')
const toastColor = ref('success')
const saving = ref(false)
const saveError = ref('')
const form = ref(emptyForm())
const initialForm = ref(JSON.stringify(form.value))
let unsubscribeNotes: (() => void) | undefined
let unsubscribeConnection: (() => void) | undefined
let loadTimer: ReturnType<typeof setTimeout> | undefined
let discardPrompt: Promise<boolean> | undefined
const statusItems: { value: StatusFilter; label: string; icon: string }[] = [
  { value: 'all', label: 'All notes', icon: albumsOutline },
  { value: 'Important', label: 'Important', icon: starOutline },
  { value: 'Normal', label: 'Normal', icon: ellipseOutline }
]
const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
const isFormValid = computed(() => isValidNote(form.value))
const hasFilters = computed(() => filterStatus.value !== 'all' || filterCategory.value !== 'all' || !!searchQuery.value.trim())
const filteredNotes = computed(() => selectNotes(notes.value, filterStatus.value, filterCategory.value, searchQuery.value, sortOrder.value))
const pageTitle = computed(() => filterCategory.value !== 'all' ? filterCategory.value : filterStatus.value === 'all' ? 'All notes' : `${filterStatus.value} notes`)
const pageDescription = computed(() => filterCategory.value !== 'all' ? `A place for everything ${filterCategory.value.toLowerCase()}.` : filterStatus.value === 'Important' ? 'Keep the things that matter within reach.' : filterStatus.value === 'Normal' ? 'Everyday thoughts, all in one place.' : 'Your ideas, plans, and everyday moments. All in one place.')
function statusCount(status: StatusFilter) { return status === 'all' ? notes.value.length : notes.value.filter(note => note.status === status).length }
function categoryCount(category: string) { return notes.value.filter(note => note.category === category).length }
function resetFilters() { filterStatus.value = 'all'; filterCategory.value = 'all'; searchQuery.value = '' }
function showToast(message: string, color = 'success') { toastMessage.value = message; toastColor.value = color }
function openModal() {
  form.value = emptyForm(filterCategory.value === 'all' ? 'Personal' : filterCategory.value)
  editingKey.value = null
  editingDate.value = ''
  initialForm.value = JSON.stringify(form.value)
  saveError.value = ''
  showModal.value = true
}
function resetEditor() { showModal.value = false; editingKey.value = null; form.value = emptyForm(); saveError.value = '' }
async function askDiscard() {
  const alert = await alertController.create({ header: 'Discard this draft?', message: 'Your unsaved changes will be lost.', buttons: [{ text: 'Keep writing', role: 'cancel' }, { text: 'Discard', role: 'destructive' }] })
  await alert.present()
  const result = await alert.onDidDismiss()
  return result.role === 'destructive'
}
async function canDismissEditor() {
  if (saving.value) return false
  if (JSON.stringify(form.value) === initialForm.value) return true
  // Reuse the pending decision if Escape/backdrop/Cancel fire together.
  if (!discardPrompt) discardPrompt = askDiscard().finally(() => { discardPrompt = undefined })
  return discardPrompt
}
// Let Ionic run canDismiss before changing isOpen, so cancelling a discard
// keeps Vue state and the visible modal in sync.
function closeEditor() { editorModal.value?.$el.dismiss() }
function loadNotes() {
  unsubscribeNotes?.()
  clearTimeout(loadTimer)
  loading.value = true
  loadError.value = false
  loadTimer = setTimeout(() => { loading.value = false; loadError.value = true }, 12000)
  unsubscribeNotes = onValue(dbRef(database, 'notes'), snapshot => {
    clearTimeout(loadTimer)
    const data = snapshot.val()
    notes.value = data ? Object.entries(data).map(([key, value]) => ({ ...(value as Omit<Note, 'key'>), key })) : []
    loading.value = false
    loadError.value = false
    if (selectedNote.value) selectedNote.value = notes.value.find(note => note.key === selectedNote.value?.key) || null
  }, () => { clearTimeout(loadTimer); loading.value = false; loadError.value = true })
}
function startEdit(note: Note) {
  editingKey.value = note.key
  editingDate.value = note.dateCreated
  form.value = { title: note.title, content: note.content, category: note.category, status: note.status }
  initialForm.value = JSON.stringify(form.value)
  saveError.value = ''
  showModal.value = true
}
async function editSelectedNote() {
  if (!selectedNote.value) return
  const note = selectedNote.value
  await readerModal.value?.$el.dismiss()
  selectedNote.value = null
  startEdit(note)
}
async function saveNote() {
  if (!isFormValid.value || saving.value) return
  saving.value = true
  saveError.value = ''
  const isEditing = !!editingKey.value
  try {
    const target = editingKey.value ? dbRef(database, `notes/${editingKey.value}`) : push(dbRef(database, 'notes'))
    await set(target, notePayload(form.value, isEditing ? editingDate.value : new Date().toISOString()))
    initialForm.value = JSON.stringify(form.value)
    saving.value = false
    showModal.value = false
    if (!isEditing) resetFilters()
    showToast(isEditing ? 'Changes saved.' : 'Your note has been saved.')
  } catch {
    saveError.value = 'Your note couldn’t be saved. Check your connection and try again. Your draft is still here.'
  } finally { saving.value = false }
}
async function confirmDelete(note: Note) {
  const alert = await alertController.create({ header: 'Delete this note?', message: 'This permanently deletes the note. This action cannot be undone.', buttons: [{ text: 'Keep note', role: 'cancel' }, { text: 'Delete note', role: 'destructive' }] })
  await alert.present()
  const { role } = await alert.onDidDismiss()
  if (role !== 'destructive') return
  try { await remove(dbRef(database, `notes/${note.key}`)); showToast('Note deleted.') }
  catch { showToast('Couldn’t delete the note. Please try again.', 'danger') }
}
function beforeUnload(event: BeforeUnloadEvent) {
  if (showModal.value && JSON.stringify(form.value) !== initialForm.value) { event.preventDefault(); event.returnValue = '' }
}
onMounted(() => {
  loadNotes()
  unsubscribeConnection = onValue(dbRef(database, '.info/connected'), snapshot => { connected.value = snapshot.val() === true })
  window.addEventListener('beforeunload', beforeUnload)
})
onUnmounted(() => { unsubscribeNotes?.(); unsubscribeConnection?.(); clearTimeout(loadTimer); window.removeEventListener('beforeunload', beforeUnload) })
</script>

<style scoped>
.workspace-content { --background: var(--canvas); }
.app-shell { display: flex; min-height: 100%; }
.sidebar { width: 238px; flex-shrink: 0; position: sticky; top: 0; height: 100vh; height: 100dvh; padding: calc(34px + var(--ion-safe-area-top, 0px)) 22px calc(20px + var(--ion-safe-area-bottom, 0px)); display: flex; flex-direction: column; border-right: 1px solid var(--line); background: var(--sidebar); overflow-y: auto; }
.brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: var(--ink); font-size: 28px; font-weight: 650; letter-spacing: -1.3px; width: fit-content; }
.brand-icon { width: 36px; height: 39px; background: var(--accent); color: white; border-radius: 10px; display: grid; place-items: center; font-size: 23px; }
.brand-period { color: var(--accent); }
.sidebar-caption { margin: 13px 0 27px; font-size: 11px; color: var(--muted); }
.sidebar-create { width: 100%; }
.main-navigation { margin-top: 35px; }
.nav-label { display: flex; justify-content: space-between; align-items: center; margin: 0 12px 12px; color: var(--muted); letter-spacing: 1.6px; font-size: 9px; font-weight: 650; min-height: 18px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 0 12px; width: 100%; min-height: 44px; border-radius: 7px; margin-bottom: 4px; color: var(--muted); background: transparent; font-size: 13px; text-align: left; transition: background 160ms ease, color 160ms ease; }
.nav-item ion-icon { font-size: 18px; }
.nav-item.selected { color: var(--accent); background: var(--accent-soft); font-weight: 600; }
.nav-count { margin-left: auto; min-width: 21px; text-align: center; color: var(--muted); font-size: 11px; font-weight: 400; }
.selected .nav-count { background: #fff9; color: var(--accent); border-radius: 4px; padding: 3px; }
.category-navigation { margin-top: 28px; }
.category-navigation .nav-item { min-height: 38px; }
.category-navigation .category-dot { margin: 0 5px; }
.nav-label .text-button { font-size: 10px; letter-spacing: 0; }
.sidebar-bottom { margin-top: auto; padding-top: 40px; }
.sidebar-note { display: flex; gap: 12px; align-items: center; padding: 17px 13px; border: 1px solid #dee2d5; background: #eef0e6; border-radius: 9px; }
.sidebar-note ion-icon { font-size: 28px; color: var(--accent); transform: rotate(-16deg); }
.sidebar-note p { margin: 0; color: #657058; font-size: 11px; line-height: 1.7; }
.sidebar-note strong { color: var(--accent); font-weight: 500; }
.connection-label { display: flex; align-items: center; gap: 7px; margin-top: 21px; font-size: 10px; color: var(--muted); }
.connection-dot { display: inline-block; width: 6px; height: 6px; flex-shrink: 0; border-radius: 50%; background: #a6a79b; }
.connection-dot.online { background: #779660; }
.main-panel { flex: 1; min-width: 0; }
.topbar { display: flex; justify-content: space-between; align-items: center; min-height: calc(81px + var(--ion-safe-area-top, 0px)); padding: var(--ion-safe-area-top, 0px) 44px 0; border-bottom: 1px solid var(--line); }
.breadcrumb { display: flex; align-items: center; gap: 12px; color: var(--muted); font-size: 11px; }
.breadcrumb ion-icon { font-size: 16px; }
.breadcrumb strong { color: var(--ink); font-weight: 500; }
.breadcrumb-divider { color: #b6b7ab; margin: 0 3px; }
.topbar-date { color: var(--muted); font-size: 11px; }
.mobile-brand, .mobile-connection, .mobile-filters, .mobile-category { display: none; }
.workspace { max-width: 1450px; margin: 0 auto; padding: 45px 44px 22px; }
.page-heading { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 34px; }
.eyebrow { color: var(--muted); font-size: 9px; font-weight: 600; letter-spacing: 2px; margin: 0 0 13px; }
h1 { margin: 0 0 12px; font-weight: 500; font-size: 39px; line-height: 1.15; letter-spacing: -1.7px; }
.heading-period { color: #8c9a74; }
.page-description { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.7; }
.heading-create { flex-shrink: 0; }
.tools-bar { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.search-field { display: flex; align-items: center; gap: 11px; height: 44px; max-width: 410px; flex: 1; min-width: 120px; padding: 0 13px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--muted); }
.search-field:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px #52663f12; }
.search-field input { min-width: 0; width: 100%; outline: none; border: 0; background: transparent; color: var(--ink); font-size: 12px; }
.search-field input::placeholder { color: var(--muted); }
.search-field input::-webkit-search-cancel-button { display: none; }
.search-field ion-icon { flex-shrink: 0; font-size: 18px; }
.search-field .icon-button { height: 32px; width: 26px; }
.tools-right { display: flex; align-items: center; gap: 13px; }
.select-wrap { position: relative; align-items: center; gap: 6px; height: 42px; color: var(--muted); }
.sort-select { display: flex; }
.select-wrap select { appearance: none; width: 100%; border: 0; background: transparent; color: var(--muted); font-size: 11px; padding: 12px 20px 12px 4px; border-radius: 6px; cursor: pointer; }
.select-wrap ion-icon { font-size: 15px; flex-shrink: 0; pointer-events: none; }
.select-wrap ion-icon:last-child { position: absolute; right: 0; font-size: 12px; }
.view-toggle { display: flex; gap: 2px; padding: 3px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
.view-toggle .icon-button { width: 32px; height: 32px; font-size: 16px; border-radius: 5px; }
.view-toggle .active { background: var(--accent-soft); color: var(--accent); }
.results-line { min-height: 60px; display: flex; align-items: center; justify-content: space-between; gap: 12px; color: var(--muted); font-size: 11px; }
.results-line p { margin: 0; }
.results-hint { display: flex; align-items: center; gap: 6px; font-size: 10px; }
.results-hint ion-icon { color: #a77b2c; }
.notes-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 19px; align-items: stretch; }
.notes-grid.list-view { grid-template-columns: 1fr; }
.list-view :deep(.note-card) { min-height: 178px; }
.list-view :deep(.note-open h2) { margin-top: 13px; }
.list-view :deep(.note-open p) { -webkit-line-clamp: 2; margin-bottom: 14px; }
.new-note-card { min-height: 254px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: transparent; border: 1px dashed #d4d7ca; border-radius: 15px; color: var(--muted); }
.new-note-symbol { display: grid; place-items: center; width: 38px; height: 38px; margin-bottom: 4px; border-radius: 50%; background: #eef0e7; color: var(--accent); font-size: 23px; }
.new-note-card strong { color: #646b59; font-size: 13px; font-weight: 500; }
.new-note-card > span:last-child { font-size: 11px; }
.list-view .new-note-card { min-height: 145px; }
.workspace-footer { display: flex; justify-content: space-between; gap: 16px; padding: 27px 0 calc(5px + var(--ion-safe-area-bottom, 0px)); margin-top: 22px; border-top: 1px solid var(--line); color: var(--muted); font-size: 10px; }
.workspace-footer span:last-child { font-size: 8px; letter-spacing: 1.7px; }
.empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 51px 20px 64px; border: 1px solid var(--line); border-radius: 15px; background: var(--surface); }
.empty-art { position: relative; width: 124px; height: 118px; margin-bottom: 27px; }
.paper { position: absolute; width: 72px; height: 91px; border: 1px solid #d4d9ca; border-radius: 7px; }
.paper-back { top: 8px; left: 18px; background: #e8eddf; transform: rotate(-13deg); }
.paper-front { display: flex; flex-direction: column; align-items: flex-start; gap: 7px; padding: 15px; top: 13px; left: 33px; background: #fbfcf7; transform: rotate(7deg); box-shadow: 0 5px 12px #52663f08; }
.paper-front ion-icon { font-size: 22px; color: var(--accent); margin-bottom: 2px; }
.paper-front > span { width: 100%; height: 2px; background: #d7ddcd; }
.paper-front > span:last-child { width: 65%; }
.paper-leaf { position: absolute; bottom: 1px; right: 0; display: grid; place-items: center; border: 4px solid var(--surface); border-radius: 50%; width: 43px; height: 43px; background: #edf0e4; color: var(--accent); font-size: 20px; }
.empty-state h2 { font-size: 25px; line-height: 1.3; font-weight: 500; letter-spacing: -.7px; margin: 0 0 12px; }
.empty-state > p:not(.eyebrow) { max-width: 330px; margin: 0 0 25px; font-size: 13px; line-height: 1.8; color: var(--muted); }
.notice { display: flex; gap: 17px; align-items: center; padding: 25px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; }
.notice > ion-icon { font-size: 28px; flex-shrink: 0; color: var(--muted); }
.notice strong { font-size: 15px; font-weight: 600; }
.notice p { font-size: 12px; color: var(--muted); line-height: 1.7; margin-bottom: 0; }
.notice .secondary-button { margin-left: auto; flex-shrink: 0; }
.skeleton-card { padding: 25px; min-height: 254px; border: 1px solid var(--line); border-radius: 15px; background: var(--surface); }
.skeleton-card span { display: block; height: 11px; width: 100%; background: #eceee6; border-radius: 5px; margin-bottom: 14px; animation: breathe 1.5s ease-in-out infinite alternate; }
.skeleton-card span:first-child { width: 32%; height: 20px; margin-bottom: 33px; }
.skeleton-card span:nth-child(2) { width: 74%; height: 18px; }
.skeleton-card span:last-child { width: 60%; }
@keyframes breathe { to { opacity: .45; } }
.editor-toolbar { --background: var(--surface); --border-width: 0; --min-height: 74px; padding: 0 13px; }
.editor-toolbar ion-title { font-size: 16px; font-weight: 600; letter-spacing: -.3px; }
.editor-toolbar ion-button { --color: var(--muted); }
.editor-content { --background: var(--surface); }
.editor-form { padding: 0 30px 24px; }
.editor-intro { color: var(--muted); font-size: 13px; margin: 0 0 26px; }
.form-group { position: relative; margin-bottom: 23px; }
.form-group ion-input, .form-group ion-textarea, .form-group ion-select { --background: var(--canvas); --padding-start: 14px; --padding-end: 14px; --padding-top: 12px; --padding-bottom: 12px; --highlight-color-focused: var(--accent); border: 1px solid var(--line); border-radius: 9px; font-size: 14px; }
.form-group ion-input { min-height: 78px; }
.form-group ion-select { min-height: 80px; padding: 10px 14px; background: var(--canvas); }
.content-input { line-height: 1.8; }
.character-count { display: block; text-align: right; font-size: 10px; color: var(--muted); margin-top: 8px; }
.editor-options { display: grid; grid-template-columns: 1fr 1.2fr; gap: 17px; }
.status-field { padding: 0; border: 0; min-width: 0; }
.status-field legend { font-size: 12px; color: var(--muted); margin: 0 0 11px; }
.status-toggle { display: flex; padding: 4px; border: 1px solid var(--line); border-radius: 8px; background: var(--canvas); }
.status-toggle button { display: flex; gap: 6px; align-items: center; justify-content: center; flex: 1; padding: 11px 8px; background: transparent; border-radius: 5px; color: var(--muted); font-size: 11px; }
.status-toggle button.active { background: var(--accent-soft); color: var(--accent); }
.status-toggle ion-icon { font-size: 14px; }
.form-hint { font-size: 11px; color: var(--muted); line-height: 1.7; margin: 0; }
.form-error { font-size: 12px; line-height: 1.7; color: #ac3e3a; padding: 12px; background: #fff2ef; border-radius: 8px; }
.editor-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 30px calc(18px + var(--ion-safe-area-bottom, 0px)); border-top: 1px solid var(--line); background: var(--surface); }
.editor-footer ion-spinner { width: 17px; height: 17px; }
.reader { padding: 5px 32px 36px; }
.reader-meta { display: flex; gap: 16px; align-items: center; }
.reader-status { font-size: 11px; display: flex; align-items: center; gap: 6px; color: var(--muted); }
.reader h1 { font-size: 32px; line-height: 1.3; margin: 25px 0 12px; letter-spacing: -1px; overflow-wrap: anywhere; }
.reader-date { font-size: 11px; color: var(--muted); padding-bottom: 23px; border-bottom: 1px solid var(--line); }
.reader-body { font-size: 15px; line-height: 1.9; white-space: pre-wrap; overflow-wrap: anywhere; padding-top: 9px; }
@media (hover: hover) { .nav-item:hover { background: #eaece3; color: var(--accent); } .new-note-card:hover { background: #eff1e840; border-color: #97a485; } }
@media (max-height: 800px) and (min-width: 761px) {
  .sidebar { padding-top: 26px; }
  .sidebar-note { display: none; }
  .sidebar-bottom { padding-top: 10px; }
  .main-navigation { margin-top: 26px; }
  .category-navigation { margin-top: 20px; }
}
@media (min-width: 1550px) { .workspace { padding-top: 56px; } .notes-grid { gap: 23px; } }
@media (max-width: 1190px) { .sidebar { width: 214px; padding-left: 18px; padding-right: 18px; } .workspace { padding-left: 30px; padding-right: 30px; } .topbar { padding-left: 30px; padding-right: 30px; } .notes-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 760px) {
  .sidebar { display: none; }
  .topbar { min-height: calc(73px + var(--ion-safe-area-top, 0px)); padding-left: 23px; padding-right: 23px; }
  .breadcrumb, .topbar-date { display: none; }
  .mobile-brand { display: inline-flex; font-size: 24px; }
  .mobile-brand .brand-icon { width: 30px; height: 33px; border-radius: 8px; font-size: 20px; }
  .mobile-connection { display: flex; }
  .workspace { padding: 31px 23px 16px; }
  .page-heading { margin-bottom: 25px; gap: 13px; align-items: flex-start; }
  h1 { font-size: 33px; }
  .eyebrow { font-size: 8px; letter-spacing: 1.6px; }
  .page-description { font-size: 12px; max-width: 320px; }
  .heading-create { margin-top: 23px; padding: 0 13px; font-size: 12px; }
  .mobile-filters { display: flex; gap: 4px; padding: 4px; margin-bottom: 19px; border: 1px solid var(--line); border-radius: 9px; background: #eeefe8; }
  .mobile-filters button { display: flex; justify-content: center; align-items: center; gap: 7px; flex: 1; padding: 11px 5px; background: transparent; font-size: 12px; color: var(--muted); border-radius: 6px; }
  .mobile-filters button.active { color: var(--accent); background: var(--surface); box-shadow: 0 1px 4px #27321e0a; }
  .mobile-filters span { font-size: 10px; opacity: .8; }
  .tools-bar { flex-wrap: wrap; gap: 12px; }
  .search-field { flex-basis: 100%; max-width: none; }
  .tools-right { width: 100%; justify-content: space-between; gap: 12px; }
  .mobile-category { display: flex; }
  .sort-select { margin-left: auto; }
  .results-hint { display: none; }
  .results-line { min-height: 50px; }
  .notes-grid { gap: 14px; }
  .empty-state { padding: 40px 20px; }
  .empty-state h2 { font-size: 23px; }
  .notice { flex-wrap: wrap; padding: 21px; }
  .notice > div { flex: 1; min-width: 160px; }
}
@media (max-width: 480px) {
  .notes-grid { grid-template-columns: 1fr; }
  .workspace { padding-left: 19px; padding-right: 19px; }
  .page-description { max-width: 225px; }
  .heading-create { gap: 5px; padding: 0 11px; }
  .heading-create ion-icon { font-size: 16px; }
  .workspace-footer span:last-child { display: none; }
  .new-note-card { min-height: 170px; }
  .editor-form { padding-left: 21px; padding-right: 21px; }
  .editor-options { grid-template-columns: 1fr; gap: 0; }
  .editor-footer { padding-left: 21px; padding-right: 21px; }
  .reader { padding-left: 23px; padding-right: 23px; }
}
@media (max-width: 380px) {
  .tools-right { flex-wrap: wrap; }
  .mobile-category { flex: 1 0 120px; }
  .sort-select { flex: 1 0 120px; }
  .view-toggle { margin-left: auto; }
}
</style>

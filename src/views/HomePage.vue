<template>
  <IonPage>
    <IonHeader class="ion-no-border">
      <IonToolbar>
        <IonTitle class="header-title">Notes</IonTitle>
        <IonButtons slot="end">
          <IonButton
            v-if="filterStatus !== 'all'"
            fill="clear"
            @click="filterStatus = 'all'"
            class="clear-filter-btn"
          >
            Clear
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent>

      <!-- Filter Chips -->
      <div class="filter-bar">
        <div
          class="chip"
          :class="{ active: filterStatus === 'all' }"
          @click="filterStatus = 'all'"
        >
          All {{ notes.length > 0 ? `(${notes.length})` : '' }}
        </div>
        <div
          class="chip"
          :class="{ active: filterStatus === 'Important' }"
          @click="filterStatus = 'Important'"
        >
          Important
        </div>
        <div
          class="chip"
          :class="{ active: filterStatus === 'Normal' }"
          @click="filterStatus = 'Normal'"
        >
          Normal
        </div>
      </div>

      <!-- Notes List -->
      <div class="notes-container">
        <div v-if="filteredNotes.length === 0" class="empty-state">
          <IonIcon :icon="documentTextOutline" class="empty-icon" />
          <h2>{{ notes.length === 0 ? 'No notes yet' : 'No matching notes' }}</h2>
          <p>{{ notes.length === 0 ? 'Tap the button below to get started' : 'Try a different filter' }}</p>
        </div>

        <div
          v-for="note in filteredNotes"
          :key="note.key"
          class="note-card"
          :class="getCategoryClass(note.category)"
        >
          <div class="note-header">
            <span class="status-badge" :class="note.status === 'Important' ? 'important' : 'normal'">
              {{ note.status }}
            </span>
            <span class="note-category">{{ note.category }}</span>
            <div class="note-actions">
              <IonButton fill="clear" size="small" @click="startEdit(note)" class="action-btn edit">
                <IonIcon :icon="createOutline" slot="icon-only" />
              </IonButton>
              <IonButton fill="clear" size="small" @click="deleteNote(note.key)" class="action-btn delete">
                <IonIcon :icon="trashOutline" slot="icon-only" />
              </IonButton>
            </div>
          </div>

          <h3 class="note-title">{{ note.title }}</h3>
          <p class="note-content">{{ note.content }}</p>
          <div class="note-date">{{ formatDate(note.dateCreated) }}</div>
        </div>
      </div>

      <!-- FAB: Add Note -->
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton @click="openModal" class="add-fab">
          <IonIcon :icon="addOutline" />
        </IonFabButton>
      </IonFab>

      <!-- Add / Edit Modal -->
      <IonModal :is-open="showModal" @did-dismiss="closeModal">
        <IonHeader class="ion-no-border">
          <IonToolbar>
            <IonTitle class="modal-title">{{ editingKey ? 'Edit Note' : 'New Note' }}</IonTitle>
            <IonButtons slot="end">
              <IonButton @click="closeModal" class="close-btn">
                <IonIcon :icon="closeOutline" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent class="modal-content ion-padding">
          <div class="form-group">
            <label class="form-label">Title</label>
            <IonInput
              v-model="form.title"
              placeholder="Enter note title"
              class="form-input"
              fill="outline"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Content</label>
            <IonTextarea
              v-model="form.content"
              placeholder="Write your note here..."
              :rows="4"
              class="form-input"
              fill="outline"
              :auto-grow="true"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Category</label>
            <IonSelect
              v-model="form.category"
              placeholder="Select category"
              interface="action-sheet"
              class="form-input"
              fill="outline"
            >
              <IonSelectOption value="Personal">Personal</IonSelectOption>
              <IonSelectOption value="School">School</IonSelectOption>
              <IonSelectOption value="Work">Work</IonSelectOption>
              <IonSelectOption value="Ideas">Ideas</IonSelectOption>
              <IonSelectOption value="Other">Other</IonSelectOption>
            </IonSelect>
          </div>

          <div class="form-group">
            <label class="form-label">Status</label>
            <div class="status-toggle">
              <div
                class="toggle-option"
                :class="{ active: form.status === 'Normal' }"
                @click="form.status = 'Normal'"
              >
                Normal
              </div>
              <div
                class="toggle-option important"
                :class="{ active: form.status === 'Important' }"
                @click="form.status = 'Important'"
              >
                Important
              </div>
            </div>
          </div>

          <IonButton
            expand="block"
            @click="editingKey ? updateNote() : addNote()"
            :disabled="!isFormValid"
            class="save-btn"
          >
            {{ editingKey ? 'Update Note' : 'Save Note' }}
          </IonButton>
        </IonContent>
      </IonModal>

      <!-- Toast -->
      <IonToast
        :is-open="!!toastMessage"
        :message="toastMessage"
        :duration="2000"
        position="bottom"
        :color="toastColor"
        @did-dismiss="toastMessage = ''"
      />

    </IonContent>
  </IonPage>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToast
} from '@ionic/vue'
import {
  addOutline,
  createOutline,
  trashOutline,
  closeOutline,
  documentTextOutline
} from 'ionicons/icons'

import { database } from '@/firebase'
import { ref as dbRef, push, set, remove, onValue } from 'firebase/database'

interface Note {
  key: string
  title: string
  content: string
  category: string
  dateCreated: string
  status: 'Important' | 'Normal'
}

const notes = ref<Note[]>([])
const showModal = ref(false)
const editingKey = ref<string | null>(null)
const filterStatus = ref<'all' | 'Important' | 'Normal'>('all')
const toastMessage = ref('')
const toastColor = ref('success')

const form = ref({
  title: '',
  content: '',
  category: 'Personal',
  status: 'Normal' as 'Important' | 'Normal'
})

const isFormValid = computed(() =>
  form.value.title.trim() !== '' &&
  form.value.content.trim() !== ''
)

const filteredNotes = computed(() => {
  if (filterStatus.value === 'all') return notes.value
  return notes.value.filter(n => n.status === filterStatus.value)
})

function getCategoryClass(category: string) {
  const map: Record<string, string> = {
    Personal: 'cat-personal',
    School: 'cat-school',
    Work: 'cat-work',
    Ideas: 'cat-ideas',
    Other: 'cat-other'
  }
  return map[category] || 'cat-other'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function showToast(msg: string, color = 'success') {
  toastMessage.value = msg
  toastColor.value = color
}

function resetForm() {
  form.value = { title: '', content: '', category: 'Personal', status: 'Normal' }
  editingKey.value = null
}

function openModal() {
  resetForm()
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function loadNotes() {
  const notesRef = dbRef(database, 'notes')
  onValue(notesRef, (snapshot) => {
    const data = snapshot.val()
    const list: Note[] = []
    if (data) {
      Object.keys(data).forEach((key) => {
        list.push({ key, ...data[key] })
      })
    }
    list.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
    notes.value = list
  })
}

async function addNote() {
  if (!isFormValid.value) return
  try {
    const notesRef = dbRef(database, 'notes')
    const newRef = push(notesRef)
    await set(newRef, {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      category: form.value.category,
      dateCreated: new Date().toISOString(),
      status: form.value.status
    })
    showToast('Note saved')
    closeModal()
  } catch {
    showToast('Failed to save note', 'danger')
  }
}

function startEdit(note: Note) {
  editingKey.value = note.key
  form.value = {
    title: note.title,
    content: note.content,
    category: note.category,
    status: note.status
  }
  showModal.value = true
}

async function updateNote() {
  if (!editingKey.value || !isFormValid.value) return
  try {
    const noteRef = dbRef(database, `notes/${editingKey.value}`)
    const original = notes.value.find(n => n.key === editingKey.value)
    await set(noteRef, {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      category: form.value.category,
      dateCreated: original?.dateCreated || new Date().toISOString(),
      status: form.value.status
    })
    showToast('Note updated')
    closeModal()
  } catch {
    showToast('Failed to update note', 'danger')
  }
}

async function deleteNote(key: string) {
  try {
    const noteRef = dbRef(database, `notes/${key}`)
    await remove(noteRef)
    showToast('Note deleted')
  } catch {
    showToast('Failed to delete note', 'danger')
  }
}

onMounted(() => {
  loadNotes()
})
</script>


<style scoped>
ion-content {
  --background: #f8f9fc;
}

/* Header */
.header-title {
  font-weight: 700;
  font-size: 1.5rem;
  color: #1a1a2e;
}

.clear-filter-btn {
  font-size: 0.82rem;
  --color: #6c63ff;
  font-weight: 600;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 8px;
  padding: 14px 16px 6px;
}

.chip {
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  background: #eeedf5;
  color: #6b6b8d;
  transition: all 0.2s;
}

.chip.active {
  background: #6c63ff;
  color: white;
}

/* Notes Container */
.notes-container {
  padding: 8px 16px 100px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 70px 24px;
}

.empty-icon {
  font-size: 52px;
  color: #ccc8e0;
  margin-bottom: 14px;
}

.empty-state h2 {
  margin: 0 0 6px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #3a3a5c;
}

.empty-state p {
  margin: 0;
  font-size: 0.88rem;
  color: #9e9bb5;
}

/* Note Card */
.note-card {
  background: white;
  border-radius: 14px;
  padding: 16px 16px 14px;
  margin-bottom: 10px;
  border-left: 4px solid #ddd8ee;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.note-card.cat-personal { border-left-color: #e8a0bf; }
.note-card.cat-school { border-left-color: #6c63ff; }
.note-card.cat-work { border-left-color: #4da6e8; }
.note-card.cat-ideas { border-left-color: #e8c84d; }
.note-card.cat-other { border-left-color: #8bc9b9; }

.note-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.status-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.status-badge.important {
  background: #fff0e6;
  color: #d47a2e;
}

.status-badge.normal {
  background: #eaf5ee;
  color: #4a9c6e;
}

.note-category {
  font-size: 0.75rem;
  color: #9e9bb5;
  font-weight: 500;
}

.note-actions {
  margin-left: auto;
  display: flex;
  gap: 0;
}

.action-btn {
  --padding-start: 6px;
  --padding-end: 6px;
  font-size: 1rem;
}

.action-btn.edit { --color: #6c63ff; }
.action-btn.delete { --color: #e07575; }

.note-title {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
}

.note-content {
  margin: 0 0 10px;
  font-size: 0.85rem;
  color: #5d5b76;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-date {
  font-size: 0.72rem;
  color: #bbb5cf;
  font-weight: 500;
}

/* FAB */
.add-fab {
  --background: #6c63ff;
  --background-activated: #5a52e0;
  --box-shadow: 0 4px 14px rgba(108, 99, 255, 0.35);
}

/* Modal */
.modal-title {
  font-weight: 700;
  color: #1a1a2e;
}

.close-btn {
  --color: #9e9bb5;
  font-size: 1.2rem;
}

.modal-content {
  --background: #f8f9fc;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: #3a3a5c;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  --border-radius: 10px;
  --background: white;
  font-size: 0.92rem;
}

/* Status Toggle */
.status-toggle {
  display: flex;
  gap: 10px;
}

.toggle-option {
  flex: 1;
  padding: 11px;
  text-align: center;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid #e5e3ef;
  color: #6b6b8d;
  background: white;
  transition: all 0.2s;
}

.toggle-option.active {
  background: #eaf5ee;
  border-color: #4a9c6e;
  color: #3a7d57;
}

.toggle-option.important.active {
  background: #fff0e6;
  border-color: #d47a2e;
  color: #b5651a;
}

/* Save Button */
.save-btn {
  margin-top: 8px;
  --border-radius: 12px;
  --background: #6c63ff;
  --background-activated: #5a52e0;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
  height: 48px;
  --box-shadow: 0 4px 12px rgba(108, 99, 255, 0.25);
}

.save-btn[disabled] {
  --background: #d1cfe8;
  --box-shadow: none;
}
</style>

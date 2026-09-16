<template>
  <IonPage>
    <IonHeader class="ion-no-border">
      <IonToolbar>
        <IonTitle class="header-title">
          <span class="header-icon">&#x1F4DD;</span> My Notes
        </IonTitle>
        <IonButtons slot="end">
          <IonButton
            v-if="filterStatus !== 'all'"
            fill="clear"
            @click="filterStatus = 'all'"
            class="clear-filter-btn"
          >
            Show All
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
          All ({{ notes.length }})
        </div>
        <div
          class="chip important"
          :class="{ active: filterStatus === 'Important' }"
          @click="filterStatus = 'Important'"
        >
          &#x2B50; Important
        </div>
        <div
          class="chip normal"
          :class="{ active: filterStatus === 'Normal' }"
          @click="filterStatus = 'Normal'"
        >
          Normal
        </div>
      </div>

      <!-- Notes List -->
      <div class="notes-container">
        <div v-if="filteredNotes.length === 0" class="empty-state">
          <div class="empty-icon">&#x1F4CB;</div>
          <h2>{{ notes.length === 0 ? 'No notes yet' : 'No matching notes' }}</h2>
          <p>{{ notes.length === 0 ? 'Tap + to create your first note' : 'Try a different filter' }}</p>
        </div>

        <div
          v-for="note in filteredNotes"
          :key="note.key"
          class="note-card"
          :class="getCategoryClass(note.category)"
        >
          <div class="note-header">
            <span v-if="note.status === 'Important'" class="status-badge important">&#x2B50; Important</span>
            <span v-else class="status-badge normal">Normal</span>
            <span class="note-category">{{ note.category }}</span>
          </div>

          <h3 class="note-title">{{ note.title }}</h3>
          <p class="note-content">{{ note.content }}</p>
          <div class="note-date">{{ formatDate(note.dateCreated) }}</div>

          <div class="note-actions">
            <IonButton fill="clear" size="small" @click="startEdit(note)" class="action-btn edit">
              <IonIcon :icon="createOutline" slot="icon-only" />
            </IonButton>
            <IonButton fill="clear" size="small" @click="deleteNote(note.key)" class="action-btn delete">
              <IonIcon :icon="trashOutline" slot="icon-only" />
            </IonButton>
          </div>
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
              placeholder="What's this note about?"
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
              placeholder="Pick a category"
              interface="action-sheet"
              class="form-input"
              fill="outline"
            >
              <IonSelectOption value="Personal">&#x1F3E0; Personal</IonSelectOption>
              <IonSelectOption value="School">&#x1F4DA; School</IonSelectOption>
              <IonSelectOption value="Work">&#x1F4BC; Work</IonSelectOption>
              <IonSelectOption value="Ideas">&#x1F4A1; Ideas</IonSelectOption>
              <IonSelectOption value="Other">&#x1F4CC; Other</IonSelectOption>
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
                &#x2B50; Important
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
import { addOutline, createOutline, trashOutline, closeOutline } from 'ionicons/icons'

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
    showToast('Note saved!')
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
    showToast('Note updated!')
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
  --background: #faf7ff;
}

/* Header */
.header-title {
  font-weight: 800;
  font-size: 1.4rem;
  color: #4a3580;
  letter-spacing: -0.5px;
}

.header-icon {
  font-size: 1.2rem;
}

.clear-filter-btn {
  font-size: 0.8rem;
  --color: #7c5cbf;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px 4px;
  overflow-x: auto;
}

.chip {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  background: #f0ecf7;
  color: #7c5cbf;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.chip.active {
  background: #7c5cbf;
  color: white;
}

.chip.important {
  background: #fff5e6;
  color: #cc8800;
}

.chip.important.active {
  background: #f5a623;
  color: white;
}

.chip.normal {
  background: #e8f5e9;
  color: #4caf50;
}

.chip.normal.active {
  background: #66bb6a;
  color: white;
}

/* Notes Container */
.notes-container {
  padding: 8px 16px 100px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 24px;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.empty-state h2 {
  margin: 0 0 6px;
  font-size: 1.15rem;
  font-weight: 700;
  color: #4a3580;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
  color: #a89cc8;
}

/* Note Card */
.note-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid #e0d6f2;
  box-shadow: 0 2px 8px rgba(124, 92, 191, 0.08);
  position: relative;
  transition: transform 0.15s;
}

.note-card:active {
  transform: scale(0.98);
}

.note-card.cat-personal { border-left-color: #f4a8c8; }
.note-card.cat-school { border-left-color: #7c5cbf; }
.note-card.cat-work { border-left-color: #64b5f6; }
.note-card.cat-ideas { border-left-color: #ffd97d; }
.note-card.cat-other { border-left-color: #a8d8ea; }

.note-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.important {
  background: #fff5e6;
  color: #cc8800;
}

.status-badge.normal {
  background: #e8f5e9;
  color: #66bb6a;
}

.note-category {
  font-size: 0.75rem;
  color: #a89cc8;
  font-weight: 600;
}

.note-title {
  margin: 0 0 6px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #2d2047;
}

.note-content {
  margin: 0 0 8px;
  font-size: 0.88rem;
  color: #6b5e82;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-date {
  font-size: 0.72rem;
  color: #c4bbd6;
  font-weight: 500;
}

.note-actions {
  position: absolute;
  top: 12px;
  right: 8px;
  display: flex;
  gap: 0;
}

.action-btn {
  --padding-start: 6px;
  --padding-end: 6px;
  font-size: 1.1rem;
}

.action-btn.edit {
  --color: #7c5cbf;
}

.action-btn.delete {
  --color: #f28b82;
}

/* FAB */
.add-fab {
  --background: #7c5cbf;
  --background-activated: #6d51a8;
  --box-shadow: 0 4px 16px rgba(124, 92, 191, 0.4);
}

/* Modal */
.modal-title {
  font-weight: 700;
  color: #4a3580;
}

.close-btn {
  --color: #a89cc8;
  font-size: 1.3rem;
}

.modal-content {
  --background: #faf7ff;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: #4a3580;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  --border-radius: 12px;
  --background: white;
  font-size: 0.95rem;
}

/* Status Toggle */
.status-toggle {
  display: flex;
  gap: 8px;
}

.toggle-option {
  flex: 1;
  padding: 10px;
  text-align: center;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid #e0d6f2;
  color: #7c5cbf;
  background: white;
  transition: all 0.2s;
}

.toggle-option.active {
  background: #e8f5e9;
  border-color: #66bb6a;
  color: #388e3c;
}

.toggle-option.important.active {
  background: #fff5e6;
  border-color: #f5a623;
  color: #cc8800;
}

/* Save Button */
.save-btn {
  margin-top: 8px;
  --border-radius: 14px;
  --background: #7c5cbf;
  --background-activated: #6d51a8;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.3px;
  height: 48px;
  --box-shadow: 0 4px 12px rgba(124, 92, 191, 0.3);
}

.save-btn[disabled] {
  --background: #d6cce8;
  --box-shadow: none;
}
</style>

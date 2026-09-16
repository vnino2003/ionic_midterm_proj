<template>
  <article class="note-card" :class="categoryClass(note.category)">
    <div class="card-topline">
      <span class="category-badge"><span class="category-dot" />{{ note.category }}</span>
      <span v-if="note.status === 'Important'" class="important-mark" title="Important"><IonIcon :icon="star" aria-hidden="true" /><span class="sr-only">Important</span></span>
    </div>
    <button class="note-open" :aria-label="`Read ${note.title}`" @click="$emit('read', note)"><h2>{{ note.title }}</h2><p>{{ note.content }}</p></button>
    <footer class="card-footer">
      <time :datetime="note.dateCreated">{{ formatDate(note.dateCreated) }}</time>
      <div class="card-actions">
        <button class="icon-button" :aria-label="`Edit ${note.title}`" title="Edit note" @click="$emit('edit', note)"><IonIcon :icon="createOutline" aria-hidden="true" /></button>
        <button class="icon-button delete-button" :aria-label="`Delete ${note.title}`" title="Delete note" @click="$emit('delete', note)"><IonIcon :icon="trashOutline" aria-hidden="true" /></button>
      </div>
    </footer>
  </article>
</template>
<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { createOutline, trashOutline, star } from 'ionicons/icons'
import { categoryClass, formatDate, type Note } from '@/utils/notes'
defineProps<{ note: Note }>()
defineEmits<{ read: [note: Note]; edit: [note: Note]; delete: [note: Note] }>()
</script>
<style scoped>
.note-card { display: flex; flex-direction: column; min-width: 0; min-height: 254px; padding: 23px 23px 13px; border: 1px solid var(--line); border-radius: 15px; background: var(--surface); transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease; }
.card-topline { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.important-mark { display: flex; color: #a77b2c; font-size: 16px; }
.note-open { flex: 1; width: 100%; padding: 0; background: transparent; text-align: left; border-radius: 4px; }
.note-open h2 { margin: 21px 0 10px; color: var(--ink); font-size: 17px; font-weight: 600; letter-spacing: -.35px; line-height: 1.4; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.note-open p { margin: 0 0 22px; color: var(--muted); font-size: 13px; line-height: 1.8; white-space: pre-wrap; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.card-footer { display: flex; align-items: center; justify-content: space-between; gap: 4px; border-top: 1px solid var(--line-soft); padding-top: 9px; }
time { color: var(--muted); font-size: 11px; }
.card-actions { display: flex; }
.card-actions .icon-button { width: 36px; height: 36px; font-size: 16px; }
@media (hover: hover) { .note-card:hover { border-color: #c5ccbd; box-shadow: 0 6px 22px #25311d08; transform: translateY(-2px); } }
@media (pointer: coarse) { .card-actions .icon-button { width: 44px; height: 44px; } }
</style>

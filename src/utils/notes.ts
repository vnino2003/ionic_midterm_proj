export const categories = ['Personal', 'School', 'Work', 'Ideas', 'Other'] as const
export type NoteStatus = 'Important' | 'Normal'
export type StatusFilter = 'all' | NoteStatus
export type SortOrder = 'newest' | 'oldest' | 'title'

export interface Note {
  key: string
  title: string
  content: string
  category: string
  dateCreated: string
  status: NoteStatus
}
export interface NoteForm { title: string; content: string; category: string; status: NoteStatus }
export function emptyForm(category = 'Personal'): NoteForm { return { title: '', content: '', category, status: 'Normal' } }
export function isValidNote(form: NoteForm) { return !!form.title.trim() && !!form.content.trim() }
export function notePayload(form: NoteForm, dateCreated: string) { return { ...form, title: form.title.trim(), content: form.content.trim(), dateCreated } }

export function selectNotes(notes: Note[], status: StatusFilter, category: string, query: string, sort: SortOrder) {
  const search = query.trim().toLocaleLowerCase()
  return notes.filter(note =>
    (status === 'all' || note.status === status) &&
    (category === 'all' || note.category === category) &&
    (!search || `${note.title}\n${note.content}\n${note.category}`.toLocaleLowerCase().includes(search))
  ).sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title)
    const difference = new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    return sort === 'oldest' ? -difference : difference
  })
}
export function categoryClass(category: string) { return `cat-${categories.find(item => item === category)?.toLowerCase() || 'other'}` }
export function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const source = readFileSync(new URL('../src/utils/notes.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { selectNotes, emptyForm, isValidNote, notePayload, categoryClass, formatDate } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const notes = [
  { key: 'a', title: 'Zebra', content: 'Review for exams', category: 'School', status: 'Important', dateCreated: '2026-09-15T12:00:00Z' },
  { key: 'b', title: 'Apple', content: 'A school of thought', category: 'Ideas', status: 'Normal', dateCreated: '2026-09-16T12:00:00Z' },
  { key: 'c', title: 'Book', content: 'Read chapter two', category: 'School', status: 'Normal', dateCreated: '2026-09-14T12:00:00Z' }
]
const keys = value => value.map(note => note.key)
test('status, category and case-insensitive content search compose together', () => {
  assert.deepEqual(keys(selectNotes(notes, 'Important', 'School', '  EXAMS  ', 'newest')), ['a'])
  assert.deepEqual(selectNotes(notes, 'Normal', 'School', 'EXAMS', 'newest'), [])
  assert.deepEqual(keys(selectNotes(notes, 'all', 'all', 'school', 'newest')), ['b', 'a', 'c'])
})
test('all sort modes preserve the original Firebase array', () => {
  const before = structuredClone(notes)
  assert.deepEqual(keys(selectNotes(notes, 'all', 'all', '', 'newest')), ['b', 'a', 'c'])
  assert.deepEqual(keys(selectNotes(notes, 'all', 'all', '', 'oldest')), ['c', 'a', 'b'])
  assert.deepEqual(keys(selectNotes(notes, 'all', 'all', '', 'title')), ['b', 'c', 'a'])
  assert.deepEqual(notes, before)
})
test('required title and content reject whitespace-only drafts', () => {
  assert.equal(isValidNote(emptyForm()), false)
  assert.equal(isValidNote({ ...emptyForm(), title: '  ', content: 'Text' }), false)
  assert.equal(isValidNote({ ...emptyForm(), title: 'Title', content: '\n\t' }), false)
  assert.equal(isValidNote({ ...emptyForm(), title: 'Title', content: 'Text' }), true)
})
test('editing retains creation date, category, status and content line breaks', () => {
  const form = { title: ' Updated ', content: ' Line one\nLine two ', category: 'Work', status: 'Important' }
  const data = notePayload(form, notes[0].dateCreated)
  assert.deepEqual(data, { title: 'Updated', content: 'Line one\nLine two', category: 'Work', status: 'Important', dateCreated: notes[0].dateCreated })
  assert.equal(form.title, ' Updated ')
  assert.deepEqual(Object.keys(data).sort(), ['category', 'content', 'dateCreated', 'status', 'title'])
})
test('unknown legacy category and invalid date have safe display fallbacks', () => {
  assert.equal(categoryClass('Legacy'), 'cat-other')
  assert.equal(formatDate('not a date'), 'Date unavailable')
  assert.equal(emptyForm('School').category, 'School')
})

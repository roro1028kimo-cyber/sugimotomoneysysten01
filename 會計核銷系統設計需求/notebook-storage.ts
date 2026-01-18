import { Note, Todo } from "./notebook-types";

const NOTES_KEY = "accounting_notes";
const TODOS_KEY = "accounting_todos";

export const getNotes = (): Note[] => {
  const data = localStorage.getItem(NOTES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveNotes = (notes: Note[]) => {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

export const getTodos = (): Todo[] => {
  const data = localStorage.getItem(TODOS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTodos = (todos: Todo[]) => {
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
};

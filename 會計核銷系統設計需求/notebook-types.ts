export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  color?: "white" | "gray" | "black"; // Swiss Style colors
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

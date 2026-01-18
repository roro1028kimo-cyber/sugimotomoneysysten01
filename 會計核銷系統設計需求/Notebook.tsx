import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotebookPen, Plus, Trash2, Check, Calculator } from "lucide-react";
import { Note, Todo } from "@/lib/notebook-types";
import { getNotes, saveNotes, getTodos, saveTodos } from "@/lib/notebook-storage";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";

export function Notebook() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");

  useEffect(() => {
    setNotes(getNotes());
    setTodos(getTodos());
  }, []);

  const addNote = () => {
    const newNote: Note = {
      id: nanoid(),
      title: "新筆記",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      color: "white",
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const todo: Todo = {
      id: nanoid(),
      text: newTodo,
      completed: false,
      createdAt: Date.now(),
    };
    const updatedTodos = [todo, ...todos];
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const calculate = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(calcInput); // Simple eval for calculator
      setCalcResult(result.toString());
    } catch (error) {
      setCalcResult("錯誤");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12 rounded-full shadow-md bg-white text-gray-700 hover:bg-gray-100 hover:scale-110 transition-transform"
        >
          <NotebookPen className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>隨身筆記本</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="notes" className="flex-1 flex flex-col mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">筆記</TabsTrigger>
            <TabsTrigger value="todos">待辦</TabsTrigger>
            <TabsTrigger value="calc">計算機</TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes" className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-end mb-2">
              <Button onClick={addNote} size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> 新增筆記
              </Button>
            </div>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="border rounded-lg p-4 space-y-2 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <Input
                        value={note.title}
                        onChange={(e) => updateNote(note.id, { title: e.target.value })}
                        className="font-bold border-none px-0 h-auto focus-visible:ring-0 text-lg"
                        placeholder="標題..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-500"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={note.content}
                      onChange={(e) => updateNote(note.id, { content: e.target.value })}
                      className="min-h-[100px] resize-none border-gray-100 focus-visible:ring-0"
                      placeholder="輸入內容..."
                    />
                    <div className="text-xs text-gray-400 text-right">
                      {new Date(note.updatedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    尚無筆記，點擊上方按鈕新增
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Todos Tab */}
          <TabsContent value="todos" className="flex-1 flex flex-col min-h-0">
            <form onSubmit={addTodo} className="flex gap-2 mb-4">
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="新增待辦事項..."
              />
              <Button type="submit" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-2 p-2 border rounded-md bg-white hover:bg-gray-50 group"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 rounded-full border",
                        todo.completed
                          ? "bg-black text-white border-black"
                          : "border-gray-300 text-transparent hover:text-gray-300"
                      )}
                      onClick={() => toggleTodo(todo.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <span
                      className={cn(
                        "flex-1 text-sm transition-all",
                        todo.completed && "text-gray-400 line-through"
                      )}
                    >
                      {todo.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {todos.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    尚無待辦事項
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calc" className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col justify-center items-center gap-4 p-4">
              <div className="w-full max-w-xs space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg text-right">
                  <div className="text-gray-500 text-sm h-6">{calcInput || "0"}</div>
                  <div className="text-3xl font-bold truncate">{calcResult || "0"}</div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"].map(
                    (btn) => (
                      <Button
                        key={btn}
                        variant={["/", "*", "-", "+", "="].includes(btn) ? "default" : "outline"}
                        className="h-12 text-lg font-bold"
                        onClick={() => {
                          if (btn === "=") calculate();
                          else setCalcInput((prev) => prev + btn);
                        }}
                      >
                        {btn}
                      </Button>
                    )
                  )}
                  <Button
                    variant="destructive"
                    className="col-span-4 mt-2"
                    onClick={() => {
                      setCalcInput("");
                      setCalcResult("");
                    }}
                  >
                    清除 (C)
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { getTodos, saveTodo, updateTodo, deleteTodo } from '../utils/storage';

const TodoWidget = forwardRef(({ pomodoroRef }, ref) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    loadTodos();
  }, []);

  useImperativeHandle(ref, () => ({
    addTask: (text) => {
      handleAddTodo(text);
    }
  }));

  const loadTodos = async () => {
    const loadedTodos = await getTodos();
    setTodos(loadedTodos);
  };

  const handleAddTodo = async (text) => {
    if (text.trim()) {
      // Check for duplicates
      const existingTodo = todos.find(todo => 
        todo.text.toLowerCase() === text.trim().toLowerCase()
      );
      
      if (existingTodo) {
        return; // Skip if duplicate exists
      }

      const todo = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      await saveTodo(todo);
      setNewTodo('');
      loadTodos();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAddTodo(newTodo);
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
      loadTodos();
    }
  };

  const handleDelete = async (id) => {
    await deleteTodo(id);
    loadTodos();
    
    // Reset Pomodoro sessions if the task was being tracked
    if (pomodoroRef?.current) {
      pomodoroRef.current.resetSessions();
    }
  };

  return (
    <div className="widget">
      <h2 className="text-xl font-semibold mb-4">Todo List</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="input flex-1"
          />
          <button type="submit" className="btn">
            Add
          </button>
        </div>
      </form>

      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-4 h-4"
            />
            <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
              {todo.text}
            </span>
            <button
              onClick={() => handleDelete(todo.id)}
              className="text-red-500 hover:text-red-600"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TodoWidget; 
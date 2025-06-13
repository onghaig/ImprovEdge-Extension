const STORAGE_PREFIX = 'improvedge_';

export async function getStorage(key) {
  try {
    const data = await chrome.storage.local.get(`${STORAGE_PREFIX}${key}`);
    return data[`${STORAGE_PREFIX}${key}`];
  } catch (error) {
    console.error('Error reading from storage:', error);
    return null;
  }
}

export async function setStorage(key, value) {
  try {
    await chrome.storage.local.set({
      [`${STORAGE_PREFIX}${key}`]: value
    });
    return true;
  } catch (error) {
    console.error('Error writing to storage:', error);
    return false;
  }
}

export async function removeStorage(key) {
  try {
    await chrome.storage.local.remove(`${STORAGE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error('Error removing from storage:', error);
    return false;
  }
}

export async function clearStorage() {
  try {
    const allData = await chrome.storage.local.get(null);
    const keysToRemove = Object.keys(allData).filter(key => 
      key.startsWith(STORAGE_PREFIX)
    );
    await chrome.storage.local.remove(keysToRemove);
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
}

export async function getAllStorage() {
  try {
    const allData = await chrome.storage.local.get(null);
    const filteredData = {};
    Object.entries(allData).forEach(([key, value]) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const cleanKey = key.replace(STORAGE_PREFIX, '');
        filteredData[cleanKey] = value;
      }
    });
    return filteredData;
  } catch (error) {
    console.error('Error getting all storage:', error);
    return {};
  }
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key.startsWith(STORAGE_PREFIX)) {
      const cleanKey = key.replace(STORAGE_PREFIX, '');
      console.debug(`Storage key "${cleanKey}" changed:`, { oldValue, newValue });
    }
  }
});

// Todo storage helpers
export const getTodos = async () => {
  return await getStorage('todos') || [];
};

export const saveTodo = async (todo) => {
  const todos = await getTodos();
  todos.push(todo);
  return await setStorage('todos', todos);
};

export const updateTodo = async (id, updates) => {
  const todos = await getTodos();
  const index = todos.findIndex(todo => todo.id === id);
  if (index !== -1) {
    todos[index] = { ...todos[index], ...updates };
    return await setStorage('todos', todos);
  }
  return false;
};

export const deleteTodo = async (id) => {
  const todos = await getTodos();
  const filteredTodos = todos.filter(todo => todo.id !== id);
  return await setStorage('todos', filteredTodos);
};

// Pomodoro storage helpers
export const getPomodoroSettings = async () => {
  return await getStorage('pomodoroSettings') || {
    focusDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  };
};

export const savePomodoroSettings = async (settings) => {
  return await setStorage('pomodoroSettings', settings);
}; 
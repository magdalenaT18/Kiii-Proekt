import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodos();
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await axios.get(`${API_BASE_URL}/init`);
    } catch (err) {
      console.error('Failed to initialize database:', err);
    }
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/todos`);
      setTodos(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/todos`, newTodo);
      setTodos([response.data, ...todos]);
      setNewTodo({ title: '', description: '' });
      setError('');
    } catch (err) {
      setError('Failed to create todo');
      console.error('Error creating todo:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/todos/${id}`, {
        completed: !completed
      });
      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>📝 Todo Application</h1>
          <p>Manage your tasks efficiently</p>
        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={createTodo} className="todo-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter todo title..."
              value={newTodo.title}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Enter description (optional)..."
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="form-textarea"
              rows="3"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !newTodo.title.trim()}
          >
            {loading ? 'Adding...' : 'Add Todo'}
          </button>
        </form>

        <div className="todos-container">
          {loading && todos.length === 0 ? (
            <div className="loading">Loading todos...</div>
          ) : todos.length === 0 ? (
            <div className="empty-state">
              <p>No todos yet. Create your first todo above!</p>
            </div>
          ) : (
            <div className="todos-list">
              {todos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`todo-item ${todo.completed ? 'completed' : ''}`}
                >
                  <div className="todo-content">
                    <div className="todo-header">
                      <h3 
                        className="todo-title"
                        onClick={() => toggleTodo(todo.id, todo.completed)}
                      >
                        {todo.title}
                      </h3>
                      <span className="todo-date">
                        {new Date(todo.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {todo.description && (
                      <p className="todo-description">{todo.description}</p>
                    )}
                  </div>
                  <div className="todo-actions">
                    <button
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                      className={`btn ${todo.completed ? 'btn-secondary' : 'btn-success'}`}
                    >
                      {todo.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stats">
          <div className="stat">
            <span className="stat-number">{todos.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat">
            <span className="stat-number">{todos.filter(t => !t.completed).length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat">
            <span className="stat-number">{todos.filter(t => t.completed).length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
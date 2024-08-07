import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import './MainScreen.scss';
import Spinner from '../../../helpers/Spinner/Spinner';

function MainScreen() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const inputRef = useRef(null);

  useEffect(() => {
    async function fetchTasks() {
      setIsLoading(true);
      try {
        const response = await axios.get('https://localhost:7075/api/ToDoTasks');
        setTasks(response.data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      inputRef.current.focus();
    }
  }, [errorMessage]);

  const handleTaskCompletion = async (taskId, currentStatus) => {
    setIsLoading(true);
    try {
      await axios.patch(`https://localhost:7075/api/ToDoTasks/${taskId}`, [
        { op: 'replace', path: '/isCompleted', value: !currentStatus },
      ], {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      });
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, isCompleted: !currentStatus } : task
      ));
    } catch (error) {
      console.error('Error updating task', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      setErrorMessage('Please enter a task to add.');
      inputRef.current.focus();
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('https://localhost:7075/api/ToDoTasks', { title: newTask, isCompleted: false });
      setTasks([...tasks, response.data]);
      setNewTask('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error adding task', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setIsEditing(true);
    setNewTask(task.title);
    setCurrentTaskId(task.id);
    inputRef.current.focus();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleUpdateTask = async () => {
    if (!newTask.trim()) {
      setErrorMessage('Please enter a task to update.');
      inputRef.current.focus();
      return;
    }
    setIsLoading(true);
    try {
      await axios.put(`https://localhost:7075/api/ToDoTasks/${currentTaskId}`, { id: currentTaskId, title: newTask, isCompleted: false });
      setTasks(tasks.map(task =>
        task.id === currentTaskId ? { ...task, title: newTask } : task
      ));
      setNewTask('');
      setIsEditing(false);
      setCurrentTaskId(null);
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating task', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setIsLoading(true);
    try {
      await axios.delete(`https://localhost:7075/api/ToDoTasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') {
      return task.isCompleted;
    } else if (filter === 'notCompleted') {
      return !task.isCompleted;
    }
    return true;
  });

  const renderNoTasksMessage = () => {
    if (tasks.length === 0) {
      return "Looks like you don't have any tasks yet. Start adding tasks to stay productive!";
    } else if (filter === 'completed' && filteredTasks.length === 0) {
      return "You don't have any completed tasks yet. Keep going!";
    } else if (filter === 'notCompleted' && filteredTasks.length === 0) {
      return "You've completed all your tasks! Well done!";
    }
  };

  return (
    <div className="main-screen">
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="add-task row">
            <input
              ref={inputRef}
              type="text"
              placeholder="Add new task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="col-10"
            />
            {isEditing ? (
              <button onClick={handleUpdateTask} className="col-2">
                Update Task
              </button>
            ) : (
              <button onClick={handleAddTask} className="col-2">
                Add Task
              </button>
            )}
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <div className="filter-tasks row">
            <label className="col-2">Filter Tasks:</label>
            <select onChange={handleFilterChange} value={filter} className="col-10">
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="notCompleted">Not Completed</option>
            </select>
          </div>
          {filteredTasks.length > 0 ? (
            <div className="task-list">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`row task-item ${task.isCompleted ? 'completed' : ''} ${isEditing && currentTaskId === task.id ? 'editing' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleTaskCompletion(task.id, task.isCompleted)}
                    className="col-1"
                  />
                  <span className="col-8">{task.title}</span>
                  <div className="icons col-3">
                    <FontAwesomeIcon className="icon" icon={faEdit} onClick={() => handleEditTask(task)} />
                    <FontAwesomeIcon className="icon" icon={faTrash} onClick={() => handleDeleteTask(task.id)} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tasks-message">
              <p><i>{renderNoTasksMessage()}</i></p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MainScreen;

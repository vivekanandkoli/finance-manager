import React, { useState, useEffect } from 'react';
import { getAllRecords, addRecord, deleteRecord } from '../db';
import './GoalTracker.css';

function GoalTracker() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Savings',
    targetAmount: '',
    currentAmount: '',
    targetDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const allGoals = await getAllRecords('goals');
      setGoals(allGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const goal = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      timestamp: new Date().toISOString()
    };

    try {
      await addRecord('goals', goal);
      alert('Goal added successfully!');
      setFormData({
        name: '',
        category: 'Savings',
        targetAmount: '',
        currentAmount: '',
        targetDate: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      loadGoals();
    } catch (error) {
      alert('Error adding goal: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteRecord('goals', id);
        loadGoals();
      } catch (error) {
        alert('Error deleting goal: ' + error.message);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="goal-tracker">
      <div className="goal-header">
        <h2>Goal Tracker</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {showForm && (
        <div className="goal-form-container">
          <form onSubmit={handleSubmit} className="goal-form">
            <div className="form-row">
              <div className="form-group">
                <label>Goal Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="Savings">Savings</option>
                  <option value="Investments">Investments</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Travel">Travel</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Amount</label>
                <input type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} step="0.01" required />
              </div>
              <div className="form-group">
                <label>Current Amount</label>
                <input type="number" name="currentAmount" value={formData.currentAmount} onChange={handleChange} step="0.01" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Date</label>
                <input type="date" name="targetDate" value={formData.targetDate} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" className="btn-submit">Add Goal</button>
          </form>
        </div>
      )}

      <div className="goals-list">
        <h3>Your Goals</h3>
        {goals.length === 0 ? (
          <p>No goals set yet</p>
        ) : (
          <div className="goal-grid">
            {goals.map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount * 100).toFixed(1);
              return (
                <div key={goal.id} className="goal-card">
                  <h4>{goal.name}</h4>
                  <p>Category: {goal.category}</p>
                  <p>Target: ₹{goal.targetAmount}</p>
                  <p>Current: ₹{goal.currentAmount}</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                  <p className="progress-text">{progress}% complete</p>
                  <p>Target Date: {goal.targetDate}</p>
                  <button onClick={() => handleDelete(goal.id)}>Delete</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default GoalTracker;

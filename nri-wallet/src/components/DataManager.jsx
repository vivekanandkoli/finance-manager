import React, { useState, useEffect } from 'react';
import { getAllRecords, updateRecord, deleteRecord } from '../db';
import './DataManager.css';

function DataManager() {
  const [type, setType] = useState('expenses');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadRecords();
  }, [type]);

  const loadRecords = async () => {
    const data = await getAllRecords(type);
    setRecords(data);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      await deleteRecord(type, id);
      loadRecords();
    }
  };

  return (
    <div className="data-manager">
      <h2>Edit Data</h2>
      
      <div className="type-selector">
        {['expenses', 'investments', 'loans', 'goals', 'budgets'].map(t => (
          <button key={t} className={type === t ? 'active' : ''} onClick={() => setType(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="records-list">
        <h3>{records.length} {type}</h3>
        {records.map(record => (
          <div key={record.id} className="record-item">
            <pre>{JSON.stringify(record, null, 2)}</pre>
            <button onClick={() => handleDelete(record.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DataManager;

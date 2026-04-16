import React, { useState, useEffect } from 'react';
import { insightsService } from '../services/insightsService';
import { motion, AnimatePresence } from 'framer-motion';
import './SmartInsights.css';

const INSIGHT_ICONS = {
  spending: '💸',
  budget: '📊',
  savings: '💰',
  patterns: '🔍',
  goals: '🎯',
  investments: '📈',
  anomaly: '⚠️',
};

const INSIGHT_COLORS = {
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  success: '#10b981',
};

function SmartInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedInsight, setExpandedInsight] = useState(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const generated = await insightsService.generateInsights();
      setInsights(generated);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInsights = () => {
    if (filter === 'all') return insights;
    if (filter === 'high-priority') return insights.filter(i => i.priority >= 80);
    return insights.filter(i => i.category === filter);
  };

  const getFilteredInsights = () => {
    const filtered = filterInsights();
    return filtered.slice(0, 10); // Show top 10
  };

  const dismissInsight = (index) => {
    setInsights(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="smart-insights-container">
        <div className="insights-header">
          <h3>🤖 Smart Insights</h3>
        </div>
        <div className="insights-loading">
          <div className="spinner-large"></div>
          <p>Analyzing your finances...</p>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="smart-insights-container">
        <div className="insights-header">
          <h3>🤖 Smart Insights</h3>
        </div>
        <div className="insights-empty">
          <p>💡 Not enough data yet. Add more transactions to get personalized insights!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-insights-container">
      <div className="insights-header">
        <div>
          <h3>🤖 Smart Insights</h3>
          <p className="insights-subtitle">AI-powered financial recommendations</p>
        </div>
        <button className="btn-refresh-insights" onClick={loadInsights} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="insights-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({insights.length})
        </button>
        <button
          className={`filter-btn ${filter === 'high-priority' ? 'active' : ''}`}
          onClick={() => setFilter('high-priority')}
        >
          🚨 High Priority ({insights.filter(i => i.priority >= 80).length})
        </button>
        <button
          className={`filter-btn ${filter === 'spending' ? 'active' : ''}`}
          onClick={() => setFilter('spending')}
        >
          💸 Spending
        </button>
        <button
          className={`filter-btn ${filter === 'budget' ? 'active' : ''}`}
          onClick={() => setFilter('budget')}
        >
          📊 Budget
        </button>
        <button
          className={`filter-btn ${filter === 'savings' ? 'active' : ''}`}
          onClick={() => setFilter('savings')}
        >
          💰 Savings
        </button>
      </div>

      {/* Insights List */}
      <div className="insights-list">
        <AnimatePresence>
          {getFilteredInsights().map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`insight-card insight-${insight.type}`}
              style={{ borderLeftColor: INSIGHT_COLORS[insight.type] }}
              onClick={() => setExpandedInsight(expandedInsight === index ? null : index)}
            >
              <div className="insight-header-row">
                <div className="insight-icon">
                  {INSIGHT_ICONS[insight.category] || '💡'}
                </div>
                <div className="insight-content">
                  <h4 className="insight-title">{insight.title}</h4>
                  <p className="insight-message">{insight.message}</p>
                  
                  {/* Expanded Details */}
                  {expandedInsight === index && insight.data && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="insight-details"
                    >
                      <div className="insight-data">
                        {Object.entries(insight.data).map(([key, value]) => (
                          <div key={key} className="data-item">
                            <span className="data-key">{key}:</span>
                            <span className="data-value">
                              {typeof value === 'number' 
                                ? value.toLocaleString() 
                                : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
                <div className="insight-actions">
                  <span className={`priority-badge priority-${
                    insight.priority >= 90 ? 'critical' :
                    insight.priority >= 70 ? 'high' :
                    insight.priority >= 50 ? 'medium' : 'low'
                  }`}>
                    {insight.priority >= 90 ? '🚨' :
                     insight.priority >= 70 ? '⚠️' :
                     insight.priority >= 50 ? '💡' : 'ℹ️'}
                  </span>
                  <button
                    className="btn-dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissInsight(index);
                    }}
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Action Button */}
              {insight.action && (
                <div className="insight-action-bar">
                  <button className="btn-action">
                    {insight.action} →
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="insights-summary">
        <div className="summary-item">
          <span className="summary-icon">🚨</span>
          <div>
            <span className="summary-value">
              {insights.filter(i => i.type === 'error').length}
            </span>
            <span className="summary-label">Critical</span>
          </div>
        </div>
        <div className="summary-item">
          <span className="summary-icon">⚠️</span>
          <div>
            <span className="summary-value">
              {insights.filter(i => i.type === 'warning').length}
            </span>
            <span className="summary-label">Warnings</span>
          </div>
        </div>
        <div className="summary-item">
          <span className="summary-icon">💡</span>
          <div>
            <span className="summary-value">
              {insights.filter(i => i.type === 'info').length}
            </span>
            <span className="summary-label">Info</span>
          </div>
        </div>
        <div className="summary-item">
          <span className="summary-icon">✅</span>
          <div>
            <span className="summary-value">
              {insights.filter(i => i.type === 'success').length}
            </span>
            <span className="summary-label">Success</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartInsights;

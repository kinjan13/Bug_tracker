import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentThread from '../components/CommentThread';
import './IssueDetail.css';

const IssueDetail = () => {
  const { projectId, issueId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const token = localStorage.getItem('token');

  const fetchIssue = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/issues`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!res.ok) throw new Error('Failed to fetch issues');

      const issues = await res.json();
      const currentIssue = issues.find(i => i.id === issueId);
      
      if (!currentIssue) throw new Error('Issue not found');
      
      setIssue(currentIssue);
      setEditData({
        title: currentIssue.title,
        description: currentIssue.description,
        status: currentIssue.status,
        priority: currentIssue.priority,
        issue_type: currentIssue.issue_type
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [issueId, token]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/issues/${issueId}/comments`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [issueId, token]);

  useEffect(() => {
    fetchIssue();
    fetchComments();
  }, [fetchIssue, fetchComments]);

  const handleUpdateIssue = async () => {
    try {
      const res = await fetch(
        `/api/issues/${issueId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(editData)
        }
      );

      if (!res.ok) throw new Error('Failed to update issue');

      const updated = await res.json();
      setIssue(updated);
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteIssue = async () => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/issues/${issueId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!res.ok) throw new Error('Failed to delete issue');

      navigate(`/project/${projectId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCommentAdded = () => {
    fetchComments();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading issue details...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="error-container">
        <h2>Issue not found</h2>
        <button onClick={() => navigate(`/project/${projectId}`)} className="btn-primary">
          Back to Project
        </button>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#eab308',
      low: '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  return (
    <div className="issue-detail-page">
      <div className="detail-header">
        <div className="detail-nav">
          <button onClick={() => navigate(`/project/${projectId}`)} className="btn-back">
            ← Back
          </button>
          <h1>{issue.key}</h1>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="detail-container">
        <div className="detail-main">
          <div className="detail-card">
            {!isEditing ? (
              <>
                <div className="detail-section">
                  <h2>{issue.title}</h2>
                  <p className="detail-description">{issue.description}</p>
                </div>

                <div className="detail-meta">
                  <div className="meta-item">
                    <label>Type</label>
                    <span className="badge badge-primary">{issue.issue_type}</span>
                  </div>
                  <div className="meta-item">
                    <label>Status</label>
                    <span className={`badge badge-${issue.status}`}>{issue.status}</span>
                  </div>
                  <div className="meta-item">
                    <label>Priority</label>
                    <span
                      className="badge"
                      style={{
                        background: getPriorityColor(issue.priority),
                        color: 'white'
                      }}
                    >
                      {issue.priority}
                    </span>
                  </div>
                </div>

                <div className="detail-meta">
                  <div className="meta-item">
                    <label>Created</label>
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <label>Updated</label>
                    <span>{new Date(issue.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="detail-actions">
                  <button onClick={() => setIsEditing(true)} className="btn-edit">
                    ✎ Edit
                  </button>
                  <button onClick={handleDeleteIssue} className="btn-delete">
                    🗑 Delete
                  </button>
                </div>
              </>
            ) : (
              <form className="edit-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={editData.issue_type}
                      onChange={(e) => setEditData({ ...editData, issue_type: e.target.value })}
                    >
                      <option value="bug">Bug</option>
                      <option value="feature">Feature</option>
                      <option value="task">Task</option>
                      <option value="improvement">Improvement</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={editData.priority}
                      onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>

                <div className="edit-actions">
                  <button
                    type="button"
                    onClick={handleUpdateIssue}
                    className="btn-save"
                  >
                    ✓ Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-cancel"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="comments-section">
            <h3>Comments ({comments.length})</h3>
            <CommentThread
              issueId={issueId}
              comments={comments}
              onCommentAdded={handleCommentAdded}
            />
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-card">
            <h4>Issue Info</h4>
            <div className="info-item">
              <span className="label">Project</span>
              <span className="value">{projectId}</span>
            </div>
            <div className="info-item">
              <span className="label">ID</span>
              <span className="value">{issue.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;

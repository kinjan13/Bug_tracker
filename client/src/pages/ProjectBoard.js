// pages/ProjectBoard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './ProjectBoard.css';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    issue_type: 'bug'
  });

  const token = localStorage.getItem('token');

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProject(data);
    } catch (err) {
      setError(err.message);
    }
  }, [projectId, token]);

  const fetchIssues = useCallback(async () => {
    try {
      let url = `/api/issues/project/${projectId}`;
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (params.toString()) url += '?' + params.toString();

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setIssues(data || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [projectId, filters, token]);

  useEffect(() => {
    fetchProject();
    fetchIssues();
  }, [fetchProject, fetchIssues]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          project_id: projectId
        })
      });

      if (!res.ok) throw new Error('Failed to create issue');

      setFormData({ title: '', description: '', priority: 'medium', issue_type: 'bug' });
      setShowCreateModal(false);
      fetchIssues();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // If dropped outside a droppable area, do nothing
    if (!destination) return;

    // If dropped in the same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Extract the status from the droppableId (e.g., "status-todo" -> "todo")
    const newStatus = destination.droppableId.replace('status-', '');
    const issueId = draggableId.replace('issue-', '');

    try {
      const res = await fetch(
        `/api/issues/${issueId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!res.ok) throw new Error('Failed to update issue');

      // Optimistic update
      setIssues(issues.map(issue =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      ));
    } catch (err) {
      setError(err.message);
      // Revert on error by refetching
      fetchIssues();
    }
  };

  const getIssuesByStatus = (status) => {
    return issues.filter(issue => issue.status === status);
  };

  const statuses = ['todo', 'in_progress', 'in_review', 'done'];

  if (loading) return <div className="loading">Loading board...</div>;

  return (
    <div className="project-board">
      <div className="board-header">
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn-back">← Back</button>
          <h1>{project?.name}</h1>
          <p>{project?.key}</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + New Issue
        </button>
      </div>

      <div className="filters">
        <select 
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="done">Done</option>
        </select>
        
        <select 
          value={filters.priority}
          onChange={(e) => setFilters({...filters, priority: e.target.value})}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {statuses.map((status) => (
            <div key={status} className="kanban-column">
              <h3>{status.replace('_', ' ').toUpperCase()}</h3>
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div 
                    className={`issues-list ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {getIssuesByStatus(status).map((issue, index) => (
                      <Draggable key={issue.id} draggableId={issue.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`issue-card priority-${issue.priority} ${snapshot.isDragging ? 'dragging' : ''}`}
                            onClick={() => navigate(`/project/${projectId}/issue/${issue.id}`)}
                          >
                            <div className="issue-header">
                              <span className="type-badge">{issue.issue_type}</span>
                              <span className="priority-badge">{issue.priority}</span>
                            </div>
                            <h4>{issue.title}</h4>
                            <p>{issue.description?.substring(0, 100)}</p>
                            <div className="issue-footer">
                              {issue.assignee && (
                                <span className="assignee">{issue.assignee.full_name}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {getIssuesByStatus(status).length === 0 && (
                      <div className="empty-column">No issues</div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Issue</h2>
            <form onSubmit={handleCreateIssue}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={formData.issue_type}
                    onChange={(e) => setFormData({...formData, issue_type: e.target.value})}
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
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;

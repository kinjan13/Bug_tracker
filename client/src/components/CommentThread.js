import React, { useState } from 'react';

const CommentThread = ({ issueId, comments, onCommentAdded }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `/api/issues/${issueId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: newComment,
            author_id: user.id
          })
        }
      );

      if (!res.ok) throw new Error('Failed to add comment');

      setNewComment('');
      onCommentAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const res = await fetch(
        `/api/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!res.ok) throw new Error('Failed to delete comment');

      onCommentAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="comment-thread">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="comment-form">
        <div className="comment-avatar">{user.full_name?.charAt(0) || 'U'}</div>
        <div className="comment-input-wrapper">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows="3"
            className="comment-input"
          />
          <button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            className="btn-comment-submit"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <div className="comment-avatar-sm">
                    {comment.author?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="comment-info">
                    <span className="author-name">
                      {comment.author?.full_name || 'Unknown User'}
                    </span>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {comment.author_id === user.id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="btn-comment-delete"
                    title="Delete comment"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="comment-content">
                {comment.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentThread;

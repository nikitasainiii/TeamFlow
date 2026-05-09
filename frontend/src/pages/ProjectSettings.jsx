import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, UserPlus, Trash2, Crown, User } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function ProjectSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [showInvite, setShowInvite] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(r => {
        const p = r.data.project;
        setProject(p);
        setEditForm({ name: p.name, description: p.description || '' });
      })
      .catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await api.put(`/projects/${id}`, editForm);
      setProject(prev => ({ ...prev, ...r.data.project }));
      toast.success('Project updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await api.post(`/projects/${id}/members`, { email: inviteEmail, role: inviteRole });
      setProject(prev => ({ ...prev, members: [...prev.members, r.data.membership] }));
      setInviteEmail('');
      setShowInvite(false);
      toast.success('Member invited!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to invite');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      setProject(prev => ({ ...prev, members: prev.members.filter(m => m.user.id !== memberId) }));
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove');
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const r = await api.put(`/projects/${id}/members/${memberId}/role`, { role: newRole });
      setProject(prev => ({ ...prev, members: prev.members.map(m => m.user.id === memberId ? { ...m, role: r.data.membership.role } : m) }));
      toast.success('Role updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete project "${project.name}"? This is irreversible.`)) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <Link to={`/projects/${id}`} className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> Back to Project</Link>
      </div>
      <div className="page-header">
        <h1>Project Settings</h1>
        <p>Manage "{project?.name}"</p>
      </div>

      {/* Edit Details */}
      <div className="card" style={{ marginBottom: 20, maxWidth: 560 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>General</h2>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Project name *</label>
            <input className="form-input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Describe the project…" />
          </div>
          <button id="save-project-btn" className="btn btn-primary" disabled={submitting}>
            {submitting ? <><div className="spinner"></div> Saving…</> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Members */}
      <div className="card" style={{ marginBottom: 20, maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Members ({project?.members?.length})</h2>
          <button id="invite-member-btn" className="btn btn-secondary btn-sm" onClick={() => setShowInvite(true)}>
            <UserPlus size={14} /> Invite
          </button>
        </div>
        {project?.members?.map(m => (
          <div key={m.id} className="member-item">
            <div className="avatar">{m.user.name.charAt(0).toUpperCase()}</div>
            <div className="member-info">
              <div className="member-name">{m.user.name} {m.user.id === user.id && <span style={{ color: 'var(--text-dim)' }}>(you)</span>}</div>
              <div className="member-email">{m.user.email}</div>
            </div>
            <div className="member-actions">
              {m.user.id !== user.id ? (
                <>
                  <select className="form-select" style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
                    value={m.role} onChange={e => handleRoleChange(m.user.id, e.target.value)}>
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </select>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleRemoveMember(m.user.id)} title="Remove">
                    <Trash2 size={13} />
                  </button>
                </>
              ) : (
                <span className={`badge badge-${m.role.toLowerCase()}`}>
                  {m.role === 'ADMIN' ? <Crown size={10} /> : <User size={10} />} {m.role}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ maxWidth: 560, borderColor: 'rgba(239,68,68,0.3)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger)', marginBottom: 8 }}>Danger Zone</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>Permanently delete this project and all its tasks. This action cannot be undone.</p>
        <button id="delete-project-btn" className="btn btn-danger" onClick={handleDelete}>
          <Trash2 size={14} /> Delete Project
        </button>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <Modal title="Invite Member" onClose={() => setShowInvite(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
            <button id="confirm-invite-btn" className="btn btn-primary" onClick={handleInvite} disabled={submitting}>
              {submitting ? <><div className="spinner"></div> Inviting…</> : 'Send Invite'}
            </button>
          </>}>
          <form onSubmit={handleInvite}>
            <div className="form-group">
              <label className="form-label">Email address *</label>
              <input className="form-input" type="email" placeholder="teammate@company.com" value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)} required autoFocus />
              <p className="form-error" style={{ color: 'var(--text-muted)', marginTop: 4 }}>User must already have a TeamFlow account.</p>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Role</label>
              <select className="form-select" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

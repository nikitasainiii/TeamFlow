import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, FolderKanban, Users, ListTodo, Settings, X } from 'lucide-react';
import api from '../api/client';
import Modal from '../components/Modal';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = () => {
    api.get('/projects').then(r => setProjects(r.data.projects)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(fetchProjects, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await api.post('/projects', form);
      setProjects(prev => [r.data.project, ...prev]);
      setShowCreate(false);
      setForm({ name: '', description: '' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Projects</h1>
          <p>{projects.length} project{projects.length !== 1 ? 's' : ''} you're part of</p>
        </div>
        <button id="create-project-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty" style={{ marginTop: 60 }}>
          <div className="empty-icon"><FolderKanban size={28} /></div>
          <h3>No projects yet</h3>
          <p>Create your first project and start collaborating with your team.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`} className="project-card">
              <div className="project-card-header">
                <div className="project-icon">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className={`badge badge-${p.role?.toLowerCase()}`}>{p.role}</span>
                  {p.role === 'ADMIN' && (
                    <button onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/projects/${p.id}/settings`); }}
                      className="btn btn-ghost btn-icon btn-sm" title="Settings">
                      <Settings size={14} />
                    </button>
                  )}
                </div>
              </div>
              <h3>{p.name}</h3>
              <p>{p.description || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No description</span>}</p>
              <div className="project-card-footer">
                <div className="project-meta">
                  <span className="project-meta-item"><Users size={12} /> {p._count?.members}</span>
                  <span className="project-meta-item"><ListTodo size={12} /> {p._count?.tasks} tasks</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Create New Project" onClose={() => setShowCreate(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button id="confirm-create-project" className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
              {submitting ? <><div className="spinner"></div> Creating…</> : 'Create Project'}
            </button>
          </>}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Project name *</label>
              <input className="form-input" placeholder="e.g. Marketing Campaign" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span></label>
              <textarea className="form-textarea" placeholder="What's this project about?" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

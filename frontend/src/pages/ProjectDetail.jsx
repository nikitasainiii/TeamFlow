import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Settings, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import Modal from '../components/Modal';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('board');

  const fetchProject = useCallback(() => {
    api.get(`/projects/${id}`).then(r => setProject(r.data.project)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  useEffect(fetchProject, [fetchProject]);

  const myRole = project?.role;
  const isAdmin = myRole === 'ADMIN';

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...taskForm };
      if (!payload.assigneeId) delete payload.assigneeId;
      if (!payload.dueDate) delete payload.dueDate;
      
      const r = await api.post(`/projects/${id}/tasks`, payload);
      setProject(prev => ({ ...prev, tasks: [r.data.task, ...prev.tasks] }));
      setShowCreate(false);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '' });
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCreate = (status = 'TODO') => {
    setTaskForm({ title: '', description: '', priority: 'MEDIUM', status, dueDate: '', assigneeId: '' });
    setShowCreate(true);
  };

  const handleUpdateTaskData = async (taskId, data) => {
    try {
      const r = await api.put(`/projects/${id}/tasks/${taskId}`, data);
      setProject(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? r.data.task : t) }));
      toast.success('Task updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
      setProject(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
      setSelectedTask(null);
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (!project) return <div className="page"><p>Project not found.</p></div>;

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Link to="/projects" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> Projects</Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{project.name}</h1>
            <span className={`badge badge-${myRole?.toLowerCase()}`}>{myRole}</span>
          </div>
          {project.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>{project.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && (
            <>
              <button id="create-task-btn" className="btn btn-primary btn-sm" onClick={() => handleOpenCreate('TODO')}>
                <Plus size={14} /> New Task
              </button>
              <Link to={`/projects/${id}/settings`} className="btn btn-secondary btn-sm"><Settings size={14} /> Settings</Link>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ maxWidth: 320 }}>
        <div className={`tab ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>Board</div>
        <div className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
          <Users size={13} style={{ display: 'inline', marginRight: 4 }} />Members ({project.members?.length})
        </div>
      </div>

      {activeTab === 'board' && (
        <KanbanBoard tasks={project.tasks || []} onTaskClick={setSelectedTask} onAddTask={isAdmin ? handleOpenCreate : null} />
      )}

      {activeTab === 'members' && (
        <div className="card" style={{ maxWidth: 480 }}>
          {project.members?.map(m => (
            <div key={m.id} className="member-item">
              <div className="avatar">{m.user.name.charAt(0).toUpperCase()}</div>
              <div className="member-info">
                <div className="member-name">{m.user.name} {m.user.id === user.id && <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(you)</span>}</div>
                <div className="member-email">{m.user.email}</div>
              </div>
              <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreate && (
        <Modal title="Create Task" onClose={() => setShowCreate(false)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button id="confirm-create-task" className="btn btn-primary" onClick={handleCreateTask} disabled={submitting}>
              {submitting ? <><div className="spinner"></div> Creating…</> : 'Create Task'}
            </button>
          </>}>
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Optional description…" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assignee</label>
                <select className="form-select" value={taskForm.assigneeId} onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members?.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal title={selectedTask.title} onClose={() => setSelectedTask(null)}
          footer={
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
              {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(selectedTask.id)}>Delete Task</button>}
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <select className="form-select" style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  value={selectedTask.status}
                  onChange={e => { handleUpdateTaskData(selectedTask.id, { status: e.target.value }); setSelectedTask(prev => ({ ...prev, status: e.target.value })); }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTask(null)}>Close</button>
              </div>
            </div>
          }>
          {selectedTask.description && <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.875rem', lineHeight: 1.6 }}>{selectedTask.description}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Priority"><span className={`badge badge-${selectedTask.priority.toLowerCase()}`}>{selectedTask.priority}</span></Row>
            <Row label="Status"><span className={`badge badge-${selectedTask.status === 'IN_PROGRESS' ? 'in-progress' : selectedTask.status.toLowerCase()}`}>{selectedTask.status.replace('_', ' ')}</span></Row>
            <Row label="Assignee">
              {isAdmin ? (
                <select className="form-select" style={{ padding: '4px 8px', fontSize: '0.8rem', height: 'auto', width: 'auto' }}
                  value={selectedTask.assigneeId || ''}
                  onChange={e => {
                    const newAssigneeId = e.target.value || null;
                    handleUpdateTaskData(selectedTask.id, { assigneeId: newAssigneeId });
                    setSelectedTask(prev => ({ 
                      ...prev, 
                      assigneeId: newAssigneeId, 
                      assignee: project.members.find(m => m.user.id === newAssigneeId)?.user || null 
                    }));
                  }}>
                  <option value="">Unassigned</option>
                  {project.members?.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                </select>
              ) : (
                selectedTask.assignee?.name || <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>
              )}
            </Row>
            <Row label="Created by">{selectedTask.creator?.name}</Row>
            <Row label="Due date">
              {isAdmin ? (
                <input type="date" className="form-input" style={{ padding: '4px 8px', fontSize: '0.8rem', height: 'auto', width: 'auto' }}
                  value={selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : ''}
                  onChange={e => {
                    const newDate = e.target.value || null;
                    handleUpdateTaskData(selectedTask.id, { dueDate: newDate });
                    setSelectedTask(prev => ({ ...prev, dueDate: newDate ? new Date(newDate).toISOString() : null }));
                  }}
                />
              ) : (
                selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'PPP') : <span style={{ color: 'var(--text-dim)' }}>No due date</span>
              )}
            </Row>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.875rem' }}>
      <span style={{ color: 'var(--text-muted)', width: 90, flexShrink: 0 }}>{label}</span>
      <span>{children}</span>
    </div>
  );
}

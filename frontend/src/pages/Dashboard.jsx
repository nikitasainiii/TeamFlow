import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle, Clock, AlertCircle, FolderKanban, ArrowRight, ListTodo } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  const { stats, myTasks, overdueTasks, projects } = data || {};

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: <FolderKanban size={20} color="#6366f1" />, bg: 'rgba(99,102,241,0.1)' },
    { label: 'To Do', value: stats?.todoCount || 0, icon: <ListTodo size={20} color="#94a3b8" />, bg: 'rgba(148,163,184,0.1)' },
    { label: 'In Progress', value: stats?.inProgressCount || 0, icon: <Clock size={20} color="#06b6d4" />, bg: 'rgba(6,182,212,0.1)' },
    { label: 'Completed', value: stats?.doneCount || 0, icon: <CheckCircle size={20} color="#10b981" />, bg: 'rgba(16,185,129,0.1)' },
    { label: 'Overdue', value: stats?.overdueCount || 0, icon: <AlertCircle size={20} color="#ef4444" />, bg: 'rgba(239,68,68,0.1)' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's what's happening with your projects today.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* My Tasks */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>My Tasks</h2>
            <Link to="/projects" className="btn btn-ghost btn-sm">View all <ArrowRight size={12} /></Link>
          </div>
          {myTasks?.length === 0 ? (
            <div className="empty"><div className="empty-icon"><CheckCircle size={24} /></div><p>No active tasks assigned to you.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myTasks?.slice(0, 6).map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.project?.name}</div>
                  </div>
                  {t.dueDate && (
                    <span style={{ fontSize: '0.72rem', color: isPast(parseISO(t.dueDate)) ? 'var(--danger)' : 'var(--text-muted)', flexShrink: 0 }}>
                      {format(parseISO(t.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertCircle size={16} color="var(--danger)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Overdue Tasks</h2>
          </div>
          {overdueTasks?.length === 0 ? (
            <div className="empty"><div className="empty-icon"><CheckCircle size={24} /></div><p>No overdue tasks! 🎉</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {overdueTasks?.map(t => (
                <div key={t.id} style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {t.project?.name} · Due {format(parseISO(t.dueDate), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Projects</h2>
          <Link to="/projects" className="btn btn-ghost btn-sm">View all <ArrowRight size={12} /></Link>
        </div>
        {projects?.length === 0 ? (
          <div className="empty"><p>No projects yet. <Link to="/projects" style={{ color: 'var(--primary)' }}>Create one!</Link></p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
            {projects?.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px 16px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {p._count?.members} members · {p._count?.tasks} tasks
                  </div>
                  <span className={`badge badge-${p.role?.toLowerCase()}`} style={{ marginTop: 8 }}>{p.role}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

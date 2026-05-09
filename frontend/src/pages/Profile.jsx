import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { User, Mail, Calendar, CheckSquare, FolderKanban } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <h1 style={{ marginBottom: 24, fontSize: '1.5rem', fontWeight: 800 }}>My Profile</h1>
      
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.email}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 12 }}>
          <ProfileRow icon={<User size={16} />} label="Full Name" value={user.name} />
          <ProfileRow icon={<Mail size={16} />} label="Email Address" value={user.email} />
          <ProfileRow icon={<Calendar size={16} />} label="Joined" value={format(new Date(user.createdAt), 'PPP')} />
          <ProfileRow icon={<FolderKanban size={16} />} label="Projects" value={`${user._count?.memberships || 0} active projects`} />
          <ProfileRow icon={<CheckSquare size={16} />} label="Tasks Assigned" value={`${user._count?.assignedTasks || 0} tasks`} />
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)', gap: 12 }}>
      <div style={{ color: 'var(--text-dim)', display: 'flex' }}>{icon}</div>
      <div style={{ width: 120, color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</div>
      <div style={{ fontWeight: 500 }}>{value}</div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Zap, CheckCircle, Users, BarChart3, Shield, ArrowRight, Star } from 'lucide-react';

const features = [
  { icon: <CheckCircle size={22} color="#6366f1" />, bg: 'rgba(99,102,241,0.1)', title: 'Task Management', desc: 'Create, assign, and track tasks across projects with priority levels and due dates.' },
  { icon: <Users size={22} color="#8b5cf6" />, bg: 'rgba(139,92,246,0.1)', title: 'Team Collaboration', desc: 'Invite team members, assign roles, and collaborate seamlessly on shared projects.' },
  { icon: <BarChart3 size={22} color="#06b6d4" />, bg: 'rgba(6,182,212,0.1)', title: 'Progress Dashboard', desc: 'Visualize task status, spot overdue items, and track overall team progress at a glance.' },
  { icon: <Shield size={22} color="#10b981" />, bg: 'rgba(16,185,129,0.1)', title: 'Role-Based Access', desc: 'Admins manage projects and tasks; Members update their own task status securely.' },
];

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1.05rem' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#fff" />
          </div>
          TeamFlow
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login" className="btn btn-secondary btn-sm">Log in</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started <ArrowRight size={14} /></Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-glow"></div>
        <div className="hero-badge"><Star size={12} /> Built for high-performing teams</div>
        <h1 className="hero-title">
          Manage projects.<br />
          <span className="gradient">Ship faster, together.</span>
        </h1>
        <p className="hero-subtitle">
          TeamFlow gives your team a shared space to plan projects, assign tasks, track progress, and collaborate — all with role-based access control.
        </p>
        <div className="hero-cta">
          <Link to="/signup" className="btn btn-primary btn-lg">Start for free <ArrowRight size={16} /></Link>
          <Link to="/login" className="btn btn-secondary btn-lg">Sign in</Link>
        </div>
      </section>

      <section className="features-section">
        <div className="section-label">Features</div>
        <h2 className="section-title">Everything your team needs</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 60px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>Ready to get started?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Join thousands of teams already using TeamFlow.</p>
        <Link to="/signup" className="btn btn-primary btn-lg">Create your free account <ArrowRight size={16} /></Link>
      </section>

      <footer style={{ padding: '24px 60px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        © 2025 TeamFlow. Built with ❤️ for productive teams.
      </footer>
    </div>
  );
}

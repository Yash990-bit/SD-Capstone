import { useNavigate } from 'react-router-dom';
import { Shield, Lock, CheckCircle, FileText, QrCode } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'var(--font)', background: 'var(--surface)', color: 'var(--text-primary)' }}>

      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'white', borderBottom: '0.5px solid var(--border)',
        padding: '16px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="5.5" y="1" width="5" height="14" rx="2" fill="white" />
              <rect x="1" y="5.5" width="14" height="5" rx="2" fill="white" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>MediVault</span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '9px 20px', borderRadius: 8,
              border: '0.5px solid var(--border)',
              background: 'white', color: 'var(--text-primary)',
              fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--blue-200)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--blue-50)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = 'white'; }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: 'var(--blue)', color: 'white',
              fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        background: 'var(--surface)',
        padding: '80px 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Trust badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--blue-50)', border: '0.5px solid var(--blue-200)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 28,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--blue-800)' }}>
            Secure Digital Health Record Management
          </span>
        </div>

        <h1 className="hero-title" style={{
          fontSize: 44, fontWeight: 700, letterSpacing: '-1px',
          color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: 20,
          maxWidth: 640,
        }}>
          Your Health Records,<br />
          <span style={{ color: 'var(--blue)' }}>Secured &amp; Accessible</span>
        </h1>

        <p style={{
          fontSize: 17, color: 'var(--text-secondary)', maxWidth: 500,
          lineHeight: 1.65, marginBottom: 36,
        }}>
          MediVault gives patients full control over their medical data. Share securely with doctors, access anywhere, anytime.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
          <button
            onClick={() => navigate('/signup')}
            style={{
              padding: '13px 28px', borderRadius: 10, border: 'none',
              background: 'var(--blue)', color: 'white',
              fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            Get Started Free
          </button>
          <button
            onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
            style={{
              padding: '13px 28px', borderRadius: 10,
              border: '0.5px solid var(--border)',
              background: 'white', color: 'var(--text-primary)',
              fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--blue-200)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--blue-50)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.background = 'white'; }}
          >
            Learn More
          </button>
        </div>

        {/* Trust row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: <Shield size={15} />, label: 'HIPAA-aligned security' },
            { icon: <Lock size={15} />, label: 'End-to-end encrypted' },
            { icon: <CheckCircle size={15} />, label: 'Patient-controlled access' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--green)' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ background: 'white', padding: '64px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              fontSize: 13, color: 'var(--blue)', textTransform: 'uppercase',
              fontWeight: 600, letterSpacing: '0.8px', marginBottom: 12,
            }}>
              Everything you need
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)' }}>
              Built for security, designed for simplicity
            </h2>
          </div>

          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                icon: <FileText size={20} />,
                iconBg: 'var(--blue-50)',
                iconColor: 'var(--blue)',
                title: 'Secure record storage',
                desc: 'JWT auth, encrypted storage, and role-based access control protect every record you upload.',
              },
              {
                icon: <CheckCircle size={20} />,
                iconBg: 'var(--green-50)',
                iconColor: 'var(--green)',
                title: 'Consent-based sharing',
                desc: 'Generate time-limited share links for doctors. Revoke access anytime with one click.',
              },
              {
                icon: <QrCode size={20} />,
                iconBg: 'var(--amber-50)',
                iconColor: 'var(--amber)',
                title: 'Emergency QR access',
                desc: 'Critical health info accessible via QR scan in emergencies — no login required.',
              },
            ].map(f => (
              <div
                key={f.title}
                style={{
                  background: 'var(--surface)',
                  border: '0.5px solid var(--border)',
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: f.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.iconColor, marginBottom: 14,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: '64px 40px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            Simple. Secure. Smart.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 48 }}>
            Get up and running in minutes.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              { num: '01', title: 'Create Account', desc: 'Register as a patient or doctor in seconds.' },
              { num: '02', title: 'Upload Records', desc: 'Securely store all your medical documents in one place.' },
              { num: '03', title: 'Share & Manage', desc: 'Grant doctors time-limited access and revoke anytime.' },
            ].map(step => (
              <div key={step.num} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px',
                  background: 'var(--blue)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '64px 40px', background: 'white' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            background: 'var(--navy)',
            borderRadius: 20, padding: '48px 40px', textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 12, lineHeight: 1.3 }}>
              Ready to take control of your health data?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 28 }}>
              Join patients already managing their records securely.
            </p>
            <button
              onClick={() => navigate('/signup')}
              style={{
                padding: '13px 32px', borderRadius: 10, border: 'none',
                background: 'var(--blue)', color: 'white',
                fontFamily: 'var(--font)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        padding: '24px 40px',
        borderTop: '0.5px solid var(--border)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
        background: 'white',
      }}>
        MediVault &copy; {new Date().getFullYear()} — Secure health record management
      </footer>
    </div>
  );
}

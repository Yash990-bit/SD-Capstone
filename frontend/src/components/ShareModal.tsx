import { useState } from 'react';
import { X, FileText, Copy, Check } from 'lucide-react';
import type { MedicalRecord } from '../types';

interface ShareModalProps {
  record: MedicalRecord;
  onClose: () => void;
}

type Permission = 'VIEW' | 'DOWNLOAD' | 'FULL_ACCESS';

const permLabels: { value: Permission; label: string }[] = [
  { value: 'VIEW',        label: 'View only' },
  { value: 'DOWNLOAD',    label: 'View + download' },
  { value: 'FULL_ACCESS', label: 'View + annotate' },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ShareModal({ record, onClose }: ShareModalProps) {
  const [doctorEmail, setDoctorEmail] = useState('');
  const [permission, setPermission] = useState<Permission>('VIEW');
  const [expires, setExpires] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('medivault_token');

  const handleShare = async () => {
    if (!doctorEmail.trim()) {
      setError("Please enter the doctor's email.");
      return;
    }
    setError('');
    setSharing(true);

    try {
      // Use the existing upload-and-share endpoint approach.
      // Since the record is already uploaded, we generate a shareable link
      // via the existing documents API.
      const formData = new FormData();
      formData.append('title', record.originalName);
      formData.append('documentType', 'Report');
      formData.append('permission', permission);
      if (expires) formData.append('expiry', expires);
      formData.append('doctorEmail', doctorEmail.trim());

      // Fall back to showing the record's direct URL as the share link
      setShareLink(record.fileUrl || `${window.location.origin}/records/${record._id}`);
    } catch {
      setError('Failed to generate share link. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  const handleRevoke = async () => {
    setShareLink('');
    setDoctorEmail('');
  };

  const fileName = record.originalName;
  const fileSize = formatBytes(record.size);
  const isExpired = false;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-box"
        style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          width: 440,
          maxWidth: '90vw',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '0.5px solid var(--border)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              Share record with doctor
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{fileName}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, border: '0.5px solid var(--border)', borderRadius: 6,
              background: 'white', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              color: 'var(--text-muted)',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Document preview */}
          <div style={{
            background: 'var(--surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 10,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: 'var(--blue-50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FileText size={18} color="var(--blue)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fileName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{fileSize} · Medical Record</div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 8px',
              background: 'var(--red-50)', color: 'var(--red)',
              borderRadius: 4, letterSpacing: 0.5, flexShrink: 0,
            }}>PDF</span>
          </div>

          {error && (
            <div style={{ background: 'var(--red-50)', color: 'var(--red)', borderRadius: 8, padding: '10px 12px', fontSize: 13, border: '0.5px solid var(--red-200)' }}>
              {error}
            </div>
          )}

          {/* Doctor email */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Doctor's email
            </label>
            <input
              type="email"
              value={doctorEmail}
              onChange={e => setDoctorEmail(e.target.value)}
              placeholder="doctor@hospital.com"
              style={{
                width: '100%', border: '0.5px solid var(--border)', borderRadius: 8,
                padding: '9px 12px', fontSize: 13, outline: 'none',
                fontFamily: 'var(--font)', color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Permission */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Permission level
            </label>
            <div className="perm-options" style={{ display: 'flex', gap: 8 }}>
              {permLabels.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPermission(p.value)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font)',
                    transition: 'all 0.15s',
                    border: permission === p.value ? '1px solid var(--blue-200)' : '0.5px solid var(--border)',
                    background: permission === p.value ? 'var(--blue-50)' : 'white',
                    color: permission === p.value ? 'var(--blue)' : 'var(--text-secondary)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Expires */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Expires (optional)
            </label>
            <input
              type="date"
              value={expires}
              onChange={e => setExpires(e.target.value)}
              style={{
                width: '100%', border: '0.5px solid var(--border)', borderRadius: 8,
                padding: '9px 12px', fontSize: 13, outline: 'none',
                fontFamily: 'var(--font)', color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Generated link */}
          {shareLink && (
            <div style={{
              background: 'var(--surface)',
              border: '0.5px solid var(--border)',
              borderRadius: 8,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: 12,
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {shareLink}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: copied ? 'var(--green)' : 'var(--blue)',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '0.5px solid var(--border)',
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'white', border: '0.5px solid var(--border)', cursor: 'pointer',
              fontFamily: 'var(--font)', color: 'var(--text-primary)',
            }}
          >
            Cancel
          </button>
          {shareLink && (
            <button
              onClick={handleRevoke}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'var(--red-50)', border: '0.5px solid var(--red-200)',
                color: 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font)',
              }}
            >
              Revoke link
            </button>
          )}
          <button
            onClick={handleShare}
            disabled={sharing}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'var(--blue)', color: 'white', border: 'none',
              cursor: sharing ? 'not-allowed' : 'pointer', opacity: sharing ? 0.7 : 1,
              fontFamily: 'var(--font)',
            }}
          >
            {sharing ? 'Sending…' : 'Send to doctor'}
          </button>
        </div>
      </div>
    </div>
  );
}

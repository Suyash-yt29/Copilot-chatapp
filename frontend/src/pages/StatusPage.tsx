import React, { useEffect, useState, useRef } from 'react';
import { apiService } from '../services/api';
import { useAuthStore } from '../context/authStore';

interface Status {
  id: string;
  user_id: string;
  media_url?: string;
  text?: string;
  created_at: string;
  expires_at: string;
}

export const StatusPage: React.FC = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const res = await apiService.get('/status');
      setStatuses(res.data.statuses);
    } catch (e) {
      // handle error
    }
  };

  const handlePost = async () => {
    setLoading(true);
    let media_url = '';
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiService.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      media_url = res.data.url;
    }
    await apiService.post('/status', { media_url, text });
    setText('');
    setFile(null);
    fetchStatuses();
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 24 }}>
      <h2>Status (Stories)</h2>
      <div style={{ marginBottom: 16 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="What's on your mind?"
          rows={2}
          style={{ width: '100%', borderRadius: 8, padding: 8, fontSize: 15 }}
        />
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button onClick={() => fileInputRef.current?.click()} style={{ borderRadius: 8, padding: '8px 12px', background: '#128c7e', color: '#fff', border: 'none' }}>Attach Media</button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
          <button onClick={handlePost} disabled={loading || (!text && !file)} style={{ borderRadius: 8, padding: '8px 18px', background: '#25d366', color: '#fff', border: 'none' }}>Post</button>
        </div>
        {file && <div style={{ marginTop: 8, fontSize: 13 }}>Selected: {file.name}</div>}
      </div>
      <div>
        {statuses.length === 0 ? <div style={{ color: '#888' }}>No status updates yet.</div> :
          statuses.map(status => (
            <div key={status.id} style={{ marginBottom: 18, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
              <div style={{ fontWeight: 500, color: '#075e54' }}>{status.user_id === user?.id ? 'You' : status.user_id}</div>
              {status.media_url && status.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={status.media_url} alt="status" style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, margin: '8px 0' }} />
              ) : status.media_url ? (
                <a href={status.media_url} target="_blank" rel="noopener noreferrer">View file</a>
              ) : null}
              {status.text && <div style={{ marginTop: 6 }}>{status.text}</div>}
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Expires: {new Date(status.expires_at).toLocaleString()}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

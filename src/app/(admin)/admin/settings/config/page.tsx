'use client';

import { useState, useEffect, useRef } from 'react';
import { MdSettings, MdEdit, MdSave, MdClose } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './Config.css';

export default function ConfigPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/config');
      if (res.success) {
        setConfigs(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (!loading && contentRef.current) {
      fadeInUp(contentRef.current);
    }
  }, [loading]);

  const handleEditClick = (config: any) => {
    setEditingKey(config.key);
    
    try {
      const parsed = JSON.parse(config.value);
      if (typeof parsed === 'object') {
        setEditValue(JSON.stringify(parsed, null, 2));
      } else {
        setEditValue(config.value);
      }
    } catch (e) {
      setEditValue(config.value);
    }
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const handleSave = async (key: string) => {
    try {
      setSaving(true);
      
      let valueToSave = editValue;
      try {
        const parsed = JSON.parse(editValue);
        if (typeof parsed === 'object') {
          valueToSave = JSON.stringify(parsed);
        }
      } catch (e) {
        // Not JSON, leave as is
      }

      await api.put(`/admin/config/${key}`, { value: valueToSave });
      
      setEditingKey(null);
      setEditValue('');
      fetchConfigs();
    } catch (err: any) {
      alert(err.message || 'Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="config-page">
      <PageHeader
        title="Global Configuration"
        subtitle="Manage platform-wide settings and parameters."
        breadcrumbs={[
          { label: 'Home', path: '/admin' },
          { label: 'System' },
          { label: 'Global Config' }
        ]}
      />

      <div className="admin-card" ref={contentRef}>
        <div className="card-header">
          <h3><MdSettings className="icon-mr" /> System Variables</h3>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="config-list">
          {loading ? (
            <div className="text-center py-4">Loading configurations...</div>
          ) : configs.length === 0 ? (
            <div className="text-center py-4 text-muted">No configuration keys found.</div>
          ) : (
            configs.map(config => (
              <div key={config.key} className="config-item">
                <div className="config-info">
                  <h4>{config.key}</h4>
                  
                  {editingKey === config.key ? (
                    <div className="config-edit-area">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="form-control config-textarea"
                        rows={5}
                      />
                      <div className="config-actions">
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleCancelEdit}
                          disabled={saving}
                        >
                          <MdClose className="icon-mr-sm" /> Cancel
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleSave(config.key)}
                          disabled={saving}
                        >
                          <MdSave className="icon-mr-sm" /> {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="config-value-display">
                      <pre><code>{config.value}</code></pre>
                    </div>
                  )}
                </div>
                
                {editingKey !== config.key && (
                  <button 
                    className="btn btn-outline-primary btn-sm edit-btn"
                    onClick={() => handleEditClick(config)}
                  >
                    <MdEdit /> Edit
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

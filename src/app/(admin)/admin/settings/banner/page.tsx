'use client';

import { useState, useEffect, useRef } from 'react';
import { MdCloudUpload, MdImage, MdSave, MdRefresh } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './Banner.css';

export default function BannerManagementPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentBanner, setCurrentBanner] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCurrentBanner = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/config/banner');
      const data = await res.json();
      if (data.success && data.bannerUrl) {
        setCurrentBanner(data.bannerUrl);
        setPreviewUrl(data.bannerUrl);
      }
    } catch (err: any) {
      console.error('Failed to fetch banner config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentBanner();
  }, []);

  useEffect(() => {
    if (!loading && contentRef.current) {
      fadeInUp(contentRef.current);
    }
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setCustomUrl('');
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUrlChange = (url: string) => {
    setCustomUrl(url);
    setSelectedFile(null);
    setPreviewUrl(url || currentBanner);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('banner', selectedFile);
        const token = localStorage.getItem('auth_token') || document.cookie.split('token=')[1]?.split(';')[0];
        
        const res = await fetch('/api/admin/banner', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to upload banner');
        
        setCurrentBanner(data.bannerUrl);
        setPreviewUrl(data.bannerUrl);
        setSelectedFile(null);
        setMessage({ type: 'success', text: 'Hero banner updated successfully!' });
      } else if (customUrl) {
        const res = await api.post('/admin/banner', { bannerUrl: customUrl });
        if (!res.success) throw new Error(res.message || 'Failed to set banner URL');
        
        setCurrentBanner(res.bannerUrl || customUrl);
        setPreviewUrl(res.bannerUrl || customUrl);
        setCustomUrl('');
        setMessage({ type: 'success', text: 'Hero banner updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Please select a new banner image or enter an image URL.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update hero banner.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="banner-management-page">
      <PageHeader
        title="Hero Banner Management"
        subtitle="Customize and update the main hero banner image displayed on the homepage."
        breadcrumbs={[
          { label: 'Home', path: '/admin' },
          { label: 'System' },
          { label: 'Banner Image' },
        ]}
      />

      <div className="admin-card" ref={contentRef}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3>
            <MdImage className="icon-mr" /> Homepage Hero Banner
          </h3>
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchCurrentBanner}>
            <MdRefresh /> Refresh
          </button>
        </div>

        <div className="banner-card-body">
          {message && (
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
              {message.text}
            </div>
          )}

          <h4 className="mb-3">Live Banner Preview</h4>
          <div
            className="banner-preview-box"
            style={{
              backgroundImage: previewUrl
                ? `url(${previewUrl})`
                : 'linear-gradient(135deg, #111 0%, #222 100%)',
            }}
          >
            <div className="banner-preview-overlay">
              <div className="banner-preview-title">Find the Right Job. Build Your Future.</div>
              <div className="banner-preview-subtitle">
                Preview of how the hero background banner appears on JobNest main page.
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveBanner} className="mt-4">
            <h4 className="mb-3">Upload New Banner Image</h4>

            {/* Dropzone File Upload */}
            <label className="upload-dropzone w-100">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="d-none"
              />
              <MdCloudUpload className="dropzone-icon" />
              <div className="dropzone-text">
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Click or Drag image here to upload'}
              </div>
              <div className="dropzone-hint">
                Recommended resolution: 1920x800px (JPG, PNG, WebP format, Max 10MB)
              </div>
            </label>

            <div className="banner-or-divider">OR</div>

            {/* Direct Image URL */}
            <div className="form-group mb-4">
              <label htmlFor="banner-url-input">Image URL</label>
              <input
                id="banner-url-input"
                type="text"
                className="form-control"
                placeholder="https://example.com/images/hero-banner.png"
                value={customUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end gap-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSelectedFile(null);
                  setCustomUrl('');
                  setPreviewUrl(currentBanner);
                }}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || (!selectedFile && !customUrl)}
              >
                <MdSave className="icon-mr-sm" />
                {saving ? 'Saving Banner...' : 'Save Banner Image'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

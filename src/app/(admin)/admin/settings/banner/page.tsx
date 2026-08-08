'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MdCloudUpload,
  MdImage,
  MdSave,
  MdRefresh,
  MdCheckCircle,
  MdOutlineVisibilityOff,
  MdDelete,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdDoneAll,
  MdOutlineBlock,
  MdLocalOffer,
} from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './Banner.css';

export interface BannerItem {
  id: string;
  url: string;
  title: string;
  isActive: boolean;
  createdAt: string;
}

export default function BannerManagementPage() {
  const contentRef = useRef<HTMLDivElement>(null);

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [stagedPreviews, setStagedPreviews] = useState<string[]>([]);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [isActiveInitial, setIsActiveInitial] = useState<boolean>(true);

  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeBanners = banners.filter((b) => b.isActive);
  const inactiveBanners = banners.filter((b) => !b.isActive);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/banner');
      if (res.success && Array.isArray(res.banners)) {
        setBanners(res.banners);
      }
    } catch (err: any) {
      console.error('Failed to fetch banner config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!loading && contentRef.current) {
      fadeInUp(contentRef.current);
    }
  }, [loading]);

  // Update object URLs for staged file previews
  useEffect(() => {
    const urls = stagedFiles.map((file) => URL.createObjectURL(file));
    setStagedPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [stagedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setStagedFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveBanners = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (stagedFiles.length > 0) {
        const formData = new FormData();
        stagedFiles.forEach((file) => {
          formData.append('banners', file);
        });
        formData.append('isActive', isActiveInitial ? 'true' : 'false');

        const token =
          localStorage.getItem('auth_token') ||
          document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1];

        const res = await fetch('/api/admin/banner', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to upload banners');

        setBanners(data.banners);
        setStagedFiles([]);
        setCustomUrl('');
        setMessage({
          type: 'success',
          text: data.message || `Successfully uploaded ${stagedFiles.length} banner(s)!`,
        });
      } else if (customUrl.trim()) {
        const res = await api.post('/admin/banner', {
          bannerUrl: customUrl,
          isActive: isActiveInitial,
        });

        if (!res.success) throw new Error(res.message || 'Failed to add banner URL');

        setBanners(res.banners);
        setCustomUrl('');
        setMessage({ type: 'success', text: res.message || 'New banner URL added successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Please select image files or enter image URLs to upload.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update hero banners.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await api.patch('/admin/banner', { id, isActive: !currentActive });
      if (res.success && Array.isArray(res.banners)) {
        setBanners(res.banners);
        setMessage({
          type: 'success',
          text: `Banner marked as ${!currentActive ? 'Active' : 'Inactive'}.`,
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to toggle banner status.' });
    }
  };

  const handleBulkAction = async (action: 'activateAll' | 'deactivateAll') => {
    try {
      const res = await api.patch('/admin/banner', { action });
      if (res.success && Array.isArray(res.banners)) {
        setBanners(res.banners);
        setMessage({
          type: 'success',
          text: action === 'activateAll' ? 'All banners set to Active!' : 'All banners set to Inactive!',
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed bulk update.' });
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner image?')) return;

    try {
      const res = await api.delete(`/admin/banner?id=${id}`);
      if (res.success && Array.isArray(res.banners)) {
        setBanners(res.banners);
        setMessage({ type: 'success', text: 'Banner image deleted.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete banner.' });
    }
  };

  const displayedBanners = banners.filter((b) => {
    if (filter === 'active') return b.isActive;
    if (filter === 'inactive') return !b.isActive;
    return true;
  });

  const currentPreviewBanner =
    activeBanners.length > 0
      ? activeBanners[previewIndex % activeBanners.length]?.url
      : banners[0]?.url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1920';

  return (
    <div className="banner-management-page">
      <PageHeader
        title="Hero Banner Management"
        subtitle="Upload multiple banner images, set Active tags, and manage active homepage backgrounds."
        breadcrumbs={[
          { label: 'Home', path: '/admin' },
          { label: 'System' },
          { label: 'Banner Management' },
        ]}
      />

      <div className="admin-card" ref={contentRef}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="m-0 d-flex align-items-center gap-2">
            <MdImage className="text-warning" /> Multi-Banner Upload & Active Tag Settings
          </h3>
          <button className="btn btn-outline-secondary btn-sm" onClick={fetchBanners}>
            <MdRefresh /> Refresh
          </button>
        </div>

        <div className="banner-card-body">
          {message && (
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
              {message.text}
              <button type="button" className="btn-close" onClick={() => setMessage(null)} />
            </div>
          )}

          {/* Live Preview Box */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4 className="m-0 text-white font-weight-bold">Active Banner Live Preview</h4>
            {activeBanners.length > 0 && (
              <span className="badge bg-gold text-dark font-weight-bold">
                🏷️ {activeBanners.length} Active Banner{activeBanners.length > 1 ? 's' : ''} Online
              </span>
            )}
          </div>

          <div
            className="banner-preview-box"
            style={{
              backgroundImage: `url(${currentPreviewBanner})`,
            }}
          >
            <div className="banner-preview-overlay">
              <div>
                <div className="banner-preview-title">Find the Right Job. Build Your Future.</div>
                <div className="banner-preview-subtitle">
                  Live background view on JobNest homepage.
                </div>
              </div>
              {activeBanners.length > 1 && (
                <div className="banner-preview-controls">
                  <button
                    type="button"
                    className="btn btn-sm btn-dark me-1"
                    onClick={() =>
                      setPreviewIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
                    }
                  >
                    <MdChevronLeft />
                  </button>
                  <span className="banner-preview-counter">
                    {previewIndex % activeBanners.length + 1} / {activeBanners.length}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-dark ms-1"
                    onClick={() => setPreviewIndex((prev) => (prev + 1) % activeBanners.length)}
                  >
                    <MdChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upload Multiple Banners Form */}
          <form onSubmit={handleSaveBanners} className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="m-0 text-white">Upload New Banner Images</h4>
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="active-tag-checkbox"
                  checked={isActiveInitial}
                  onChange={(e) => setIsActiveInitial(e.target.checked)}
                />
                <label className="form-check-label text-gold font-weight-bold" htmlFor="active-tag-checkbox">
                  🏷️ Tag as Active immediately
                </label>
              </div>
            </div>

            {/* Dropzone File Input */}
            <label className="upload-dropzone w-100">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="d-none"
              />
              <MdCloudUpload className="dropzone-icon" />
              <div className="dropzone-text">
                Click or Drag & Drop Multiple Images Here
              </div>
              <div className="dropzone-hint">
                Select 1 or more images (JPG, PNG, WebP format up to 10MB each). Recommended resolution: 1920x800px.
              </div>
            </label>

            {/* Staged File Previews */}
            {stagedFiles.length > 0 && (
              <div className="staged-files-container">
                <div className="staged-files-header">
                  <span className="text-white font-weight-bold">
                    Files Ready to Upload ({stagedFiles.length})
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => setStagedFiles([])}
                  >
                    Clear All
                  </button>
                </div>
                <div className="staged-files-grid">
                  {stagedFiles.map((file, idx) => (
                    <div key={idx} className="staged-file-card">
                      <img src={stagedPreviews[idx]} alt={file.name} className="staged-file-thumb" />
                      <button
                        type="button"
                        className="staged-file-remove"
                        onClick={() => removeStagedFile(idx)}
                        title="Remove file"
                      >
                        <MdClose />
                      </button>
                      <div className="staged-file-name">{file.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="banner-or-divider">OR ADD IMAGE URL(S)</div>

            {/* Image URLs Input */}
            <div className="form-group mb-4">
              <label htmlFor="banner-url-input" className="text-white font-weight-bold mb-2">
                Image URL(s)
              </label>
              <textarea
                id="banner-url-input"
                className="form-control bg-dark text-white border-secondary"
                rows={2}
                placeholder="Enter single or multiple image URLs (separated by newline or comma)..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end gap-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setStagedFiles([]);
                  setCustomUrl('');
                }}
                disabled={stagedFiles.length === 0 && !customUrl}
              >
                Reset Selection
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || (stagedFiles.length === 0 && !customUrl.trim())}
              >
                <MdSave className="icon-mr-sm" />
                {saving ? 'Uploading Banners...' : `Upload & Save ${stagedFiles.length > 1 ? stagedFiles.length + ' Banners' : 'Banner'}`}
              </button>
            </div>
          </form>

          {/* Banner Gallery & Tag Management Section */}
          <div className="banner-gallery-section pt-3">
            <div className="banner-toolbar">
              <div className="banner-filter-pills">
                <button
                  type="button"
                  className={`filter-pill-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Banners <span className="filter-count-badge">{banners.length}</span>
                </button>
                <button
                  type="button"
                  className={`filter-pill-btn ${filter === 'active' ? 'active' : ''}`}
                  onClick={() => setFilter('active')}
                >
                  Active <span className="filter-count-badge">{activeBanners.length}</span>
                </button>
                <button
                  type="button"
                  className={`filter-pill-btn ${filter === 'inactive' ? 'active' : ''}`}
                  onClick={() => setFilter('inactive')}
                >
                  Inactive <span className="filter-count-badge">{inactiveBanners.length}</span>
                </button>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                  onClick={() => handleBulkAction('activateAll')}
                  disabled={banners.length === 0}
                >
                  <MdDoneAll /> Activate All
                </button>
                <button
                  type="button"
                  className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1"
                  onClick={() => handleBulkAction('deactivateAll')}
                  disabled={banners.length === 0}
                >
                  <MdOutlineBlock /> Deactivate All
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5 text-gold">Loading banner gallery...</div>
            ) : displayedBanners.length === 0 ? (
              <div className="empty-banners-box">
                <MdImage style={{ fontSize: '3rem', marginBottom: '0.5rem', opacity: 0.4 }} />
                <h5>No Banners Found</h5>
                <p className="m-0">
                  {filter === 'active'
                    ? 'No banners currently marked with Active tag.'
                    : filter === 'inactive'
                    ? 'No inactive banners found.'
                    : 'Upload banner images above to get started.'}
                </p>
              </div>
            ) : (
              <div className="banner-grid">
                {displayedBanners.map((banner) => (
                  <div
                    key={banner.id}
                    className={`banner-item-card ${banner.isActive ? 'is-active-banner' : ''}`}
                  >
                    <div className="banner-card-image-wrap">
                      <img src={banner.url} alt={banner.title} className="banner-card-img" />

                      {/* 🏷️ Active Tag Badge */}
                      <span className={`active-tag-badge ${banner.isActive ? 'active' : 'inactive'}`}>
                        {banner.isActive ? (
                          <>
                            <MdCheckCircle /> ACTIVE
                          </>
                        ) : (
                          <>
                            <MdOutlineVisibilityOff /> INACTIVE
                          </>
                        )}
                      </span>
                    </div>

                    <div className="banner-card-info">
                      <div>
                        <div className="banner-card-title">{banner.title}</div>
                        <div className="banner-card-url" title={banner.url}>
                          {banner.url}
                        </div>
                      </div>

                      <div className="banner-card-actions">
                        <button
                          type="button"
                          className={`btn-toggle-active ${banner.isActive ? 'make-inactive' : 'make-active'}`}
                          onClick={() => handleToggleActive(banner.id, banner.isActive)}
                        >
                          {banner.isActive ? (
                            <>
                              <MdOutlineVisibilityOff /> Set Inactive
                            </>
                          ) : (
                            <>
                              <MdLocalOffer /> Set Active
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn-delete-banner"
                          onClick={() => handleDeleteBanner(banner.id)}
                          title="Delete banner"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MdImage, MdDelete, MdBlock, MdSearch, MdZoomIn, MdClose, MdRefresh, MdPerson, MdCheckCircle
} from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './ProfileImages.css';

interface ProfileImageItem {
  userId: string;
  email: string;
  role: string;
  roleId: number;
  profileName: string;
  imageUrl: string;
  imageType: 'avatar' | 'logo';
  isActive: boolean;
  createdAt: string;
}

const ROLE_TABS = [
  { label: 'All Images', roleId: null },
  { label: 'Job Seekers', roleId: 1 },
  { label: 'Employers', roleId: 2 },
  { label: 'Business Promoters', roleId: 3 },
];

export default function ProfileImagesModerationPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [images, setImages] = useState<ProfileImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<ProfileImageItem | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/profile-images');
      if (res.success) {
        setImages(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (!loading && contentRef.current) {
      fadeInUp(contentRef.current);
    }
  }, [loading]);

  const handleRemoveImage = async (item: ProfileImageItem, suspend = false) => {
    const actionDesc = suspend ? 'remove image AND suspend account' : 'remove profile image';
    if (!window.confirm(`Are you sure you want to ${actionDesc} for user ${item.email}?`)) {
      return;
    }

    try {
      setProcessingId(item.userId);
      const url = `/admin/users/${item.userId}/profile-image${suspend ? '?suspend=true' : ''}`;
      const res = await api.delete(url);

      if (res.success) {
        if (selectedImage?.userId === item.userId) {
          setSelectedImage(null);
        }
        fetchImages();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete moderation action');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleSuspend = async (item: ProfileImageItem) => {
    const action = item.isActive ? 'suspend' : 'unsuspend';
    if (!window.confirm(`Are you sure you want to ${action} account for ${item.email}?`)) return;

    try {
      setProcessingId(item.userId);
      const res = await api.patch(`/admin/users/${item.userId}/suspend`, { isActive: !item.isActive });
      if (res.success) {
        fetchImages();
      }
    } catch (err: any) {
      alert(err.message || `Failed to ${action} user`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredImages = images.filter((item) => {
    const matchesRole = activeTab === null || item.roleId === activeTab;
    const matchesSearch =
      !searchTerm ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.profileName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="profile-images-page">
      <PageHeader
        title="Profile Image & Avatar Moderation"
        subtitle="Review, inspect, and moderate profile pictures and company logos uploaded by users."
        breadcrumbs={[
          { label: 'Home', path: '/admin' },
          { label: 'Moderation' },
          { label: 'Profile Images' },
        ]}
      />

      <div className="role-filter-tabs">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.label}
            className={`role-tab ${activeTab === tab.roleId ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.roleId)}
          >
            {tab.label}
            <span className="tab-count">
              {tab.roleId === null
                ? images.length
                : images.filter((img) => img.roleId === tab.roleId).length}
            </span>
          </button>
        ))}
      </div>

      <div className="search-bar d-flex justify-content-between align-items-center">
        <div className="position-relative flex-grow-1 mr-3">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by user email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input w-100"
          />
        </div>
        <button className="btn btn-outline-secondary" onClick={fetchImages}>
          <MdRefresh /> Refresh
        </button>
      </div>

      <div className="admin-card" ref={contentRef}>
        <div className="card-header">
          <h3>
            <MdImage className="icon-mr" /> Uploaded Profile Media ({filteredImages.length})
          </h3>
        </div>

        {error && <div className="alert alert-danger m-3">{error}</div>}

        {loading ? (
          <div className="text-center py-5 text-muted">Loading profile images for moderation...</div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-5 text-muted">No profile images found.</div>
        ) : (
          <div className="image-gallery-grid p-3">
            {filteredImages.map((item, idx) => (
              <div key={`${item.userId}-${item.roleId}-${item.imageType}-${idx}`} className="image-moderation-card">
                <div
                  className="card-image-wrapper"
                  onClick={() => setSelectedImage(item)}
                  title="Click to view enlarged image"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.profileName}
                    className="card-image-preview"
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/200?text=Invalid+Image';
                    }}
                  />
                  <div className="image-zoom-overlay">
                    <MdZoomIn />
                  </div>
                  <span className="role-badge-top">{item.role}</span>
                </div>

                <div className="card-info-content">
                  <div className="profile-card-name">{item.profileName}</div>
                  <div className="profile-card-email">{item.email}</div>

                  <div className="card-meta-row">
                    <span className={`status-badge ${item.isActive ? 'active' : 'suspended'}`}>
                      {item.isActive ? <MdCheckCircle /> : <MdBlock />}
                      {item.isActive ? 'Active' : 'Suspended'}
                    </span>
                    <span className="text-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="card-actions-row">
                  <button
                    className="btn btn-sm btn-outline-danger w-50"
                    onClick={() => handleRemoveImage(item, false)}
                    disabled={processingId === item.userId}
                    title="Remove image from user profile"
                  >
                    <MdDelete /> Delete
                  </button>
                  <button
                    className={`btn btn-sm w-50 ${
                      item.isActive ? 'btn-danger' : 'btn-outline-success'
                    }`}
                    onClick={() =>
                      item.isActive
                        ? handleRemoveImage(item, true)
                        : handleToggleSuspend(item)
                    }
                    disabled={processingId === item.userId}
                    title={item.isActive ? 'Delete Image & Suspend User' : 'Unsuspend Account'}
                  >
                    <MdBlock /> {item.isActive ? 'Suspend' : 'Unsuspend'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div>
                <h4 className="mb-0">{selectedImage.profileName}</h4>
                <small className="text-muted">{selectedImage.email} ({selectedImage.role})</small>
              </div>
              <button className="close-btn" onClick={() => setSelectedImage(null)}>
                <MdClose />
              </button>
            </div>

            <div className="lightbox-body">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.profileName}
                className="lightbox-full-img"
              />
            </div>

            <div className="lightbox-footer">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => router.push(`/admin/users/${selectedImage.userId}`)}
              >
                <MdPerson className="icon-mr-sm" /> View User Profile
              </button>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleRemoveImage(selectedImage, false)}
                  disabled={processingId === selectedImage.userId}
                >
                  <MdDelete /> Remove Image
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveImage(selectedImage, true)}
                  disabled={processingId === selectedImage.userId}
                >
                  <MdBlock /> Remove & Suspend User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  initialData: any;
}

export default function BusinessPromoterProfileForm({ initialData }: Props) {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    businessName: initialData?.businessName || '',
    businessCategory: initialData?.businessCategory || '',
    about: initialData?.about || '',
    contactPhone: initialData?.contactPhone || '',
    contactEmail: initialData?.contactEmail || '',
    address: initialData?.address || '',
    websiteUrl: initialData?.websiteUrl || '',
    linkedinUrl: initialData?.linkedinUrl || '',
    instagramUrl: initialData?.instagramUrl || '',
    facebookUrl: initialData?.facebookUrl || '',
    gstNumber: initialData?.gstNumber || '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProfile) return;
    
    setLoading(true);
    setMessage({ text: '', type: '' });

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) data.append(key, value.toString());
    });

    if (logoFile) {
      data.append('logo', logoFile);
    }

    try {
      await updateProfile(data);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="profile-form-card" onSubmit={handleSubmit}>
      
      <h3 className="profile-section-title">Business Information</h3>
      <div className="row">
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Business Name</label>
          <input type="text" name="businessName" className="profile-input" value={formData.businessName} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Business Category</label>
          <input type="text" name="businessCategory" className="profile-input" value={formData.businessCategory} onChange={handleInputChange} />
        </div>
        <div className="col-md-12 profile-form-group">
          <label className="profile-label">About Business</label>
          <textarea name="about" className="profile-textarea" value={formData.about} onChange={handleInputChange}></textarea>
        </div>
      </div>

      <h3 className="profile-section-title mt-4">Business Logo</h3>
      <div className="profile-form-group">
        <div className="profile-file-upload">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <i className="bi bi-image" style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
          {logoFile ? (
            <div className="mt-2 text-white">{logoFile.name}</div>
          ) : (
            <div className="mt-2 text-white">
              {initialData?.logoUrl ? 'Upload a new logo to replace existing one' : 'Click or drag image to upload'}
            </div>
          )}
        </div>
        {initialData?.logoUrl && !logoFile && (
          <div className="mt-2 d-flex align-items-center text-success" style={{ fontSize: '0.85rem' }}>
            <img src={initialData.logoUrl} alt="Logo" style={{ height: '30px', marginRight: '10px', borderRadius: '4px' }} />
            <i className="bi bi-check-circle me-1"></i> Current logo uploaded
          </div>
        )}
      </div>

      <h3 className="profile-section-title mt-4">Contact Details</h3>
      <div className="row">
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Contact Phone</label>
          <input type="tel" name="contactPhone" className="profile-input" value={formData.contactPhone} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Contact Email</label>
          <input type="email" name="contactEmail" className="profile-input" value={formData.contactEmail} onChange={handleInputChange} />
        </div>
        <div className="col-md-12 profile-form-group">
          <label className="profile-label">Address / Location</label>
          <input type="text" name="address" className="profile-input" value={formData.address} onChange={handleInputChange} />
        </div>
        <div className="col-md-12 profile-form-group">
          <label className="profile-label">GST Number (Optional)</label>
          <input type="text" name="gstNumber" className="profile-input" value={formData.gstNumber} onChange={handleInputChange} />
        </div>
      </div>

      <h3 className="profile-section-title mt-4">Links & Socials</h3>
      <div className="row">
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Website URL</label>
          <input type="url" name="websiteUrl" className="profile-input" value={formData.websiteUrl} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">LinkedIn URL</label>
          <input type="url" name="linkedinUrl" className="profile-input" value={formData.linkedinUrl} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Instagram URL</label>
          <input type="url" name="instagramUrl" className="profile-input" value={formData.instagramUrl} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Facebook URL</label>
          <input type="url" name="facebookUrl" className="profile-input" value={formData.facebookUrl} onChange={handleInputChange} />
        </div>
      </div>

      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-actions">
        <button type="submit" className="btn-profile-save" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </div>
    </form>
  );
}

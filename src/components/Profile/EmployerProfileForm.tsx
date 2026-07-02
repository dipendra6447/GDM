"use client";
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  initialData: any;
}

export default function EmployerProfileForm({ initialData }: Props) {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    industry: initialData?.industry || '',
    companySize: initialData?.companySize || '',
    foundedYear: initialData?.foundedYear || '',
    headquarters: initialData?.headquarters || '',
    about: initialData?.about || '',
    websiteUrl: initialData?.websiteUrl || '',
    linkedinUrl: initialData?.linkedinUrl || '',
    twitterUrl: initialData?.twitterUrl || '',
    hrName: initialData?.hrName || '',
    hrEmail: initialData?.hrEmail || '',
    hrPhone: initialData?.hrPhone || '',
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
      
      <h3 className="profile-section-title">Company Information</h3>
      <div className="row">
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Company Name</label>
          <input type="text" name="companyName" className="profile-input" value={formData.companyName} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Industry</label>
          <input type="text" name="industry" className="profile-input" value={formData.industry} onChange={handleInputChange} />
        </div>
        <div className="col-md-4 profile-form-group">
          <label className="profile-label">Company Size</label>
          <select name="companySize" className="profile-select" value={formData.companySize} onChange={handleInputChange}>
            <option value="">Select size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>
        <div className="col-md-4 profile-form-group">
          <label className="profile-label">Founded Year</label>
          <input type="number" name="foundedYear" className="profile-input" min="1800" max="2100" value={formData.foundedYear} onChange={handleInputChange} />
        </div>
        <div className="col-md-4 profile-form-group">
          <label className="profile-label">Headquarters</label>
          <input type="text" name="headquarters" className="profile-input" value={formData.headquarters} onChange={handleInputChange} />
        </div>
      </div>

      <div className="profile-form-group">
        <label className="profile-label">About Company</label>
        <textarea name="about" className="profile-textarea" value={formData.about} onChange={handleInputChange}></textarea>
      </div>

      <h3 className="profile-section-title mt-4">Company Logo</h3>
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

      <h3 className="profile-section-title mt-4">Links & Socials</h3>
      <div className="row">
        <div className="col-md-4 profile-form-group">
          <label className="profile-label">Website URL</label>
          <input type="url" name="websiteUrl" className="profile-input" value={formData.websiteUrl} onChange={handleInputChange} />
        </div>
        <div className="col-md-4 profile-form-group">
          <label className="profile-label">LinkedIn URL</label>
          <input type="url" name="linkedinUrl" className="profile-input" value={formData.linkedinUrl} onChange={handleInputChange} />
        </div>
        <div className="col-md-4 profile-form-group">
          <label className="profile-label">Twitter/X URL</label>
          <input type="url" name="twitterUrl" className="profile-input" value={formData.twitterUrl} onChange={handleInputChange} />
        </div>
      </div>

      <h3 className="profile-section-title mt-4">HR Contact Info</h3>
      <div className="row">
        <div className="col-md-4 profile-form-group">
          <label className="profile-label">HR Name</label>
          <input type="text" name="hrName" className="profile-input" value={formData.hrName} onChange={handleInputChange} />
        </div>
        <div className="col-md-4 profile-form-group">
          <label className="profile-label">HR Email</label>
          <input type="email" name="hrEmail" className="profile-input" value={formData.hrEmail} onChange={handleInputChange} />
        </div>
        <div className="col-md-4 profile-form-group">
          <label className="profile-label">HR Phone</label>
          <input type="tel" name="hrPhone" className="profile-input" value={formData.hrPhone} onChange={handleInputChange} />
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

"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../../hooks/useAuth';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface Props {
  initialData: any;
  roleId?: number; // explicit role override for multi-role users
}

export default function EmployerProfileForm({ initialData, roleId = 2 }: Props) {
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
    benefits: initialData?.benefits || '',
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
    if (e.target.files && e.target.files.length > 0) setLogoFile(e.target.files[0]);
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
    if (logoFile) data.append('logo', logoFile);
    try {
      await updateProfile(data, roleId);
      setMessage({ text: 'Employer profile updated!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Company Info */}
      <div id="company-info">
        <div className="row">
          <div className="col-md-6 profile-form-group">
            <label className="profile-label">Company Name</label>
            <input type="text" name="companyName" className="profile-input" placeholder="Acme Corp" value={formData.companyName} onChange={handleInputChange} />
          </div>
          <div className="col-md-6 profile-form-group">
            <label className="profile-label">Industry</label>
            <input type="text" name="industry" className="profile-input" placeholder="Technology" value={formData.industry} onChange={handleInputChange} />
          </div>
          <div className="col-md-4 profile-form-group">
            <label className="profile-label">Company Size</label>
            <select name="companySize" className="profile-select" value={formData.companySize} onChange={handleInputChange}>
              <option value="">Select size</option>
              <option value="1-10">1–10 employees</option>
              <option value="11-50">11–50 employees</option>
              <option value="51-200">51–200 employees</option>
              <option value="201-500">201–500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>
          <div className="col-md-4 profile-form-group">
            <label className="profile-label">Founded Year</label>
            <input type="number" name="foundedYear" className="profile-input" min="1800" max="2100" placeholder="2010" value={formData.foundedYear} onChange={handleInputChange} />
          </div>
          <div className="col-md-4 profile-form-group">
            <label className="profile-label">Headquarters</label>
            <input type="text" name="headquarters" className="profile-input" placeholder="Mumbai, India" value={formData.headquarters} onChange={handleInputChange} />
          </div>
          <div className="col-md-12 profile-form-group">
            <label className="profile-label">About Company</label>
            <div className="profile-quill-wrapper">
              <ReactQuill 
                theme="snow"
                value={formData.about} 
                onChange={(val) => setFormData(prev => ({ ...prev, about: val }))}
                placeholder="Tell candidates what makes your company great…"
              />
            </div>
          </div>
          <div className="col-md-12 profile-form-group">
            <label className="profile-label">Benefits &amp; Perks</label>
            <div className="profile-quill-wrapper">
              <ReactQuill 
                theme="snow"
                value={formData.benefits} 
                onChange={(val) => setFormData(prev => ({ ...prev, benefits: val }))}
                placeholder="List company-wide benefits &amp; perks like healthcare, learning budgets, flexible hours..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* HR Contact */}
      <div id="hr-contact">
        <div className="profile-section-divider">
          <span className="profile-section-divider-label">HR Contact</span>
          <div className="profile-section-divider-line" />
        </div>
        <div className="row">
          <div className="col-md-4 profile-form-group">
            <label className="profile-label">HR Name</label>
            <input type="text" name="hrName" className="profile-input" placeholder="Priya Sharma" value={formData.hrName} onChange={handleInputChange} />
          </div>
          <div className="col-md-4 profile-form-group">
            <label className="profile-label">HR Email</label>
            <input type="email" name="hrEmail" className="profile-input" placeholder="hr@company.com" value={formData.hrEmail} onChange={handleInputChange} />
          </div>
          <div className="col-md-4 profile-form-group">
            <label className="profile-label">HR Phone</label>
            <input type="tel" name="hrPhone" className="profile-input" placeholder="+91 98765 43210" value={formData.hrPhone} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div id="company-links">
        <div className="profile-section-divider">
          <span className="profile-section-divider-label">Social &amp; Links</span>
          <div className="profile-section-divider-line" />
        </div>
        <div className="row">
          <div className="col-md-4 profile-form-group">
            <label className="profile-label"><i className="bi bi-globe2 me-1" style={{ color: '#60a5fa' }} />Website</label>
            <input type="url" name="websiteUrl" className="profile-input" placeholder="https://company.com" value={formData.websiteUrl} onChange={handleInputChange} />
          </div>
          <div className="col-md-4 profile-form-group">
            <label className="profile-label"><i className="bi bi-linkedin me-1" style={{ color: '#0077b5' }} />LinkedIn</label>
            <input type="url" name="linkedinUrl" className="profile-input" placeholder="https://linkedin.com/company/..." value={formData.linkedinUrl} onChange={handleInputChange} />
          </div>
          <div className="col-md-4 profile-form-group">
            <label className="profile-label"><i className="bi bi-twitter-x me-1" style={{ color: '#94a3b8' }} />Twitter / X</label>
            <input type="url" name="twitterUrl" className="profile-input" placeholder="https://twitter.com/..." value={formData.twitterUrl} onChange={handleInputChange} />
          </div>
        </div>

        {/* Logo */}
        <div className="profile-form-group mt-2">
          <label className="profile-label">Company Logo</label>
          <div className="profile-file-upload">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <i className="bi bi-image" style={{ fontSize: '1.8rem', color: '#334155' }}></i>
            {logoFile ? (
              <div className="mt-2" style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600 }}>{logoFile.name}</div>
            ) : (
              <div className="mt-2" style={{ color: '#475569', fontSize: '0.85rem' }}>
                {initialData?.logoUrl ? 'Drop a new image to replace current logo' : 'Click or drag your logo here'}
              </div>
            )}
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`profile-message ${message.type}`}>
          <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`} />
          {message.text}
        </div>
      )}

      <div className="profile-actions">
        <button type="submit" className="btn-profile-save" disabled={loading}>
          {loading ? <><span className="spinner-border spinner-border-sm me-2" /> Saving…</> : <><i className="bi bi-floppy me-2" /> Save Changes</>}
        </button>
      </div>
    </form>
  );
}

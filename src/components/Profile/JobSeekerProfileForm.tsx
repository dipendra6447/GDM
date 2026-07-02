"use client";
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  initialData: any;
}

export default function JobSeekerProfileForm({ initialData }: Props) {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || '',
    location: initialData?.location || '',
    totalExperienceYears: initialData?.totalExperienceYears || '',
    expectedSalary: initialData?.expectedSalary || '',
    availability: initialData?.availability || '',
    summary: initialData?.summary || '',
    skills: initialData?.skills || '',
    linkedinUrl: initialData?.linkedinUrl || '',
    githubUrl: initialData?.githubUrl || '',
    portfolioUrl: initialData?.portfolioUrl || '',
  });

  const [experience, setExperience] = useState<any[]>(initialData?.experience || []);
  const [education, setEducation] = useState<any[]>(initialData?.education || []);

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleAddExperience = () => {
    setExperience([...experience, { jobTitle: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' }]);
  };

  const handleRemoveExperience = (index: number) => {
    const newExp = [...experience];
    newExp.splice(index, 1);
    setExperience(newExp);
  };

  const handleExperienceChange = (index: number, field: string, value: any) => {
    const newExp = [...experience];
    newExp[index][field] = value;
    setExperience(newExp);
  };

  const handleAddEducation = () => {
    setEducation([...education, { degree: '', fieldOfStudy: '', institution: '', graduationYear: '' }]);
  };

  const handleRemoveEducation = (index: number) => {
    const newEdu = [...education];
    newEdu.splice(index, 1);
    setEducation(newEdu);
  };

  const handleEducationChange = (index: number, field: string, value: any) => {
    const newEdu = [...education];
    newEdu[index][field] = value;
    setEducation(newEdu);
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

    data.append('experience', JSON.stringify(experience));
    data.append('education', JSON.stringify(education));

    if (resumeFile) {
      data.append('resume', resumeFile);
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
      
      <h3 className="profile-section-title">Personal Information</h3>
      <div className="row">
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Full Name</label>
          <input type="text" name="fullName" className="profile-input" value={formData.fullName} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Phone Number</label>
          <input type="tel" name="phone" className="profile-input" value={formData.phone} onChange={handleInputChange} />
        </div>
        <div className="col-md-12 profile-form-group">
          <label className="profile-label">Location</label>
          <input type="text" name="location" className="profile-input" value={formData.location} onChange={handleInputChange} />
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4 mb-3 border-bottom pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <h3 className="profile-section-title border-0 mb-0 pb-0">Work Experience</h3>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddExperience}>
          <i className="bi bi-plus"></i> Add Experience
        </button>
      </div>
      
      {experience.map((exp, idx) => (
        <div key={idx} className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="d-flex justify-content-between mb-3">
            <h5 className="text-white mb-0">Experience {idx + 1}</h5>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveExperience(idx)}>
              <i className="bi bi-trash"></i>
            </button>
          </div>
          <div className="row">
            <div className="col-md-6 profile-form-group">
              <label className="profile-label">Job Title</label>
              <input type="text" className="profile-input" value={exp.jobTitle} onChange={(e) => handleExperienceChange(idx, 'jobTitle', e.target.value)} />
            </div>
            <div className="col-md-6 profile-form-group">
              <label className="profile-label">Company</label>
              <input type="text" className="profile-input" value={exp.company} onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)} />
            </div>
            <div className="col-md-4 profile-form-group">
              <label className="profile-label">Start Date</label>
              <input type="date" className="profile-input" value={exp.startDate} onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)} />
            </div>
            <div className="col-md-4 profile-form-group">
              <label className="profile-label">End Date</label>
              <input type="date" className="profile-input" value={exp.endDate} disabled={exp.isCurrent} onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)} />
            </div>
            <div className="col-md-4 profile-form-group d-flex align-items-center">
              <div className="form-check mt-4">
                <input type="checkbox" className="form-check-input" checked={exp.isCurrent} onChange={(e) => handleExperienceChange(idx, 'isCurrent', e.target.checked)} />
                <label className="form-check-label text-white ms-2">I currently work here</label>
              </div>
            </div>
            <div className="col-md-12 profile-form-group mb-0">
              <label className="profile-label">Description</label>
              <textarea className="profile-textarea" style={{ minHeight: '80px' }} value={exp.description} onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}></textarea>
            </div>
          </div>
        </div>
      ))}

      {experience.length === 0 && (
        <div className="text-center p-4 mb-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          <p className="text-muted mb-0">No experience added yet.</p>
        </div>
      )}

      <h3 className="profile-section-title mt-4">Professional Details</h3>
      <div className="row">
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Total Experience (Years)</label>
          <input type="number" name="totalExperienceYears" className="profile-input" min="0" value={formData.totalExperienceYears} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Expected Salary (LPA)</label>
          <input type="text" name="expectedSalary" className="profile-input" value={formData.expectedSalary} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Availability</label>
          <select name="availability" className="profile-select" value={formData.availability} onChange={handleInputChange}>
            <option value="">Select availability</option>
            <option value="immediate">Immediate</option>
            <option value="15_days">15 Days</option>
            <option value="1_month">1 Month</option>
            <option value="2_months">2 Months</option>
          </select>
        </div>
        <div className="col-md-6 profile-form-group">
          <label className="profile-label">Skills (Comma separated)</label>
          <input type="text" name="skills" className="profile-input" value={formData.skills} onChange={handleInputChange} />
        </div>
      </div>

      <div className="profile-form-group">
        <label className="profile-label">Professional Summary</label>
        <textarea name="summary" className="profile-textarea" value={formData.summary} onChange={handleInputChange}></textarea>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4 mb-3 border-bottom pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <h3 className="profile-section-title border-0 mb-0 pb-0">Education History</h3>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddEducation}>
          <i className="bi bi-plus"></i> Add Education
        </button>
      </div>

      {education.map((edu, idx) => (
        <div key={idx} className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="d-flex justify-content-between mb-3">
            <h5 className="text-white mb-0">Education {idx + 1}</h5>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveEducation(idx)}>
              <i className="bi bi-trash"></i>
            </button>
          </div>
          <div className="row">
            <div className="col-md-6 profile-form-group">
              <label className="profile-label">Degree</label>
              <input type="text" className="profile-input" value={edu.degree} onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)} />
            </div>
            <div className="col-md-6 profile-form-group">
              <label className="profile-label">Field of Study</label>
              <input type="text" className="profile-input" value={edu.fieldOfStudy} onChange={(e) => handleEducationChange(idx, 'fieldOfStudy', e.target.value)} />
            </div>
            <div className="col-md-8 profile-form-group mb-0">
              <label className="profile-label">Institution</label>
              <input type="text" className="profile-input" value={edu.institution} onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)} />
            </div>
            <div className="col-md-4 profile-form-group mb-0">
              <label className="profile-label">Graduation Year</label>
              <input type="number" className="profile-input" min="1970" max="2100" value={edu.graduationYear} onChange={(e) => handleEducationChange(idx, 'graduationYear', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      {education.length === 0 && (
        <div className="text-center p-4 mb-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          <p className="text-muted mb-0">No education added yet.</p>
        </div>
      )}

      <h3 className="profile-section-title mt-4">Resume & Links</h3>
      <div className="profile-form-group">
        <label className="profile-label">Resume (PDF)</label>
        <div className="profile-file-upload">
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          <i className="bi bi-cloud-arrow-up" style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
          {resumeFile ? (
            <div className="mt-2 text-white">{resumeFile.name}</div>
          ) : (
            <div className="mt-2 text-white">
              {initialData?.resumeUrl ? 'Upload a new resume to replace existing one' : 'Click or drag file to upload'}
            </div>
          )}
        </div>
        {initialData?.resumeUrl && !resumeFile && (
          <div className="mt-2 text-success" style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-check-circle me-1"></i> Current resume uploaded
          </div>
        )}
      </div>

      <div className="row mt-3">
        <div className="col-md-4 profile-form-group">
          <label className="profile-label">LinkedIn URL</label>
          <input type="url" name="linkedinUrl" className="profile-input" value={formData.linkedinUrl} onChange={handleInputChange} />
        </div>
        <div className="col-md-4 profile-form-group">
          <label className="profile-label">GitHub URL</label>
          <input type="url" name="githubUrl" className="profile-input" value={formData.githubUrl} onChange={handleInputChange} />
        </div>
        <div className="col-md-4 profile-form-group">
          <label className="profile-label">Portfolio URL</label>
          <input type="url" name="portfolioUrl" className="profile-input" value={formData.portfolioUrl} onChange={handleInputChange} />
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

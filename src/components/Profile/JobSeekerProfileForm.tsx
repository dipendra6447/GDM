"use client";
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  initialData: any;
  roleId?: number;
}

export default function JobSeekerProfileForm({ initialData, roleId = 1 }: Props) {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errorList, setErrorList] = useState<{ field: string; message: string }[]>([]);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    firstName: initialData?.firstName || '',
    middleName: initialData?.middleName || '',
    lastName: initialData?.lastName || '',
    phone: initialData?.phone || '',
    alternatePhone: initialData?.alternatePhone || '',
    alternateEmail: initialData?.alternateEmail || '',
    address: initialData?.address || { country: '', state: '', city: '', zipCode: '', addressLine1: '' },
    totalExperienceYears: initialData?.totalExperienceYears || '',
    expectedSalary: initialData?.expectedSalary || '',
    availability: initialData?.availability || '',
    summary: initialData?.summary || '',
    skills: initialData?.skills || '',
    linkedinUrl: initialData?.linkedinUrl || '',
    githubUrl: initialData?.githubUrl || '',
    portfolioUrl: initialData?.portfolioUrl || '',
  });

  const [experience, setExperience] = useState<any[]>(
    initialData?.experience?.length > 0 ? initialData.experience : [{ jobTitle: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' }]
  );
  const [education, setEducation] = useState<any[]>(
    initialData?.education?.length > 0 ? initialData.education : [{ degree: '', fieldOfStudy: '', institution: '', graduationYear: '' }]
  );
  
  const [certifications, setCertifications] = useState<any[]>(
    initialData?.certifications?.length > 0 ? initialData.certifications : []
  );
  const [certFiles, setCertFiles] = useState<(File | null)[]>(
    initialData?.certifications?.length > 0 ? new Array(initialData.certifications.length).fill(null) : []
  );

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
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

  const handleAddCertification = () => {
    setCertifications([...certifications, { name: '', issuer: '', status: 'completed', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '' }]);
    setCertFiles([...certFiles, null]);
  };

  const handleRemoveCertification = (index: number) => {
    const newCerts = [...certifications];
    newCerts.splice(index, 1);
    setCertifications(newCerts);

    const newFiles = [...certFiles];
    newFiles.splice(index, 1);
    setCertFiles(newFiles);
  };

  const handleCertificationChange = (index: number, field: string, value: any) => {
    const newCerts = [...certifications];
    newCerts[index][field] = value;
    setCertifications(newCerts);
  };

  const handleCertFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = [...certFiles];
      newFiles[index] = e.target.files[0];
      setCertFiles(newFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProfile) return;
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    setErrorList([]);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'address') {
        data.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        data.append(key, value.toString());
      }
    });

    data.append('experience', JSON.stringify(experience));
    data.append('education', JSON.stringify(education));
    data.append('certifications', JSON.stringify(certifications));

    certFiles.forEach((file, index) => {
      if (file) {
        data.append(`cert_file_${index}`, file);
      }
    });

    if (resumeFile) {
      data.append('resume', resumeFile);
    }

    try {
      await updateProfile(data, roleId);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update profile', type: 'error' });
      if (err.errors && Array.isArray(err.errors)) {
        setErrorList(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Personal Info */}
      <div id="personal">
        <div className="row">
          <div className="col-md-3 profile-form-group">
            <label className="profile-label">Title</label>
            <select name="title" className="profile-input" value={formData.title} onChange={handleInputChange}>
              <option value="">Select</option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
              <option value="Dr.">Dr.</option>
            </select>
          </div>
          <div className="col-md-3 profile-form-group">
            <label className="profile-label">First Name</label>
            <input type="text" name="firstName" className="profile-input" placeholder="John" value={formData.firstName} onChange={handleInputChange} />
          </div>
          <div className="col-md-3 profile-form-group">
            <label className="profile-label">Middle Name</label>
            <input type="text" name="middleName" className="profile-input" placeholder="(Optional)" value={formData.middleName} onChange={handleInputChange} />
          </div>
          <div className="col-md-3 profile-form-group">
            <label className="profile-label">Last Name</label>
            <input type="text" name="lastName" className="profile-input" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} />
          </div>
          <div className="col-md-4 profile-form-group">
            <label className="profile-label">Phone Number</label>
            <input type="tel" name="phone" className="profile-input" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} />
          </div>
          <div className="col-md-4 profile-form-group">
            <label className="profile-label">Alternate Phone</label>
            <input type="tel" name="alternatePhone" className="profile-input" placeholder="(Optional)" value={formData.alternatePhone} onChange={handleInputChange} />
          </div>
          <div className="col-md-4 profile-form-group">
            <label className="profile-label">Alternate Email</label>
            <input type="email" name="alternateEmail" className="profile-input" placeholder="(Optional)" value={formData.alternateEmail} onChange={handleInputChange} />
          </div>
          <div className="col-md-12 profile-form-group">
            <label className="profile-label">Address Line 1</label>
            <input type="text" name="addressLine1" className="profile-input" placeholder="123 Main St" value={formData.address.addressLine1 || ''} onChange={handleAddressChange} />
          </div>
          <div className="col-md-3 profile-form-group">
            <label className="profile-label">Country</label>
            <input type="text" name="country" className="profile-input" placeholder="USA" value={formData.address.country || ''} onChange={handleAddressChange} />
          </div>
          <div className="col-md-3 profile-form-group">
            <label className="profile-label">State/Province</label>
            <input type="text" name="state" className="profile-input" placeholder="CA" value={formData.address.state || ''} onChange={handleAddressChange} />
          </div>
          <div className="col-md-3 profile-form-group">
            <label className="profile-label">City</label>
            <input type="text" name="city" className="profile-input" placeholder="San Francisco" value={formData.address.city || ''} onChange={handleAddressChange} />
          </div>
          <div className="col-md-3 profile-form-group">
            <label className="profile-label">Zip Code</label>
            <input type="text" name="zipCode" className="profile-input" placeholder="94105" value={formData.address.zipCode || ''} onChange={handleAddressChange} />
          </div>
        </div>
      </div>

      {/* Work Experience */}
      <div id="experience">
        <div className="profile-section-divider">
          <span className="profile-section-divider-label">Work Experience</span>
          <div className="profile-section-divider-line" />
          <button type="button" className="profile-section-divider-btn" onClick={handleAddExperience}>
            <i className="bi bi-plus" /> Add
          </button>
        </div>

        {experience.map((exp, idx) => (
          <div key={idx} className="profile-item-card">
            <div className="profile-item-card-header">
              <h5 className="profile-item-card-title">Experience {idx + 1}</h5>
              <button type="button" className="profile-item-remove-btn" onClick={() => handleRemoveExperience(idx)}>
                <i className="bi bi-trash" /> Remove
              </button>
            </div>
            <div className="row">
              <div className="col-md-6 profile-form-group">
                <label className="profile-label">Job Title</label>
                <input type="text" className="profile-input" value={exp.jobTitle} onChange={(e) => handleExperienceChange(idx, 'jobTitle', e.target.value)} />
              </div>
              <div className="col-md-6 profile-form-group">
                <label className="profile-label">Company Name</label>
                <input type="text" className="profile-input" value={exp.company} onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)} />
              </div>
              <div className="col-md-6 profile-form-group">
                <label className="profile-label">Company Location</label>
                <input type="text" className="profile-input" placeholder="e.g. San Francisco, CA" value={exp.companyLocation || ''} onChange={(e) => handleExperienceChange(idx, 'companyLocation', e.target.value)} />
              </div>
              <div className="col-md-6 profile-form-group">
                <label className="profile-label">Job Type</label>
                <select className="profile-input" value={exp.jobType || ''} onChange={(e) => handleExperienceChange(idx, 'jobType', e.target.value)}>
                  <option value="">Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
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
                <label className="profile-label">Job Description</label>
                <textarea className="profile-textarea" style={{ minHeight: '80px' }} value={exp.description} onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}></textarea>
              </div>
            </div>
          </div>
        ))}
      </div>



      {/* Professional Details */}
      <div className="profile-section-divider">
        <span className="profile-section-divider-label">Professional Details</span>
        <div className="profile-section-divider-line" />
      </div>
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

      {/* Academic History */}
      <div id="education">
        <div className="profile-section-divider">
          <span className="profile-section-divider-label">Academic History</span>
          <div className="profile-section-divider-line" />
          <button type="button" className="profile-section-divider-btn" onClick={handleAddEducation}>
            <i className="bi bi-plus" /> Add Academic
          </button>
        </div>

        {education.map((edu, idx) => (
          <div key={idx} className="profile-item-card">
            <div className="profile-item-card-header">
              <h5 className="profile-item-card-title">Academic {idx + 1}</h5>
              <button type="button" className="profile-item-remove-btn" onClick={() => handleRemoveEducation(idx)}>
                <i className="bi bi-trash" /> Remove
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
                <label className="profile-label">Completion Year</label>
                <input type="number" className="profile-input" min="1970" max="2100" value={edu.graduationYear} onChange={(e) => handleEducationChange(idx, 'graduationYear', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Professional Certifications */}
      <div id="certifications">
        <div className="profile-section-divider">
          <span className="profile-section-divider-label">Professional Certifications</span>
          <div className="profile-section-divider-line" />
          <button type="button" className="profile-section-divider-btn" onClick={handleAddCertification}>
            <i className="bi bi-plus" /> Add Certification
          </button>
        </div>

        {certifications.map((cert, idx) => (
          <div key={idx} className="profile-item-card">
            <div className="profile-item-card-header">
              <h5 className="profile-item-card-title">Certification {idx + 1}</h5>
              <button type="button" className="profile-item-remove-btn" onClick={() => handleRemoveCertification(idx)}>
                <i className="bi bi-trash" /> Remove
              </button>
            </div>
            <div className="row">
              <div className="col-md-6 profile-form-group">
                <label className="profile-label">Certification Name</label>
                <input type="text" className="profile-input" value={cert.name} onChange={(e) => handleCertificationChange(idx, 'name', e.target.value)} />
              </div>
              <div className="col-md-6 profile-form-group">
                <label className="profile-label">Issuing Organization</label>
                <input type="text" className="profile-input" value={cert.issuer} onChange={(e) => handleCertificationChange(idx, 'issuer', e.target.value)} />
              </div>
              <div className="col-md-4 profile-form-group">
                <label className="profile-label">Status</label>
                <select className="profile-select" value={cert.status} onChange={(e) => handleCertificationChange(idx, 'status', e.target.value)}>
                  <option value="completed">Completed</option>
                  <option value="pursuing">Pursuing</option>
                </select>
              </div>
              <div className="col-md-4 profile-form-group">
                <label className="profile-label">Issue Date</label>
                <input type="date" className="profile-input" value={cert.issueDate} onChange={(e) => handleCertificationChange(idx, 'issueDate', e.target.value)} />
              </div>
              <div className="col-md-4 profile-form-group">
                <label className="profile-label">Expiry Date (Optional)</label>
                <input type="date" className="profile-input" value={cert.expiryDate || ''} onChange={(e) => handleCertificationChange(idx, 'expiryDate', e.target.value)} />
              </div>
              <div className="col-md-6 profile-form-group">
                <label className="profile-label">Credential ID (Optional)</label>
                <input type="text" className="profile-input" value={cert.credentialId || ''} onChange={(e) => handleCertificationChange(idx, 'credentialId', e.target.value)} />
              </div>
              <div className="col-md-6 profile-form-group">
                <label className="profile-label">Credential URL (Optional)</label>
                <input type="url" className="profile-input" value={cert.credentialUrl || ''} onChange={(e) => handleCertificationChange(idx, 'credentialUrl', e.target.value)} />
              </div>
              
              <div className="col-12 profile-form-group mb-0">
                <label className="profile-label">Upload Certificate (Optional)</label>
                <div className="profile-file-upload">
                  <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => handleCertFileChange(idx, e)} />
                  <i className="bi bi-cloud-arrow-up" style={{ fontSize: '1.4rem', color: '#334155' }}></i>
                  {certFiles[idx] ? (
                    <div className="mt-2" style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600 }}>{certFiles[idx]?.name}</div>
                  ) : (
                    <div className="mt-2" style={{ color: '#475569', fontSize: '0.85rem' }}>
                      {cert.fileUrl ? 'Drop a new file to replace the current certificate' : 'Click or drag your certificate here'}
                    </div>
                  )}
                </div>
                {cert.fileUrl && !certFiles[idx] && (
                  <div className="resume-download-bar mt-2">
                    <div className="resume-download-info">
                      <i className="bi bi-file-earmark-check-fill resume-download-icon"></i>
                      <div>
                        <div className="resume-download-label">Uploaded Certificate</div>
                        <div className="resume-download-filename">certificate_{idx + 1}</div>
                      </div>
                    </div>
                    <a href={`${process.env.NEXT_PUBLIC_API_URL || ''}${cert.fileUrl}`} target="_blank" rel="noreferrer" className="resume-download-btn">
                      <i className="bi bi-eye me-2" /> View File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resume & Links */}
      <div id="resume">
        <div className="profile-section-divider">
          <span className="profile-section-divider-label">Resume &amp; Links</span>
          <div className="profile-section-divider-line" />
        </div>

        <div className="profile-form-group">
          <label className="profile-label">Resume (PDF)</label>
          <div className="profile-file-upload">
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            <i className="bi bi-cloud-arrow-up" style={{ fontSize: '1.8rem', color: '#334155' }}></i>
            {resumeFile ? (
              <div className="mt-2" style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600 }}>{resumeFile.name}</div>
            ) : (
              <div className="mt-2" style={{ color: '#475569', fontSize: '0.85rem' }}>
                {initialData?.resumeUrl ? 'Drop a new file to replace your current resume' : 'Click or drag your resume here'}
              </div>
            )}
          </div>
          {initialData?.resumeUrl && !resumeFile && (
            <div className="resume-download-bar">
              <div className="resume-download-info">
                <i className="bi bi-file-earmark-pdf-fill resume-download-icon"></i>
                <div>
                  <div className="resume-download-label">Current Resume</div>
                  <div className="resume-download-filename">
                    {initialData.resumeUrl.split('/').pop()}
                  </div>
                </div>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || ''}${initialData.resumeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="resume-download-btn"
                aria-label="Download your current resume"
              >
                <i className="bi bi-download me-2"></i> Download
              </a>
            </div>
          )}
        </div>

        <div className="row">
          <div className="col-md-4 profile-form-group">
            <label className="profile-label"><i className="bi bi-linkedin me-1" style={{ color: '#0077b5' }} />LinkedIn (Optional)</label>
            <input type="url" name="linkedinUrl" className="profile-input" placeholder="https://linkedin.com/in/..." value={formData.linkedinUrl} onChange={handleInputChange} />
          </div>
          <div className="col-md-4 profile-form-group">
            <label className="profile-label"><i className="bi bi-github me-1" style={{ color: '#94a3b8' }} />GitHub (Optional)</label>
            <input type="url" name="githubUrl" className="profile-input" placeholder="https://github.com/..." value={formData.githubUrl} onChange={handleInputChange} />
          </div>
          <div className="col-md-4 profile-form-group">
            <label className="profile-label"><i className="bi bi-globe2 me-1" style={{ color: '#60a5fa' }} />Portfolio (Optional)</label>
            <input type="url" name="portfolioUrl" className="profile-input" placeholder="https://yoursite.com" value={formData.portfolioUrl} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`profile-message ${message.type} align-items-start`}>
          <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle-fill'} me-2 mt-1`} />
          <div>
            <div>{message.text}</div>
            {message.type === 'error' && errorList.length > 0 && (
              <ul className="profile-error-list mt-2 mb-0">
                {errorList.map((errItem, idx) => (
                  <li key={idx}>
                    <strong>{errItem.field.split('.').pop()?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {errItem.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="profile-actions">
        <button type="submit" className="btn-profile-save" disabled={loading}>
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" /> Saving…</>
          ) : (
            <><i className="bi bi-floppy me-2" /> Save Changes</>
          )}
        </button>
      </div>
    </form>
  );
}


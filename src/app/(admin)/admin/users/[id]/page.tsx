'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MdArrowBack, MdPerson, MdWork, MdSchool, MdBusiness, MdCardMembership } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import './UserDetail.css';

export default function UserDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        const res = await api.get(`/admin/users/${id}`);
        if (res.success) setUser(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <div className="detail-loading">Loading user details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!user) return <div className="alert alert-danger">User not found.</div>;

  const roleIds = user.roles.map((r: any) => r.roleId);

  return (
    <div className="user-detail-page">
      <PageHeader
        title="User Detail"
        subtitle={user.email}
        breadcrumbs={[
          { label: 'Home', path: '/admin' },
          { label: 'Users', path: '/admin/users' },
          { label: user.email },
        ]}
      />

      <button className="btn btn-outline-secondary back-btn" onClick={() => router.push('/admin/users')}>
        <MdArrowBack /> Back to Users
      </button>

      <div className="detail-card">
        <div className="detail-card-header"><MdPerson /> Account Info</div>
        <div className="detail-grid">
          <div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{user.email}</span></div>
          <div className="detail-item"><span className="detail-label">User ID</span><span className="detail-value mono">{user.id}</span></div>
          <div className="detail-item"><span className="detail-label">Joined</span><span className="detail-value">{new Date(user.createdAt).toLocaleDateString()}</span></div>
          <div className="detail-item"><span className="detail-label">Jobs Applied</span><span className="detail-value">{user.jobApplyCount}</span></div>
          <div className="detail-item"><span className="detail-label">Jobs Posted</span><span className="detail-value">{user.jobPostCount}</span></div>
          <div className="detail-item">
            <span className="detail-label">Roles</span>
            <span className="detail-value">
              {user.roles.map((r: any) => (
                <span key={r.roleId} className={`role-tag role-${r.roleId}`} style={{ marginRight: '0.5rem' }}>{r.roleName}</span>
              ))}
            </span>
          </div>
        </div>
      </div>

      {roleIds.includes(1) && user.seekerProfile && (
        <div className="detail-card">
          <div className="detail-card-header"><MdPerson /> Job Seeker Profile</div>
          <div className="detail-grid">
            <div className="detail-item"><span className="detail-label">Name</span><span className="detail-value">{[user.seekerProfile.title, user.seekerProfile.firstName, user.seekerProfile.middleName, user.seekerProfile.lastName].filter(Boolean).join(' ') || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Phone</span><span className="detail-value">{user.seekerProfile.phone || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Experience</span><span className="detail-value">{user.seekerProfile.totalExperienceYears ? `${user.seekerProfile.totalExperienceYears} years` : '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Expected Salary</span><span className="detail-value">{user.seekerProfile.expectedSalary || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Availability</span><span className="detail-value">{user.seekerProfile.availability || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Profile Completion</span><span className="detail-value">{user.seekerProfile.profileCompletion || 0}%</span></div>
            <div className="detail-item full-width"><span className="detail-label">Skills</span><span className="detail-value">{user.seekerProfile.skills || '—'}</span></div>
            <div className="detail-item full-width"><span className="detail-label">Summary</span><span className="detail-value">{user.seekerProfile.summary || '—'}</span></div>
          </div>

          {user.experiences && user.experiences.length > 0 && (
            <div className="detail-sub-section">
              <h4><MdWork /> Work Experience ({user.experiences.length})</h4>
              {user.experiences.map((exp: any, i: number) => (
                <div key={i} className="experience-item">
                  <strong>{exp.jobTitle}</strong> at {exp.companyName}
                  <div className="exp-meta">{exp.location} · {exp.employmentType} · {exp.startDate} — {exp.isCurrentJob ? 'Present' : exp.endDate}</div>
                  {exp.description && <p className="exp-desc">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {user.educations && user.educations.length > 0 && (
            <div className="detail-sub-section">
              <h4><MdSchool /> Education ({user.educations.length})</h4>
              {user.educations.map((edu: any, i: number) => (
                <div key={i} className="experience-item">
                  <strong>{edu.degree}</strong> in {edu.fieldOfStudy || 'N/A'}
                  <div className="exp-meta">{edu.institution} · {edu.startYear} — {edu.isCurrentlyStudying ? 'Present' : edu.endYear}</div>
                  {edu.grade && <div className="exp-meta">Grade: {edu.grade}</div>}
                </div>
              ))}
            </div>
          )}

          {user.certifications && user.certifications.length > 0 && (
            <div className="detail-sub-section">
              <h4>Certifications ({user.certifications.length})</h4>
              {user.certifications.map((cert: any, i: number) => (
                <div key={i} className="experience-item">
                  <strong>{cert.name}</strong> — {cert.issuingOrganization}
                  <div className="exp-meta">{cert.issueDate} {cert.doesNotExpire ? '· No Expiry' : cert.expiryDate ? `· Expires ${cert.expiryDate}` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {roleIds.includes(2) && user.employerProfile && (
        <div className="detail-card">
          <div className="detail-card-header"><MdBusiness /> Employer Profile</div>
          <div className="detail-grid">
            <div className="detail-item"><span className="detail-label">Company</span><span className="detail-value">{user.employerProfile.companyName || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Industry</span><span className="detail-value">{user.employerProfile.industry || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Size</span><span className="detail-value">{user.employerProfile.companySize || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Founded</span><span className="detail-value">{user.employerProfile.foundedYear || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Headquarters</span><span className="detail-value">{user.employerProfile.headquarters || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">HR Name</span><span className="detail-value">{user.employerProfile.hrName || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">HR Email</span><span className="detail-value">{user.employerProfile.hrEmail || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Website</span><span className="detail-value">{user.employerProfile.websiteUrl || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Profile Completion</span><span className="detail-value">{user.employerProfile.profileCompletion || 0}%</span></div>
            <div className="detail-item full-width"><span className="detail-label">About</span><span className="detail-value">{user.employerProfile.about || '—'}</span></div>
          </div>
        </div>
      )}

      {roleIds.includes(3) && user.promoterProfile && (
        <div className="detail-card">
          <div className="detail-card-header"><MdBusiness /> Business Promoter Profile</div>
          <div className="detail-grid">
            <div className="detail-item"><span className="detail-label">Business Name</span><span className="detail-value">{user.promoterProfile.businessName || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Category</span><span className="detail-value">{user.promoterProfile.businessCategory || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">GST Number</span><span className="detail-value">{user.promoterProfile.gstNumber || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Contact Email</span><span className="detail-value">{user.promoterProfile.contactEmail || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Contact Phone</span><span className="detail-value">{user.promoterProfile.contactPhone || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Website</span><span className="detail-value">{user.promoterProfile.websiteUrl || '—'}</span></div>
            <div className="detail-item"><span className="detail-label">Profile Completion</span><span className="detail-value">{user.promoterProfile.profileCompletion || 0}%</span></div>
            <div className="detail-item full-width"><span className="detail-label">About</span><span className="detail-value">{user.promoterProfile.about || '—'}</span></div>
            <div className="detail-item full-width"><span className="detail-label">Purpose</span><span className="detail-value">{user.promoterProfile.purpose || '—'}</span></div>
          </div>
        </div>
      )}

      {user.subscriptions && user.subscriptions.length > 0 && (
        <div className="detail-card">
          <div className="detail-card-header"><MdCardMembership /> Subscriptions ({user.subscriptions.length})</div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr><th>Type</th><th>Tier</th><th>Status</th><th>Expires</th><th>Created</th></tr>
              </thead>
              <tbody>
                {user.subscriptions.map((sub: any) => (
                  <tr key={sub.id}>
                    <td>{sub.subscriptionType}</td>
                    <td>{sub.tier}</td>
                    <td><span className={`status-badge ${sub.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>{sub.status}</span></td>
                    <td>{new Date(sub.expiresAt).toLocaleDateString()}</td>
                    <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {user.savedJobs && user.savedJobs.length > 0 && (
        <div className="detail-card">
          <div className="detail-card-header"><MdWork /> Saved Jobs / Wishlist ({user.savedJobs.length})</div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Job Type</th>
                  <th>Salary Range</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {user.savedJobs.map((job: any) => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.title}</strong>
                    </td>
                    <td>{job.companyName}</td>
                    <td>{job.location || 'Remote'}</td>
                    <td>{job.jobType || 'Full-time'}</td>
                    <td>{job.salaryRange || 'Competitive'}</td>
                    <td>
                      {job.isActive ? (
                        <span className="status-badge badge-success">Active</span>
                      ) : (
                        <span className="status-badge badge-secondary" style={{ backgroundColor: '#6c757d', color: '#fff' }}>Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

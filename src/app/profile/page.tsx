"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import JobSeekerProfileForm from '../../components/Profile/JobSeekerProfileForm';
import EmployerProfileForm from '../../components/Profile/EmployerProfileForm';
import BusinessPromoterProfileForm from '../../components/Profile/BusinessPromoterProfileForm';
import './Profile.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ProfilePage() {
  const { user, isLoading, isLoggedIn } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      if (!isLoading && !isLoggedIn) {
        window.location.href = '/login';
      }
      return;
    }

    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = user.roles[0] === 1 ? '/api/profiles/job-seeker' : 
                         user.roles[0] === 2 ? '/api/profiles/employer' : 
                         '/api/profiles/business-promoter';

        const res = await fetch(`${API_BASE}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setProfileData(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile data', err);
      } finally {
        setFetching(false);
      }
    };

    fetchProfileData();
  }, [user, isLoggedIn, isLoading]);

  if (isLoading || fetching) {
    return (
      <div className="profile-page-container">
        <div className="profile-loading">Loading Profile...</div>
      </div>
    );
  }

  if (!user) return null;

  const role = user.roles[0];

  return (
    <div className="profile-page-container">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your details and keep your profile up to date.</p>
        </div>
        
        <div className="profile-content">
          {role === 1 && <JobSeekerProfileForm initialData={profileData} />}
          {role === 2 && <EmployerProfileForm initialData={profileData} />}
          {role === 3 && <BusinessPromoterProfileForm initialData={profileData} />}
        </div>
      </div>
    </div>
  );
}

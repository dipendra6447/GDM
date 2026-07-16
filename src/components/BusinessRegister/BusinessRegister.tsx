"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/business-register.css';
import { useAuth } from '../../hooks/useAuth';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const BusinessRegister: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    businessContactDetails: '',
    foundationDate: '',
    purpose: '',
    businessDescription: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError('Please log in first to register your business.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/promotions`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Draft created successfully, navigate to subscription page
        router.push('/subscription');
      } else {
        setError(data.message || 'Failed to register business');
      }
    } catch (err) {
      setError('An error occurred while connecting to the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="business-register-page"><p>Loading...</p></div>;
  }

  return (
    <div className="business-register-page">
      <Breadcrumb items={[{ label: 'Business' }, { label: 'Register' }]} />
      <div className="business-register-wrapper">
        <div className="business-register-container">
          <div className="business-register-header">
            <h1>Register Your Business</h1>
            <p>You are one step away! Promote your business to thousands of job seekers. Fill out the details below and proceed to choose a plan.</p>
          </div>
          
          <form className="business-register-form" onSubmit={handleSubmit}>
            {error && <div className="form-group full-width" style={{ color: 'red', fontWeight: 'bold' }}>{error}</div>}
            
            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input 
                type="text" 
                id="businessName" 
                name="businessName" 
                required
                value={formData.businessName}
                onChange={handleChange}
                placeholder="E.g., TechNova Solutions"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select 
                id="category" 
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
              >
                <option value="" disabled>Select a category</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="foundationDate">Foundation Date</label>
              <input 
                type="date" 
                id="foundationDate" 
                name="foundationDate" 
                value={formData.foundationDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="businessContactDetails">Business Contact Details *</label>
              <input 
                type="text" 
                id="businessContactDetails" 
                name="businessContactDetails" 
                required
                value={formData.businessContactDetails}
                onChange={handleChange}
                placeholder="Phone, Email, or Address"
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="purpose">Purpose</label>
              <input 
                type="text" 
                id="purpose" 
                name="purpose" 
                value={formData.purpose}
                onChange={handleChange}
                placeholder="What is the primary goal of your promotion?"
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="businessDescription">Business Description *</label>
              <textarea 
                id="businessDescription" 
                name="businessDescription" 
                required
                value={formData.businessDescription}
                onChange={handleChange}
                placeholder="Tell us about your business, products, or services..."
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-register" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register & Choose Plan'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessRegister;

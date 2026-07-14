"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SavedSearchesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSavedSearches = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view saved searches');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/saved-searches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setSavedSearches(json.data);
      } else {
        setError(json.message || 'Failed to fetch saved searches');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch saved searches');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (searchId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!confirm('Are you sure you want to delete this saved search?')) return;
    try {
      const res = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setSavedSearches(prev => prev.filter(s => s.id !== searchId));
      } else {
        alert(json.message || 'Failed to delete saved search');
      }
    } catch (err) {
      console.error("Error deleting saved search:", err);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchSavedSearches();
    }
  }, [authLoading]);

  // Helper to format query filters nicely
  const formatQueryParams = (queryString: string) => {
    try {
      const params = new URLSearchParams(queryString);
      const parts: string[] = [];
      params.forEach((value, key) => {
        if (value && value !== 'all') {
          // Format keys nicely
          const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
          parts.push(`${formattedKey}: ${value}`);
        }
      });
      return parts.join(' • ') || 'All Jobs (No Filters)';
    } catch (err) {
      return queryString;
    }
  };

  if (authLoading) {
    return (
      <div className="dashboard-content-wrapper" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ padding: '3rem' }}>Loading user session...</div>
      </div>
    );
  }

  const isJobSeeker = user?.roles?.includes(1);

  if (!user) {
    return (
      <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
        <h2 className="mb-4">Saved Searches</h2>
        <div className="alert alert-danger">Please log in to view saved searches.</div>
      </div>
    );
  }

  if (!isJobSeeker) {
    return (
      <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
        <h2 className="mb-4">Saved Searches</h2>
        <div className="alert alert-danger">
          Access Denied. Only Job Seekers can save and view searches.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
      <h2 className="mb-4">Saved Searches</h2>
      
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading saved searches...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : savedSearches.length === 0 ? (
        <div className="dash-user-card text-center p-5">
          <i className="bi bi-search mb-3 text-secondary" style={{ fontSize: '3rem' }}></i>
          <h4>No Saved Searches Yet</h4>
          <p className="text-secondary">Save your search filters on the Jobs page to access them quickly here.</p>
          <Link href="/jobs" className="btn btn-primary mt-3" style={{ borderRadius: '8px' }}>
            Go to Jobs Page
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {savedSearches.map((item) => (
            <div 
              key={item.id} 
              className="dash-user-card p-4 d-flex flex-row justify-content-between align-items-center flex-wrap" 
              style={{ gap: '1rem' }}
            >
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontWeight: 600 }}>{item.title}</h4>
                <div className="d-flex align-items-center gap-2 text-secondary flex-wrap" style={{ fontSize: '0.875rem' }}>
                  <span><i className="bi bi-funnel me-1"></i>{formatQueryParams(item.query)}</span>
                </div>
              </div>
              
              <div className="d-flex align-items-center gap-2">
                <Link 
                  href={`/jobs?${item.query}`} 
                  className="btn btn-primary" 
                  style={{ borderRadius: '8px' }}
                >
                  Run Search
                </Link>
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="btn btn-outline-danger" 
                  style={{ borderRadius: '8px' }}
                  title="Delete Search"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

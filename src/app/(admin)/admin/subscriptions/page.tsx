'use client';

import { useState, useEffect, useRef } from 'react';
import { MdCardMembership, MdCancel } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './Subscriptions.css';

const TYPE_TABS = [
  { label: 'All', filter: null },
  { label: 'Active', filter: 'active' },
  { label: 'Expired', filter: 'expired' },
];

export default function SubscriptionsPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      // Wait, there's no /admin/subscriptions API implemented yet. We should fetch from a placeholder or API if we ported it.
      // Assuming we have it or will add it soon. Let's keep the API call intact.
      const res = await api.get('/admin/subscriptions');
      if (res.success) setSubs(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  useEffect(() => {
    if (!loading && contentRef.current) fadeInUp(contentRef.current);
  }, [loading]);

  const handleExpire = async (id: string) => {
    if (!window.confirm('Are you sure you want to expire this subscription?')) return;
    try {
      await api.patch(`/admin/subscriptions/${id}/expire`, {});
      fetchSubs();
    } catch (err: any) {
      alert(err.message || 'Failed to expire subscription');
    }
  };

  const filteredSubs = subs.filter((sub) => {
    if (activeFilter === null) return true;
    return sub.status === activeFilter;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'job_seeker': return 'badge-emerald';
      case 'job_poster': return 'badge-blue';
      case 'business_promoter': return 'badge-purple';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="subs-page">
      <PageHeader
        title="Subscriptions"
        subtitle="Manage user subscriptions across the platform."
        breadcrumbs={[{ label: 'Home', path: '/admin' }, { label: 'Subscriptions' }]}
      />

      <div className="role-filter-tabs">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.label}
            className={`role-tab ${activeFilter === tab.filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(tab.filter)}
          >
            {tab.label}
            <span className="tab-count">
              {tab.filter === null ? subs.length : subs.filter(s => s.status === tab.filter).length}
            </span>
          </button>
        ))}
      </div>

      <div className="admin-card" ref={contentRef}>
        <div className="card-header">
          <h3><MdCardMembership className="icon-mr" /> Subscriptions ({filteredSubs.length})</h3>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-4">Loading subscriptions...</td></tr>
              ) : filteredSubs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4">No subscriptions found.</td></tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id}>
                    <td><span className="user-email">{sub.userEmail}</span></td>
                    <td><span className={`status-badge ${getTypeBadge(sub.subscriptionType)}`}>{sub.subscriptionType.replace('_', ' ')}</span></td>
                    <td className="text-capitalize">{sub.tier}</td>
                    <td>
                      <span className={`status-badge ${sub.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td>{new Date(sub.expiresAt).toLocaleDateString()}</td>
                    <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td>
                      {sub.status === 'active' && (
                        <button
                          className="btn-icon text-danger"
                          onClick={() => handleExpire(sub.id)}
                          title="Force Expire"
                        >
                          <MdCancel />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

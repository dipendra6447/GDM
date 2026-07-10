'use client';

import { useState, useEffect, useRef } from 'react';
import { MdCardMembership, MdCancel, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './Subscriptions.css';

const MAIN_TABS = [
  { id: 'users', label: 'User Subscriptions' },
  { id: 'plans', label: 'Pricing Plans' }
];

export default function SubscriptionsPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('plans');
  
  // Data States
  const [subs, setSubs] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Plan Modal States
  const [showModal, setShowModal] = useState(false);
  const [showUserSubModal, setShowUserSubModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planFormData, setPlanFormData] = useState({
    name: '',
    price: '',
    billingCycle: '/month',
    roleTarget: 'job_seeker',
    features: '',
    imageUrl: '',
    isPopular: false,
    isBestValue: false,
    isActive: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, plansRes] = await Promise.all([
        api.get('/admin/subscriptions'),
        api.get('/admin/subscription-plans')
      ]);
      if (subsRes.success) setSubs(subsRes.data);
      if (plansRes.success) setPlans(plansRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && contentRef.current) fadeInUp(contentRef.current);
  }, [loading, activeTab]);

  // --- Users Handlers ---
  const handleExpire = async (id: string) => {
    if (!window.confirm('Are you sure you want to expire this subscription?')) return;
    try {
      await api.patch(`/admin/subscriptions/${id}/expire`, {});
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to expire subscription');
    }
  };

  const handleAddUserSub = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Directly adding user subscriptions is currently disabled. Please assign roles in User Management.');
    setShowUserSubModal(false);
  };

  // --- Plans Handlers ---
  const handlePlanInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPlanFormData({ ...planFormData, [name]: checked });
    } else {
      setPlanFormData({ ...planFormData, [name]: value });
    }
  };

  const handlePlanSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...planFormData,
        features: planFormData.features.split('\n').map(f => f.trim()).filter(f => f.length > 0)
      };

      if (editingPlan) {
        await api.put(`/admin/subscription-plans/${editingPlan.id}`, payload);
      } else {
        await api.post('/admin/subscription-plans', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save plan');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await api.delete(`/admin/subscription-plans/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  const openPlanModal = (plan: any = null) => {
    setEditingPlan(plan);
    if (plan) {
      setPlanFormData({
        name: plan.name,
        price: plan.price.toString(),
        billingCycle: plan.billingCycle,
        roleTarget: plan.roleTarget,
        features: plan.features.join('\n'),
        imageUrl: plan.imageUrl || '',
        isPopular: plan.isPopular,
        isBestValue: plan.isBestValue,
        isActive: plan.isActive
      });
    } else {
      setPlanFormData({
        name: '', price: '', billingCycle: '/month', roleTarget: 'job_seeker', features: '', imageUrl: '', isPopular: false, isBestValue: false, isActive: true
      });
    }
    setShowModal(true);
  };

  return (
    <div className="subs-page">
      <PageHeader
        title="Subscriptions & Plans"
        subtitle="Manage user subscriptions and pricing plans."
        breadcrumbs={[{ label: 'Home', path: '/admin' }, { label: 'Subscriptions' }]}
      />

      <div className="role-filter-tabs">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`role-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-card" ref={contentRef}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3>
            <MdCardMembership className="icon-mr" />
            {activeTab === 'users' ? 'User Subscriptions' : 'Pricing Plans'}
          </h3>
          <button className="btn btn-primary" onClick={() => activeTab === 'plans' ? openPlanModal() : setShowUserSubModal(true)}>
            <MdAdd /> {activeTab === 'users' ? 'Add Subscription' : 'Add Plan'}
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          {activeTab === 'users' ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
                ) : subs.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4">No user subscriptions found.</td></tr>
                ) : (
                  subs.map((sub) => (
                    <tr key={sub.id}>
                      <td><span className="user-email">{sub.userEmail}</span></td>
                      <td><span className="badge badge-secondary">{sub.subscriptionType}</span></td>
                      <td className="text-capitalize">{sub.tier}</td>
                      <td><span className={`status-badge ${sub.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>{sub.status}</span></td>
                      <td>{new Date(sub.expiresAt).toLocaleDateString()}</td>
                      <td>
                        {sub.status === 'active' && (
                          <button className="btn-icon text-danger" onClick={() => handleExpire(sub.id)}><MdCancel /></button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Plan Name</th>
                  <th>Price</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-4">Loading plans...</td></tr>
                ) : plans.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4">No pricing plans found.</td></tr>
                ) : (
                  plans.map((plan) => (
                    <tr key={plan.id}>
                      <td>
                        {plan.imageUrl ? (
                          <img src={plan.imageUrl} alt={plan.name} style={{ width: 60, height: 40, objectFit: 'contain' }} />
                        ) : (
                          <div style={{ width: 60, height: 40, background: '#eee' }}></div>
                        )}
                      </td>
                      <td>
                        <strong>{plan.name}</strong>
                        {plan.isPopular && <span className="badge badge-warning" style={{marginLeft: 8}}>Popular</span>}
                        {plan.isBestValue && <span className="badge badge-purple" style={{marginLeft: 8}}>Best Value</span>}
                      </td>
                      <td>₹{plan.price}{plan.billingCycle}</td>
                      <td><span className="badge badge-secondary">{plan.roleTarget.replace('_', ' ')}</span></td>
                      <td><span className={`status-badge ${plan.isActive ? 'badge-success' : 'badge-secondary'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon text-primary" onClick={() => openPlanModal(plan)}><MdEdit /></button>
                          <button className="btn-icon text-danger" onClick={() => handleDeletePlan(plan.id)}><MdDelete /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>{editingPlan ? 'Edit Plan' : 'Add Plan'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handlePlanSave}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Plan Name (e.g. Silver Plan)</label>
                  <input type="text" name="name" className="form-control" value={planFormData.name} onChange={handlePlanInputChange} required />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" name="price" className="form-control" value={planFormData.price} onChange={handlePlanInputChange} required />
                </div>
                <div className="form-group">
                  <label>Billing Cycle</label>
                  <input type="text" name="billingCycle" className="form-control" value={planFormData.billingCycle} onChange={handlePlanInputChange} placeholder="/month" required />
                </div>
                <div className="form-group">
                  <label>Target Role</label>
                  <select name="roleTarget" className="form-control" value={planFormData.roleTarget} onChange={handlePlanInputChange} required>
                    <option value="job_seeker">Job Seeker</option>
                    <option value="employer">Employer</option>
                    <option value="business_promoter">Business Promoter</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Image URL (Optional Badge/Icon)</label>
                  <input type="url" name="imageUrl" className="form-control" value={planFormData.imageUrl} onChange={handlePlanInputChange} />
                </div>
                
                <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="isPopular" checked={planFormData.isPopular} onChange={handlePlanInputChange} />
                    Most Popular Badge
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="isBestValue" checked={planFormData.isBestValue} onChange={handlePlanInputChange} />
                    Best Value Badge
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="isActive" checked={planFormData.isActive} onChange={handlePlanInputChange} />
                    Active
                  </label>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Features (One per line)</label>
                  <textarea name="features" className="form-control" rows={5} value={planFormData.features} onChange={handlePlanInputChange} placeholder="Search Unlimited Jobs&#10;First 3 Applications Free" required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserSubModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Add User Subscription</h3>
              <button className="close-btn" onClick={() => setShowUserSubModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddUserSub}>
              <div className="modal-body">
                <div className="alert alert-info">
                  To add a subscription for a user, please go to the <strong>User Management</strong> page and assign them the respective role (Job Seeker, Employer, Business Promoter). Subscriptions are automatically generated.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setShowUserSubModal(false)}>Understood</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

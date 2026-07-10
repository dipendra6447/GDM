'use client';

import { useState, useEffect, useRef } from 'react';
import { MdPeople, MdAdd, MdSearch, MdVisibility } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './Users.css';

const ROLE_TABS = [
  { label: 'All Users', roleId: null },
  { label: 'Job Seekers', roleId: 1 },
  { label: 'Employers', roleId: 2 },
  { label: 'Business Owners', roleId: 3 },
];

export default function UsersPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', roleId: '' });

  const availableRoles = [
    { id: 1, name: 'JOB_SEEKER' },
    { id: 2, name: 'EMPLOYER' },
    { id: 3, name: 'BUSINESS_PROMOTER' },
    { id: 4, name: 'SUPER_USER' },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users?limit=100');
      if (res.success) setUsers(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!loading && contentRef.current) fadeInUp(contentRef.current);
  }, [loading]);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedRole) return;
    setAssigning(true);
    try {
      await api.post('/admin/users/assign-role', {
        userId: selectedUser.id,
        roleId: parseInt(selectedRole, 10),
      });
      setShowModal(false);
      setSelectedUser(null);
      setSelectedRole('');
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to assign role');
    } finally {
      setAssigning(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // POST to some register or add user endpoint
      // Assuming /admin/users exists for POST, otherwise we'll just mock it or handle error
      const res = await api.post('/admin/users', newUser);
      if (newUser.roleId && res.data?.id) {
        await api.post('/admin/users/assign-role', { userId: res.data.id, roleId: parseInt(newUser.roleId, 10) });
      }
      setShowAddModal(false);
      setNewUser({ email: '', password: '', roleId: '' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to add user. Ensure the endpoint supports POST.');
    }
  };

  const handleRemoveRole = async (userId: string, roleId: number) => {
    if (!window.confirm('Are you sure you want to remove this role?')) return;
    try {
      await api.delete(`/admin/users/${userId}/roles/${roleId}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to remove role');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = activeTab === null || user.roles.some((r: any) => r.roleId === activeTab);
    const matchesSearch = !searchTerm || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="users-page">
      <PageHeader
        title="User Management"
        subtitle="View and manage all registered users across the platform."
        breadcrumbs={[{ label: 'Home', path: '/admin' }, { label: 'Users' }]}
      />

      <div className="role-filter-tabs">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.label}
            className={`role-tab ${activeTab === tab.roleId ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.roleId)}
          >
            {tab.label}
            <span className="tab-count">
              {tab.roleId === null
                ? users.length
                : users.filter((u) => u.roles.some((r: any) => r.roleId === tab.roleId)).length}
            </span>
          </button>
        ))}
      </div>

      <div className="search-bar">
        <MdSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="admin-card" ref={contentRef}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3><MdPeople className="icon-mr" /> System Users ({filteredUsers.length})</h3>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><MdAdd /> Add User</button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Joined</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-4">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4">No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-email">{user.email}</div>
                      <div className="user-id">ID: {user.id.substring(0, 8)}...</div>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="role-tags">
                        {user.roles.map((r: any) => (
                          <span key={r.roleId} className={`role-tag role-${r.roleId}`}>
                            {r.roleName}
                            <button
                              className="remove-role-btn"
                              onClick={() => handleRemoveRole(user.id, r.roleId)}
                              title={`Remove ${r.roleName}`}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                        {user.roles.length === 0 && <span className="text-muted">No roles</span>}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-outline-primary action-btn"
                          onClick={() => { setSelectedUser(user); setShowModal(true); }}
                        >
                          <MdAdd /> Role
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary action-btn"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          <MdVisibility /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Assign Role</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAssignRole}>
              <div className="modal-body">
                <p>Assign a role to <strong>{selectedUser?.email}</strong></p>
                <div className="form-group">
                  <label>Select Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    required
                    className="form-control"
                  >
                    <option value="">-- Choose Role --</option>
                    {availableRoles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={assigning || !selectedRole}>
                  {assigning ? 'Assigning...' : 'Assign Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="form-control" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Initial Role (Optional)</label>
                  <select className="form-control" value={newUser.roleId} onChange={(e) => setNewUser({...newUser, roleId: e.target.value})}>
                    <option value="">-- None --</option>
                    {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

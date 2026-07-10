'use client';

import { useState, useEffect, useRef } from 'react';
import { MdCategory, MdAdd, MdEdit, MdDelete, MdToggleOn, MdToggleOff } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './Categories.css';

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export default function JobCategoriesPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/categories/job');
      if (res.success) setCategories(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!loading && contentRef.current) fadeInUp(contentRef.current);
  }, [loading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let data: any = { name };
      if (imageFile) {
        data = new FormData();
        data.append('name', name);
        if (imageUrl) data.append('imageUrl', imageUrl);
        data.append('image', imageFile);
      } else {
        data.imageUrl = imageUrl;
      }

      if (editingCategory) {
        await api.put(`/admin/categories/job/${editingCategory.id}`, data);
      } else {
        await api.post('/admin/categories/job', data);
      }
      setShowModal(false);
      setEditingCategory(null);
      setName('');
      setImageUrl('');
      setImageFile(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/categories/job/${id}/status`, { isActive: !currentStatus });
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/admin/categories/job/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const openModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setName(category ? category.name : '');
    setImageUrl(category?.imageUrl || '');
    setImageFile(null);
    setShowModal(true);
  };

  const filteredCategories = categories.filter(c => !c.isDeleted);

  return (
    <div className="categories-page">
      <PageHeader
        title="Job Categories"
        subtitle="Manage the list of available job categories."
        breadcrumbs={[{ label: 'Home', path: '/admin' }, { label: 'Job Categories' }]}
      />

      <div className="admin-card" ref={contentRef}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3><MdCategory className="icon-mr" /> Job Categories ({filteredCategories.length})</h3>
          <button className="btn btn-primary" onClick={() => openModal()}><MdAdd /> Add Category</button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4">No categories found.</td></tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                      ) : (
                        <div style={{ width: 40, height: 40, background: '#eee', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                          <MdCategory />
                        </div>
                      )}
                    </td>
                    <td><strong>{cat.name}</strong></td>
                    <td>
                      <span className={`status-badge ${cat.isActive ? 'badge-success' : 'badge-warning'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon text-primary" onClick={() => openModal(cat)} title="Edit"><MdEdit /></button>
                        <button className={`btn-icon ${cat.isActive ? 'text-success' : 'text-warning'}`} onClick={() => handleToggle(cat.id, cat.isActive)} title="Toggle Status">
                          {cat.isActive ? <MdToggleOn /> : <MdToggleOff />}
                        </button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(cat.id)} title="Delete"><MdDelete /></button>
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
              <h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Image Upload (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                    Or provide an image URL below:
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <input
                    type="url"
                    className="form-control"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                    disabled={!!imageFile}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

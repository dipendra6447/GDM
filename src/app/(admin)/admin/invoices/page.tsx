"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  totalAmount: number;
  billingName: string;
  billingEmail: string;
  gstNumber?: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  userEmail: string;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setInvoices(json.data || []);
      } else {
        setError(json.message || 'Failed to fetch invoices');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const paidInvoices = invoices.filter(i => i.paymentStatus === 'paid');
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalTax = paidInvoices.reduce((sum, i) => sum + i.tax, 0);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.billingEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.billingName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || invoice.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-invoices-page p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#111c44' }}>Invoices &amp; Billing History</h2>
          <p className="text-secondary mb-0">Track payments, GST collection, and order transactions across the platform.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {/* Platform Financial Statistics Overview */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '16px' }}>
            <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '0.85rem' }}>TOTAL SALES REVENUE</span>
            <h2 className="fw-bold mb-0 text-success">₹{totalRevenue}</h2>
            <span className="text-secondary mt-1 d-block" style={{ fontSize: '0.75rem' }}>From paid subscriptions</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '16px' }}>
            <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '0.85rem' }}>GST TAX COLLECTED (18%)</span>
            <h2 className="fw-bold mb-0 text-primary">₹{totalTax}</h2>
            <span className="text-secondary mt-1 d-block" style={{ fontSize: '0.75rem' }}>For government tax filing</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '16px' }}>
            <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '0.85rem' }}>TOTAL TRANSACTIONS</span>
            <h2 className="fw-bold mb-0 text-dark">{invoices.length}</h2>
            <span className="text-secondary mt-1 d-block" style={{ fontSize: '0.75rem' }}>Paid, pending, and failed attempts</span>
          </div>
        </div>
      </div>

      {/* Filter and Table Panel */}
      <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '20px' }}>
        <div className="row g-3 mb-4">
          <div className="col-md-6 col-lg-4">
            <input 
              type="text" 
              className="form-control px-3 py-2" 
              style={{ borderRadius: '10px' }}
              placeholder="Search by Invoice No, Email, or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="col-md-4 col-lg-3">
            <select 
              className="form-select px-3 py-2" 
              style={{ borderRadius: '10px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-receipt text-secondary fs-1 mb-2" />
            <p className="text-secondary mb-0">No matching invoices found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Date</th>
                  <th>Customer Billing</th>
                  <th>GST Number</th>
                  <th>Status</th>
                  <th>Base Price</th>
                  <th>Grand Total</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="fw-bold" style={{ color: '#111c44' }}>{inv.invoiceNumber}</td>
                    <td style={{ fontSize: '0.88rem' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div>
                        <strong className="text-dark d-block">{inv.billingName}</strong>
                        <span className="text-secondary" style={{ fontSize: '0.8rem' }}>{inv.billingEmail}</span>
                      </div>
                    </td>
                    <td>
                      {inv.gstNumber ? (
                        <span className="badge bg-primary-subtle text-primary border border-primary px-2 py-1" style={{ fontSize: '0.75rem' }}>
                          {inv.gstNumber}
                        </span>
                      ) : (
                        <span className="text-secondary" style={{ fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge px-2 py-1 ${
                        inv.paymentStatus === 'paid' ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'
                      }`} style={{ textTransform: 'capitalize', fontSize: '0.75rem', borderRadius: '6px' }}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="text-secondary">₹{inv.amount}</td>
                    <td className="fw-bold text-dark">₹{inv.totalAmount}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link 
                        href={`/invoice/${inv.id}`} 
                        target="_blank"
                        className="btn btn-sm btn-outline-primary"
                        style={{ borderRadius: '8px' }}
                      >
                        <i className="bi bi-file-earmark-pdf me-1" /> View/Print
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

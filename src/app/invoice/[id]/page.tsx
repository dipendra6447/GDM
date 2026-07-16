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
  billingAddress?: string;
  gstNumber?: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/invoices/${resolvedParams.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setInvoice(json.data);
        } else {
          setError(json.message || 'Failed to load invoice');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while loading the invoice');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [resolvedParams.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f8fafc' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '80vh' }}>
        <div className="alert alert-danger max-width-600 mx-auto p-4" style={{ borderRadius: '16px' }}>
          <i className="bi bi-exclamation-octagon-fill fs-2 mb-3 d-block text-danger" />
          <h4 className="fw-bold">Failed to load invoice</h4>
          <p className="mb-0">{error || 'Access denied or invoice not found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '2rem 1rem' }}>
      
      {/* CSS Print Rules overrides */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            padding: 0 !important;
          }
          .invoice-actions-bar {
            display: none !important;
          }
          .invoice-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
        }
      `}</style>

      {/* Floating Action Menu Bar */}
      <div className="invoice-actions-bar d-flex justify-content-between align-items-center max-width-800 mx-auto mb-4 p-3 bg-white shadow-sm border border-light" style={{ borderRadius: '16px', maxWidth: '800px' }}>
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-file-earmark-pdf fs-4 text-primary" />
          <div>
            <h5 className="fw-bold mb-0" style={{ fontSize: '1rem' }}>Tax Invoice</h5>
            <p className="text-secondary mb-0" style={{ fontSize: '0.8rem' }}>Invoice #{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button 
            onClick={handlePrint}
            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
            style={{ borderRadius: '10px', background: '#2454ff', border: 'none' }}
          >
            <i className="bi bi-printer-fill" /> Download / Print PDF
          </button>
          <button 
            onClick={() => window.close()}
            className="btn btn-outline-secondary px-3 py-2"
            style={{ borderRadius: '10px' }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Printable Invoice Page Canvas */}
      <div className="card invoice-card mx-auto p-5 bg-white border-light shadow-sm" style={{ maxWidth: '800px', borderRadius: '24px' }}>
        
        {/* Invoice Header block */}
        <div className="row align-items-start mb-5">
          <div className="col-sm-6">
            <h2 className="fw-bold text-primary mb-2 d-flex align-items-center gap-2" style={{ color: '#2454ff' }}>
              <i className="bi bi-briefcase-fill" /> JobNest
            </h2>
            <p className="text-secondary mb-0" style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
              JobNest Recruitment Portal Ltd.<br />
              102 Enterprise Way, Tech Hub District<br />
              Bangalore, Karnataka - 560001<br />
              India
            </p>
            <p className="text-secondary mb-0 mt-2" style={{ fontSize: '0.82rem' }}>
              <strong>GSTIN:</strong> 29AAAAC2929B1Z8<br />
              <strong>CIN:</strong> U74999KA2026PTC10999
            </p>
          </div>
          <div className="col-sm-6 text-sm-end mt-4 mt-sm-0">
            <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '2rem' }}>TAX INVOICE</h1>
            <p className="text-secondary fw-semibold mb-3">Original for Recipient</p>
            
            <div className="d-inline-block text-start border-start border-light ps-3 mt-1">
              <p className="mb-1" style={{ fontSize: '0.85rem' }}><strong className="text-dark">Invoice No:</strong> {invoice.invoiceNumber}</p>
              <p className="mb-1" style={{ fontSize: '0.85rem' }}><strong className="text-dark">Date of Issue:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
              <p className="mb-1" style={{ fontSize: '0.85rem' }}><strong className="text-dark">Payment Status:</strong> <span className="text-success fw-bold">PAID</span></p>
              <p className="mb-0" style={{ fontSize: '0.85rem' }}><strong className="text-dark">Payment Mode:</strong> {invoice.paymentMethod.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: '#e2e8f0' }} />

        {/* Billing Information Details */}
        <div className="row mb-5">
          <div className="col-sm-6">
            <h5 className="fw-bold text-dark mb-3">BILL TO:</h5>
            <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '1.1rem' }}>{invoice.billingName}</h4>
            <p className="text-secondary mb-0" style={{ fontSize: '0.88rem' }}>{invoice.billingEmail}</p>
            {invoice.billingAddress && (
              <p className="text-secondary mb-0 mt-2" style={{ fontSize: '0.88rem', whiteSpace: 'pre-line' }}>
                {invoice.billingAddress}
              </p>
            )}
          </div>
          {invoice.gstNumber && (
            <div className="col-sm-6 text-sm-end mt-4 mt-sm-0">
              <div className="d-inline-block text-start p-3 bg-light" style={{ borderRadius: '12px' }}>
                <span className="fw-semibold text-secondary d-block mb-1" style={{ fontSize: '0.78rem' }}>TAX CREDIT INFORMATION</span>
                <span className="fw-bold text-dark d-block" style={{ fontSize: '0.9rem' }}>GSTIN: {invoice.gstNumber}</span>
              </div>
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <div className="table-responsive mb-4">
          <table className="table align-middle table-bordered">
            <thead className="table-light">
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Item / Description</th>
                <th className="text-end" style={{ width: '120px' }}>Base Price</th>
                <th className="text-end" style={{ width: '100px' }}>GST (18%)</th>
                <th className="text-end" style={{ width: '120px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <span className="fw-bold d-block" style={{ color: '#1e293b' }}>
                    JobNest Premium Service
                  </span>
                  <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                    Subscription access for recruitment tools / listings.
                  </span>
                </td>
                <td className="text-end">₹{invoice.amount}</td>
                <td className="text-end">₹{invoice.tax}</td>
                <td className="text-end fw-bold">₹{invoice.totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Calculations Block */}
        <div className="row justify-content-end mb-5">
          <div className="col-sm-5 text-sm-end">
            <div className="d-inline-block text-start w-100 p-3 border" style={{ borderRadius: '12px', background: '#f8fafc' }}>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
                <span className="text-secondary">Subtotal (Base):</span>
                <span className="fw-semibold text-dark">₹{invoice.amount}</span>
              </div>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
                <span className="text-secondary">GST (18%):</span>
                <span className="fw-semibold text-dark">₹{invoice.tax}</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between" style={{ fontSize: '1.05rem' }}>
                <span className="fw-bold text-dark">Grand Total:</span>
                <span className="fw-bold text-primary" style={{ color: '#2454ff' }}>₹{invoice.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signature & T&C Footer */}
        <div className="row mt-5 pt-4 align-items-end" style={{ borderTop: '1px dashed #cbd5e1' }}>
          <div className="col-sm-7" style={{ fontSize: '0.78rem', color: '#64748b' }}>
            <span className="fw-bold d-block mb-1">Terms &amp; Conditions:</span>
            <p className="mb-0">
              1. This is a computer-generated tax invoice and requires no physical signature.<br />
              2. Fees once paid for subscriptions are non-refundable under any circumstances.<br />
              3. For any billing queries, support is available at support@jobnest.com.
            </p>
          </div>
          <div className="col-sm-5 text-sm-end mt-4 mt-sm-0">
            <div className="d-inline-block text-center">
              <div style={{ height: '40px' }} />
              <p className="fw-bold mb-0 text-dark" style={{ borderTop: '1px solid #1e293b', paddingTop: '4px', fontSize: '0.85rem' }}>
                Authorised Signatory
              </p>
              <span className="text-secondary" style={{ fontSize: '0.78rem' }}>JobNest Recruitment Portal</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

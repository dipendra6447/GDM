"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { COUNTRIES_DATA } from '../../data/locationData';

interface Props {
  initialData: any;
  roleId?: number;
}

export default function BusinessPromoterProfileForm({ initialData, roleId = 3 }: Props) {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  
  const parseAddress = (addrRaw: any) => {
    if (typeof addrRaw === 'object' && addrRaw !== null) return addrRaw;
    if (typeof addrRaw === 'string') {
      try {
        return JSON.parse(addrRaw);
      } catch {
        return { country: 'United States', state: 'CA', city: 'San Francisco', zipCode: '94105', addressLine1: addrRaw };
      }
    }
    return { country: 'United States', state: 'CA', city: 'San Francisco', zipCode: '94105', addressLine1: '' };
  };

  const [formData, setFormData] = useState({
    businessName: initialData?.businessName || '',
    businessCategory: initialData?.businessCategory || '',
    about: initialData?.about || '',
    foundationDate: initialData?.foundationDate ? new Date(initialData.foundationDate).toISOString().split('T')[0] : '',
    purpose: initialData?.purpose || '',
    contactPhone: initialData?.contactPhone || '',
    contactEmail: initialData?.contactEmail || '',
    addressObj: parseAddress(initialData?.address),
    websiteUrl: initialData?.websiteUrl || '',
    linkedinUrl: initialData?.linkedinUrl || '',
    instagramUrl: initialData?.instagramUrl || '',
    facebookUrl: initialData?.facebookUrl || '',
    gstNumber: initialData?.gstNumber || '',
  });

  // Cascading Location selector state derivation
  const currentCountryName = formData.addressObj.country || 'United States';
  const currentCountryObj =
    COUNTRIES_DATA.find(
      (c) =>
        c.name.toLowerCase() === currentCountryName.toLowerCase() ||
        c.code.toLowerCase() === currentCountryName.toLowerCase()
    ) || COUNTRIES_DATA[0];

  const availableStates = currentCountryObj ? currentCountryObj.states : [];

  const currentStateCode = formData.addressObj.state || '';
  const currentStateObj = availableStates.find(
    (s) =>
      s.code.toLowerCase() === currentStateCode.toLowerCase() ||
      s.name.toLowerCase() === currentStateCode.toLowerCase()
  );

  const availableCities = currentStateObj ? currentStateObj.cities : [];

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, addressObj: { ...prev.addressObj, [name]: value } }));
  };

  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    const countryObj = COUNTRIES_DATA.find((c) => c.name === selectedCountry) || COUNTRIES_DATA[0];
    const defaultState = countryObj.states[0]?.code || '';
    const defaultCityObj = countryObj.states[0]?.cities[0];

    setFormData((prev) => ({
      ...prev,
      addressObj: {
        ...prev.addressObj,
        country: selectedCountry,
        state: defaultState,
        city: defaultCityObj?.name || '',
        zipCode: defaultCityObj?.defaultZip || '',
      },
    }));
  };

  const handleStateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateCode = e.target.value;
    const stateObj = availableStates.find((s) => s.code === selectedStateCode);
    const defaultCityObj = stateObj?.cities[0];

    setFormData((prev) => ({
      ...prev,
      addressObj: {
        ...prev.addressObj,
        state: selectedStateCode,
        city: defaultCityObj?.name || '',
        zipCode: defaultCityObj?.defaultZip || '',
      },
    }));
  };

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCityName = e.target.value;
    const cityObj = availableCities.find((c) => c.name === selectedCityName);

    setFormData((prev) => ({
      ...prev,
      addressObj: {
        ...prev.addressObj,
        city: selectedCityName,
        zipCode: cityObj?.defaultZip || prev.addressObj.zipCode || '',
      },
    }));
  };

  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories/business');
        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            setCategories(result.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch business categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProfile) return;
    setLoading(true);
    setMessage({ text: '', type: '' });

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'addressObj') {
        data.append('address', JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        data.append(key, value.toString());
      }
    });
    if (logoFile) data.append('logo', logoFile);

    try {
      await updateProfile(data, roleId);
      setMessage({ text: 'Business profile updated!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      
      {/* Business Information */}
      <div id="business-info">
        <div className="row">
          <div className="col-md-6 profile-form-group">
            <label className="profile-label">Business Name</label>
            <input type="text" name="businessName" className="profile-input" placeholder="Your Business Name" value={formData.businessName} onChange={handleInputChange} />
          </div>
          <div className="col-md-6 profile-form-group">
            <label className="profile-label">Business Category</label>
            <select name="businessCategory" className="profile-select" value={formData.businessCategory} onChange={handleInputChange}>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6 profile-form-group">
            <label className="profile-label">Foundation Date</label>
            <input type="date" name="foundationDate" className="profile-input" value={formData.foundationDate} onChange={handleInputChange} />
          </div>
          <div className="col-md-12 profile-form-group">
            <label className="profile-label">Purpose</label>
            <input type="text" name="purpose" className="profile-input" placeholder="What is the primary goal of your promotion?" value={formData.purpose} onChange={handleInputChange} />
          </div>
          <div className="col-md-12 profile-form-group">
            <label className="profile-label">About Business</label>
            <textarea name="about" className="profile-textarea" placeholder="Describe your business..." value={formData.about} onChange={handleInputChange}></textarea>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div id="contact-details">
        <div className="profile-section-divider">
          <span className="profile-section-divider-label">Contact Details</span>
          <div className="profile-section-divider-line" />
        </div>
        <div className="row">
          <div className="col-md-6 profile-form-group">
            <label className="profile-label">Contact Phone</label>
            <input type="tel" name="contactPhone" className="profile-input" placeholder="+1 (555) 345-6789" value={formData.contactPhone} onChange={handleInputChange} />
          </div>
          <div className="col-md-6 profile-form-group">
            <label className="profile-label">Contact Email</label>
            <input type="email" name="contactEmail" className="profile-input" placeholder="contact@business.com" value={formData.contactEmail} onChange={handleInputChange} />
          </div>
          <div className="col-md-12 profile-form-group">
            <label className="profile-label">Street Address (Address Line 1)</label>
            <input
              type="text"
              name="addressLine1"
              className="profile-input"
              placeholder="e.g. 123 Market St, Suite 400"
              value={formData.addressObj?.addressLine1 || ''}
              onChange={handleAddressChange}
            />
          </div>
          <div className="col-md-3 profile-form-group">
            <label className="profile-label">Country</label>
            <select
              name="country"
              className="profile-select"
              value={formData.addressObj?.country || 'United States'}
              onChange={handleCountrySelect}
            >
              {COUNTRIES_DATA.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 profile-form-group">
            <label className="profile-label">State / Province</label>
            <select
              name="state"
              className="profile-select"
              value={formData.addressObj?.state || ''}
              onChange={handleStateSelect}
            >
              <option value="">Select State</option>
              {availableStates.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
              <option value="Other">Other / Custom</option>
            </select>
          </div>
          <div className="col-md-3 profile-form-group">
            <label className="profile-label">City</label>
            <select
              name="city"
              className="profile-select"
              value={formData.addressObj?.city || ''}
              onChange={handleCitySelect}
            >
              <option value="">Select City</option>
              {availableCities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="Other">Other City</option>
            </select>
          </div>
          <div className="col-md-3 profile-form-group">
            <label className="profile-label">ZIP / Postal Code</label>
            <input
              type="text"
              name="zipCode"
              className="profile-input"
              placeholder="e.g. 94105"
              value={formData.addressObj?.zipCode || ''}
              onChange={handleAddressChange}
            />
          </div>
          <div className="col-md-12 profile-form-group">
            <label className="profile-label">Tax ID / EIN (Optional)</label>
            <input type="text" name="gstNumber" className="profile-input" placeholder="e.g. 94-3829104" value={formData.gstNumber} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div id="social-links">
        <div className="profile-section-divider">
          <span className="profile-section-divider-label">Links &amp; Socials</span>
          <div className="profile-section-divider-line" />
        </div>
        <div className="row">
          <div className="col-md-6 profile-form-group">
            <label className="profile-label"><i className="bi bi-globe2 me-1" style={{ color: '#60a5fa' }} />Website URL (Optional)</label>
            <input type="url" name="websiteUrl" className="profile-input" placeholder="https://yourbusiness.com" value={formData.websiteUrl} onChange={handleInputChange} />
          </div>
          <div className="col-md-6 profile-form-group">
            <label className="profile-label"><i className="bi bi-linkedin me-1" style={{ color: '#0077b5' }} />LinkedIn URL (Optional)</label>
            <input type="url" name="linkedinUrl" className="profile-input" placeholder="https://linkedin.com/company/..." value={formData.linkedinUrl} onChange={handleInputChange} />
          </div>
          <div className="col-md-6 profile-form-group">
            <label className="profile-label"><i className="bi bi-instagram me-1" style={{ color: '#e1306c' }} />Instagram URL (Optional)</label>
            <input type="url" name="instagramUrl" className="profile-input" placeholder="https://instagram.com/..." value={formData.instagramUrl} onChange={handleInputChange} />
          </div>
          <div className="col-md-6 profile-form-group">
            <label className="profile-label"><i className="bi bi-facebook me-1" style={{ color: '#1877f2' }} />Facebook URL (Optional)</label>
            <input type="url" name="facebookUrl" className="profile-input" placeholder="https://facebook.com/..." value={formData.facebookUrl} onChange={handleInputChange} />
          </div>
        </div>

        {/* Logo */}
        <div className="profile-form-group mt-2">
          <label className="profile-label">Business Logo</label>
          <div className="profile-file-upload">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <i className="bi bi-image" style={{ fontSize: '1.8rem', color: '#334155' }}></i>
            {logoFile ? (
              <div className="mt-2" style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600 }}>{logoFile.name}</div>
            ) : (
              <div className="mt-2" style={{ color: '#475569', fontSize: '0.85rem' }}>
                {initialData?.logoUrl ? 'Drop a new image to replace current logo' : 'Click or drag your logo here'}
              </div>
            )}
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`profile-message ${message.type}`}>
          <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`} />
          {message.text}
        </div>
      )}

      <div className="profile-actions">
        <button type="submit" className="btn-profile-save" disabled={loading}>
          {loading ? <><span className="spinner-border spinner-border-sm me-2" /> Saving…</> : <><i className="bi bi-floppy me-2" /> Save Changes</>}
        </button>
      </div>
    </form>
  );
}

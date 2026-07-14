"use client";
import React, { useState, useEffect } from 'react';
import './JobFilters.css';

interface FilterState {
  categories: string[];
  jobTypes: string[];
  workModes: string[];
  experience: string[];
  salaryRange: string;
  companySize: string[];
  postedDate: string;
  skills: string[];
}

interface JobFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const filterData = {
  jobTypes: ['Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship'],
  workModes: ['Remote', 'Hybrid', 'On-site'],
  experience: ['Entry Level (0-2 yrs)', 'Mid Level (2-5 yrs)', 'Senior (5-10 yrs)', 'Executive (10+ yrs)'],
  salaryRanges: [
    { label: 'Any Salary', value: '' },
    { label: '₹0 – ₹3 LPA', value: '0-3' },
    { label: '₹3 – ₹6 LPA', value: '3-6' },
    { label: '₹6 – ₹10 LPA', value: '6-10' },
    { label: '₹10 – ₹20 LPA', value: '10-20' },
    { label: '₹20 – ₹40 LPA', value: '20-40' },
    { label: '₹40 LPA+', value: '40+' },
  ],
  companySizes: ['1-10', '11-50', '51-200', '201-500', '500-1000', '1000+'],
  postedDates: [
    { label: 'Any time', value: '' },
    { label: 'Last 24 hours', value: '1' },
    { label: 'Last 3 days', value: '3' },
    { label: 'Last 7 days', value: '7' },
    { label: 'Last 14 days', value: '14' },
    { label: 'Last 30 days', value: '30' },
  ],
  skills: [
    'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker',
    'MongoDB', 'PostgreSQL', 'GraphQL', 'Figma', 'Vue.js', 'Next.js',
  ],
};

const defaultFilters: FilterState = {
  categories: [],
  jobTypes: [],
  workModes: [],
  experience: [],
  salaryRange: '',
  companySize: [],
  postedDate: '',
  skills: [],
};

const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFiltersChange, mobileOpen, onMobileClose }) => {
  const [openSections, setOpenSections] = useState<string[]>(['categories', 'jobTypes', 'workModes']);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);

  // Fetch categories from admin-managed DB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories/job');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setCategoryNames(json.data.map((c: any) => c.name));
        }
      } catch (err) {
        console.error('Failed to fetch job categories for filters:', err);
      }
    };
    fetchCategories();
  }, []);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const toggleMulti = (field: keyof Pick<FilterState, 'categories' | 'jobTypes' | 'workModes' | 'experience' | 'companySize' | 'skills'>, value: string) => {
    const current = filters[field] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [field]: updated });
  };

  const setSingle = (field: 'salaryRange' | 'postedDate', value: string) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const clearAll = () => onFiltersChange(defaultFilters);

  const totalActive =
    filters.categories.length + filters.jobTypes.length + filters.workModes.length +
    filters.experience.length + filters.companySize.length + filters.skills.length +
    (filters.salaryRange ? 1 : 0) + (filters.postedDate ? 1 : 0);

  const renderSection = (
    id: string,
    title: string,
    icon: string,
    content: React.ReactNode
  ) => (
    <div className="jf-section" key={id}>
      <button
        className={`jf-section-header ${openSections.includes(id) ? 'open' : ''}`}
        onClick={() => toggleSection(id)}
        aria-expanded={openSections.includes(id)}
        aria-controls={`jf-body-${id}`}
        id={`jf-toggle-${id}`}
        type="button"
      >
        <span className="jf-section-title">
          <i className={`bi ${icon} me-2`} />
          {title}
        </span>
        <i className={`bi bi-chevron-down jf-chevron ${openSections.includes(id) ? 'rotated' : ''}`} />
      </button>
      <div
        className={`jf-section-body ${openSections.includes(id) ? 'expanded' : ''}`}
        id={`jf-body-${id}`}
      >
        {content}
      </div>
    </div>
  );

  const sidebar = (
    <aside className={`job-filters-sidebar ${mobileOpen ? 'mobile-open' : ''}`} aria-label="Job filters">
      {/* Sidebar Header */}
      <div className="jf-header">
        <div className="jf-header-left">
          <i className="bi bi-sliders me-2" />
          <span>Filters</span>
          {totalActive > 0 && (
            <span className="jf-active-count">{totalActive}</span>
          )}
        </div>
        <div className="jf-header-right">
          {totalActive > 0 && (
            <button className="jf-clear-btn" onClick={clearAll} id="jf-clear-all" type="button">
              Clear All
            </button>
          )}
          <button
            className="jf-close-mobile d-lg-none"
            onClick={onMobileClose}
            aria-label="Close filters"
            id="jf-close-mobile-btn"
            type="button"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
      </div>

      <div className="jf-body">
        {/* Job Categories — from DB */}
        {renderSection('categories', 'Job Category', 'bi-briefcase', (
          <div className="jf-checkboxes">
            {categoryNames.map((cat) => (
              <label key={cat} className="jf-checkbox-label" htmlFor={`cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}>
                <input
                  type="checkbox"
                  id={`cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                  className="jf-checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={() => toggleMulti('categories', cat)}
                />
                <span className="jf-checkbox-custom" />
                <span className="jf-checkbox-text">{cat}</span>
              </label>
            ))}
          </div>
        ))}

        {/* Job Type */}
        {renderSection('jobTypes', 'Job Type', 'bi-clock', (
          <div className="jf-checkboxes">
            {filterData.jobTypes.map((type) => (
              <label key={type} className="jf-checkbox-label" htmlFor={`type-${type.replace(/\s+/g, '-').toLowerCase()}`}>
                <input
                  type="checkbox"
                  id={`type-${type.replace(/\s+/g, '-').toLowerCase()}`}
                  className="jf-checkbox"
                  checked={filters.jobTypes.includes(type)}
                  onChange={() => toggleMulti('jobTypes', type)}
                />
                <span className="jf-checkbox-custom" />
                <span className="jf-checkbox-text">{type}</span>
              </label>
            ))}
          </div>
        ))}

        {/* Work Mode */}
        {renderSection('workModes', 'Work Mode', 'bi-building', (
          <div className="jf-checkboxes">
            {filterData.workModes.map((mode) => (
              <label key={mode} className="jf-checkbox-label" htmlFor={`mode-${mode.toLowerCase()}`}>
                <input
                  type="checkbox"
                  id={`mode-${mode.toLowerCase()}`}
                  className="jf-checkbox"
                  checked={filters.workModes.includes(mode)}
                  onChange={() => toggleMulti('workModes', mode)}
                />
                <span className="jf-checkbox-custom" />
                <span className="jf-checkbox-text">{mode}</span>
              </label>
            ))}
          </div>
        ))}

        {/* Experience Level */}
        {renderSection('experience', 'Experience Level', 'bi-bar-chart', (
          <div className="jf-checkboxes">
            {filterData.experience.map((exp) => (
              <label key={exp} className="jf-checkbox-label" htmlFor={`exp-${exp.replace(/[\s()\/+]/g, '-').toLowerCase()}`}>
                <input
                  type="checkbox"
                  id={`exp-${exp.replace(/[\s()\/+]/g, '-').toLowerCase()}`}
                  className="jf-checkbox"
                  checked={filters.experience.includes(exp)}
                  onChange={() => toggleMulti('experience', exp)}
                />
                <span className="jf-checkbox-custom" />
                <span className="jf-checkbox-text">{exp}</span>
              </label>
            ))}
          </div>
        ))}

        {/* Salary Range */}
        {renderSection('salary', 'Salary Range', 'bi-currency-rupee', (
          <div className="jf-radios">
            {filterData.salaryRanges.map((range) => (
              <label key={range.value} className="jf-radio-label" htmlFor={`sal-${range.value || 'any'}`}>
                <input
                  type="radio"
                  id={`sal-${range.value || 'any'}`}
                  name="salary"
                  className="jf-radio"
                  checked={filters.salaryRange === range.value}
                  onChange={() => setSingle('salaryRange', range.value)}
                />
                <span className="jf-radio-custom" />
                <span className="jf-radio-text">{range.label}</span>
              </label>
            ))}
          </div>
        ))}

        {/* Company Size */}
        {renderSection('companySize', 'Company Size', 'bi-people', (
          <div className="jf-checkboxes">
            {filterData.companySizes.map((size) => (
              <label key={size} className="jf-checkbox-label" htmlFor={`size-${size}`}>
                <input
                  type="checkbox"
                  id={`size-${size}`}
                  className="jf-checkbox"
                  checked={filters.companySize.includes(size)}
                  onChange={() => toggleMulti('companySize', size)}
                />
                <span className="jf-checkbox-custom" />
                <span className="jf-checkbox-text">{size} employees</span>
              </label>
            ))}
          </div>
        ))}

        {/* Posted Date */}
        {renderSection('postedDate', 'Date Posted', 'bi-calendar3', (
          <div className="jf-radios">
            {filterData.postedDates.map((date) => (
              <label key={date.value} className="jf-radio-label" htmlFor={`date-${date.value || 'any'}`}>
                <input
                  type="radio"
                  id={`date-${date.value || 'any'}`}
                  name="postedDate"
                  className="jf-radio"
                  checked={filters.postedDate === date.value}
                  onChange={() => setSingle('postedDate', date.value)}
                />
                <span className="jf-radio-custom" />
                <span className="jf-radio-text">{date.label}</span>
              </label>
            ))}
          </div>
        ))}

        {/* Skills */}
        {renderSection('skills', 'Required Skills', 'bi-code-slash', (
          <div className="jf-skills-grid">
            {filterData.skills.map((skill) => (
              <button
                key={skill}
                type="button"
                className={`jf-skill-tag ${filters.skills.includes(skill) ? 'active' : ''}`}
                onClick={() => toggleMulti('skills', skill)}
                id={`skill-${skill.toLowerCase()}`}
                aria-pressed={filters.skills.includes(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {mobileOpen && (
        <div
          className="jf-overlay d-lg-none"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      {sidebar}
    </>
  );
};

export { defaultFilters };
export type { FilterState };
export default JobFilters;

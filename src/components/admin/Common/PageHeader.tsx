import Link from 'next/link';
import './PageHeader.css';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export default function PageHeader({ title, subtitle, breadcrumbs = [] }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {breadcrumbs.length > 0 && (
        <nav className="page-header-breadcrumb" aria-label="Breadcrumb">
          <ol>
            {breadcrumbs.map((crumb, index) => (
              <li key={index}>
                {crumb.path ? (
                  <Link href={crumb.path}>{crumb.label}</Link>
                ) : (
                  <span className="current">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
}

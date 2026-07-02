"use client";
import React from 'react';
import './BlogSection.css';
import blogCareerTips from '../../assets/images/blog_career_tips.png';
import blogIndustryInsights from '../../assets/images/blog_industry_insights.png';
import blogSalaryGuide from '../../assets/images/blog_salary_guide.png';

interface BlogPost {
  id: number;
  image: any;
  imageAlt: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  date: string;
  author: string;
  authorInitials: string;
  authorAvatarColor: string;
  readTime: string;
  title: string;
  excerpt: string;
}

const blogs: BlogPost[] = [
  {
    id: 1,
    image: blogCareerTips,
    imageAlt: 'Career coach presenting strategies on a whiteboard',
    category: 'Career Tips',
    categoryColor: '#2454FF',
    categoryBg: 'rgba(36,84,255,0.1)',
    date: 'May 18, 2024',
    author: 'Sarah Johnson',
    authorInitials: 'SJ',
    authorAvatarColor: '#2454FF',
    readTime: '5 min read',
    title: '10 Resume Mistakes That Are Costing You Interviews in 2024',
    excerpt:
      'Discover the most common resume mistakes job seekers make and learn how to fix them to dramatically increase your interview rate.',
  },
  {
    id: 2,
    image: blogIndustryInsights,
    imageAlt: 'Tech professionals reviewing hiring data on a laptop',
    category: 'Industry Insights',
    categoryColor: '#7B3EFF',
    categoryBg: 'rgba(123,62,255,0.1)',
    date: 'May 15, 2024',
    author: 'Marcus Lee',
    authorInitials: 'ML',
    authorAvatarColor: '#7B3EFF',
    readTime: '7 min read',
    title: 'Tech Job Market in 2024: What You Need to Know',
    excerpt:
      "The tech job market is evolving rapidly. Here's a look at which roles are in demand and what skills companies are paying premiums for.",
  },
  {
    id: 3,
    image: blogSalaryGuide,
    imageAlt: 'Professionals shaking hands after salary negotiation',
    category: 'Salary Guide',
    categoryColor: '#14B87A',
    categoryBg: 'rgba(20,184,122,0.1)',
    date: 'May 12, 2024',
    author: 'Emma Rodriguez',
    authorInitials: 'ER',
    authorAvatarColor: '#14B87A',
    readTime: '6 min read',
    title: 'How to Negotiate Your Salary: Scripts That Actually Work',
    excerpt:
      'Salary negotiation is a skill. Learn proven frameworks, exact scripts, and timing strategies that result in 15–30% higher compensation.',
  },
];

const BlogSection: React.FC = () => {
  return (
    <section className="blog-section section-padding" id="blog" aria-label="Expert advice and insights">
      <div className="container">

        {/* ── Section Header ── */}
        <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-5">
          <div>
            <div className="section-label">
              <i className="bi bi-journal-text me-2"></i>Career Tips
            </div>
            <h2 className="section-heading mb-2">
              Expert <span className="gradient-text">Advice &amp; Insights</span>
            </h2>
            <p className="section-subtext" style={{ margin: 0 }}>
              Stay ahead with the latest career strategies and industry insights
            </p>
          </div>
          <a href="#" className="btn-outline-custom" id="view-all-blog-btn" aria-label="View all articles">
            All Articles <i className="bi bi-arrow-right ms-2"></i>
          </a>
        </div>

        {/* ── Blog Cards Grid ── */}
        <div className="blog-grid">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              id={`blog-card-${blog.id}`}
              className="blog-card"
              aria-label={blog.title}
            >
              {/* Cover Image */}
              <div className="blog-card-img-wrap">
                <img
                  src={blog.image.src || blog.image}
                  alt={blog.imageAlt}
                  className="blog-card-img"
                  loading="lazy"
                />
                {/* Category badge floated over image */}
                <span
                  className="blog-img-badge"
                  style={{ background: blog.categoryColor }}
                >
                  {blog.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="blog-card-body">

                {/* Meta row: date • author */}
                <div className="blog-meta-row">
                  <span className="blog-meta-date">
                    <i className="bi bi-calendar3 me-1"></i>
                    {blog.date}
                  </span>
                  <span className="blog-meta-sep">•</span>
                  <span className="blog-meta-author">
                    <span
                      className="blog-author-initials"
                      style={{ background: blog.authorAvatarColor }}
                      aria-hidden="true"
                    >
                      {blog.authorInitials}
                    </span>
                    By {blog.author}
                  </span>
                </div>

                {/* Category tag */}
                <span
                  className="blog-category-tag"
                  style={{ color: blog.categoryColor, background: blog.categoryBg }}
                >
                  <i className="bi bi-tag me-1"></i>
                  {blog.category}
                </span>

                {/* Title */}
                <h3 className="blog-title">{blog.title}</h3>

                {/* Excerpt */}
                <p className="blog-excerpt">{blog.excerpt}</p>

                {/* Footer */}
                <div className="blog-card-footer">
                  <span className="blog-read-time">
                    <i className="bi bi-clock me-1"></i>
                    {blog.readTime}
                  </span>
                  <a
                    href="#"
                    className="blog-read-link"
                    id={`blog-read-${blog.id}`}
                    aria-label={`Read article: ${blog.title}`}
                  >
                    Read More <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>

              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BlogSection;

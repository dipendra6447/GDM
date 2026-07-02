
/* ============================================
   MOCK OPPORTUNITY DATA
   ============================================ */

export type OpportunityType = 'job' | 'gig' | 'business' | 'service' | 'event';

export interface Opportunity {
  id: number;
  type: OpportunityType;
  title: string;
  subtitle: string; // company / provider / organizer
  location: string;
  distance?: string;
  badge?: 'Featured' | 'New' | 'Popular' | 'Hot' | 'Verified';
  badgeColor?: string;
  categoryLabel: string;
  categoryColor: string;
  thumbnailGradient: string;
  // type-specific
  salary?: string;
  rating?: number;
  reviewCount?: number;
  price?: string;
  deliveryTime?: string;
  eventDate?: string;
  eventTime?: string;
  openStatus?: string;
  postedTime?: string;
  saved?: boolean;
}

// ── Top Picks ──
export const topPicks: Opportunity[] = [
  {
    id: 1,
    type: 'job',
    title: 'Marketing Manager',
    subtitle: 'BrightWave Solutions',
    location: 'Dayton, OH',
    distance: '5 mi',
    badge: 'Featured',
    badgeColor: '#2454FF',
    categoryLabel: 'Full-time',
    categoryColor: '#14B87A',
    thumbnailGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    salary: '$60K - $80K / year',
  },
  {
    id: 2,
    type: 'service',
    title: 'Home Repair Service',
    subtitle: 'Fix It Right',
    location: 'Dayton, OH',
    distance: '8 mi',
    badge: 'New',
    badgeColor: '#7B3EFF',
    categoryLabel: 'Service',
    categoryColor: '#F59E0B',
    thumbnailGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    rating: 4.8,
    reviewCount: 120,
  },
  {
    id: 3,
    type: 'business',
    title: 'Corner Coffee Co.',
    subtitle: 'Coffee Shop',
    location: 'Dayton, OH',
    distance: '3 mi',
    badge: 'Popular',
    badgeColor: '#EF4444',
    categoryLabel: 'Business',
    categoryColor: '#2454FF',
    thumbnailGradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    rating: 4.9,
    reviewCount: 86,
  },
  {
    id: 4,
    type: 'gig',
    title: 'UI/UX Design',
    subtitle: 'by Alex Morgan',
    location: 'Dayton, OH • Remote',
    badge: undefined,
    categoryLabel: 'Gig',
    categoryColor: '#7B3EFF',
    thumbnailGradient: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    price: 'Starting at $250',
  },
  {
    id: 5,
    type: 'event',
    title: 'Summer Music Fest',
    subtitle: 'Riverside Events',
    location: 'Dayton, OH',
    distance: '6 mi',
    badge: 'New',
    badgeColor: '#14B87A',
    categoryLabel: 'Event',
    categoryColor: '#EF4444',
    thumbnailGradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    eventDate: 'May 25, 2026',
    eventTime: '7:00 PM',
  },
];

// ── Recently Posted ──
export interface RecentItem {
  id: number;
  title: string;
  company: string;
  category: string;
  location: string;
  postedTime: string;
  avatarInitials: string;
  avatarColor: string;
  avatarBg: string;
}

export const recentlyPosted: RecentItem[] = [
  {
    id: 101,
    title: 'Graphic Designer',
    company: 'Design Studio',
    category: 'Full-time',
    location: 'Dayton, OH',
    postedTime: '2h ago',
    avatarInitials: 'DS',
    avatarColor: '#2454FF',
    avatarBg: '#EBF0FF',
  },
  {
    id: 102,
    title: 'Photographer',
    company: 'Capture Moments',
    category: 'Gig',
    location: 'Dayton, OH',
    postedTime: '3h ago',
    avatarInitials: 'CM',
    avatarColor: '#7B3EFF',
    avatarBg: '#F3EEFF',
  },
  {
    id: 103,
    title: 'Delivery Driver',
    company: 'Swift Logistics',
    category: 'Part-time',
    location: 'Dayton, OH',
    postedTime: '3h ago',
    avatarInitials: 'SL',
    avatarColor: '#14B87A',
    avatarBg: '#E8FFF5',
  },
  {
    id: 104,
    title: 'Event Planner',
    company: 'Celebrations Co.',
    category: 'Part-time',
    location: 'Dayton, OH',
    postedTime: '4h ago',
    avatarInitials: 'CC',
    avatarColor: '#F59E0B',
    avatarBg: '#FFF8E6',
  },
  {
    id: 105,
    title: 'Personal Trainer',
    company: 'FitLife Gym',
    category: 'Service',
    location: 'Dayton, OH',
    postedTime: '6h ago',
    avatarInitials: 'FL',
    avatarColor: '#EF4444',
    avatarBg: '#FFF0F0',
  },
  {
    id: 106,
    title: "Bella's Boutique",
    company: 'Boutique Store',
    category: 'Business',
    location: 'Dayton, OH',
    postedTime: '7h ago',
    avatarInitials: 'BB',
    avatarColor: '#7B3EFF',
    avatarBg: '#F3EEFF',
  },
];

// ── Trending Searches ──
export interface TrendingItem {
  label: string;
  percentage: number;
}

export const trendingSearches: TrendingItem[] = [
  { label: 'Marketing Jobs', percentage: 32 },
  { label: 'Graphic Design Gigs', percentage: 28 },
  { label: 'Home Cleaning Services', percentage: 21 },
  { label: 'Event Planning', percentage: 17 },
  { label: 'Local Cafes', percentage: 15 },
];

// ── Stats ──
export interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}

export const marketplaceStats: StatItem[] = [
  { value: 125, suffix: 'K+', label: 'Jobs', icon: 'bi-briefcase' },
  { value: 50, suffix: 'K+', label: 'Freelancers', icon: 'bi-person-workspace' },
  { value: 12, suffix: 'K+', label: 'Businesses', icon: 'bi-shop' },
  { value: 8, suffix: 'K+', label: 'Events', icon: 'bi-calendar-event' },
  { value: 1, suffix: 'M+', label: 'Users', icon: 'bi-people' },
];

// ══════════════════════════════════════════════════════════════════════════
//  NAVIGATION CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════
//
//  Navigation links are automatically filtered by the SECTIONS toggle
//  in src/data/site-config.js. If a section is disabled there, the nav
//  link disappears from the Navbar and Footer automatically.
//
//  To hide a link without touching site-config, comment it out below.
//
// ══════════════════════════════════════════════════════════════════════════

import { SECTIONS } from '@data/site-config';

// ── Section key lookup  (path → SECTIONS key) ─────────────────────────────
// Home and About are always visible — they have no SECTIONS key.
const PATH_TO_SECTION = {
  '/notices':   'notices',
  '/events':    'events',
  '/resources': 'resources',
  '/projects':  'projects',
  '/senior-projects': 'seniorProjects',
  '/grievance': 'grievance',
  '/contact':   'contact',
  '/mock-tests': 'mockTests',
  '/student-repos': 'studentRepos',
};

const ALL_NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Notices', path: '/notices' },
  { label: 'Events', path: '/events' },
  { label: 'Resources', path: '/resources' },
  { label: 'Mock Tests', path: '/mock-tests' },
  { label: 'Projects', path: '/senior-projects' },
  { label: 'Code Hub', path: '/student-repos' },
  { label: 'Projects', path: '/projects' },
  { label: 'Grievance', path: '/grievance' },
  { label: 'Contact', path: '/contact' },
];

/** Filtered nav links — respects SECTIONS toggle */
export const NAV_LINKS = ALL_NAV_LINKS.filter((link) => {
  const sectionKey = PATH_TO_SECTION[link.path];
  return !sectionKey || SECTIONS[sectionKey] !== false;
});

// ── Social Media Links ─────────────────────────────────────────────────────
// Used in Footer component. To hide, leave the value as an empty string.

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/aei_cet/',
  // email: '',
  // linkedin: '',
  // youtube: '',  // Commented out = hidden
  // twitter: '',  // Commented out = hidden
};

// ── Brand Information ──────────────────────────────────────────────────────

export const BRAND = {
  siteName: 'AEI Association',
  departmentShort: 'AEI',
  departmentFull: 'Applied Electronics and Instrumentation',
  collegeShort: 'CET',
  collegeFull: 'College of Engineering Trivandrum',
  tagline: 'Your one-stop hub for notices, events, resources & support',
};

// ── Footer Credit ──────────────────────────────────────────────────────────

export const FOOTER_CREDIT = 'Made by AEI Association 2025-26';

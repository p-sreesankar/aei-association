import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  Megaphone, CalendarDays, FolderDown,
  MessageSquareWarning, Users, ArrowRight, Pin, FolderGit2,
  Paperclip, ChevronRight,
} from 'lucide-react';
import SEO from '@components/SEO';
import { SITE_CONFIG, SECTIONS } from '@data/site-config';
import { NOTICES } from '@data/notices';
import { EVENTS } from '@data/events';
import { ABOUT } from '@data/about';
import { SectionWrapper } from '@components/layout';
import { Badge, Button, Card, EmptyState, SectionHeader, Ticker } from '@components/ui';
import { formatDate, isUpcoming } from '@utils/date';

// ── Hero Theme ───────────────────────────────────────────────────────────
// Swap the comment to switch hero theme instantly:
// import HeroNavyAmber from '@components/ui/HeroNavyAmber';
import HeroLightBlue from '@components/ui/HeroLightBlue';

// ══════════════════════════════════════════════════════════════════════════════
//  QUICK LINKS — Config for the 6-card grid
// ══════════════════════════════════════════════════════════════════════════════

const quickLinks = [
  {
    to: '/notices',
    section: 'notices',
    label: 'Notices',
    description: 'Latest announcements & updates',
    icon: Megaphone,
    color: 'bg-primary-soft text-primary',
    hoverBorder: 'hover:border-border-bright',
  },
  {
    to: '/events',
    section: 'events',
    label: 'Events',
    description: 'Workshops, fests & seminars',
    icon: CalendarDays,
    color: 'bg-primary-soft text-primary',
    hoverBorder: 'hover:border-border-bright',
  },

  {
    to: '/resources',
    section: 'resources',
    label: 'Resources',
    description: 'Downloads, manuals & forms',
    icon: FolderDown,
    color: 'bg-primary-soft text-primary',
    hoverBorder: 'hover:border-border-bright',
  },
  {
    to: '/senior-projects',
    section: 'seniorProjects',
    label: 'Senior Projects',
    description: 'Final-year project topics & teams',
    icon: FolderGit2,
    color: 'bg-primary-soft text-primary',
    hoverBorder: 'hover:border-border-bright',
  },
  {
    to: '/projects',
    section: 'projects',
    label: 'Projects',
    description: 'Student innovations & builds',
    icon: FolderGit2,
    color: 'bg-primary-soft text-primary',
    hoverBorder: 'hover:border-border-bright',
  },
  {
    to: '/grievance',
    section: 'grievance',
    label: 'Grievance',
    description: 'Submit concerns anonymously',
    icon: MessageSquareWarning,
    color: 'bg-[rgba(239,68,68,0.12)] text-red-400',
    hoverBorder: 'hover:border-border-bright',
  },
  {
    to: '/contact',
    section: 'contact',
    label: 'Contact',
    description: 'Reach out to faculty & reps',
    icon: Users,
    color: 'bg-primary-soft text-primary',
    hoverBorder: 'hover:border-border-bright',
  },
].filter((link) => SECTIONS[link.section] !== false);

// ══════════════════════════════════════════════════════════════════════════════
//  DATA HELPERS
// ══════════════════════════════════════════════════════════════════════════════

// 3 most recent notices (pinned first, then by date)
const latestNotices = [...NOTICES]
  .sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  })
  .slice(0, 3);

// 2 nearest upcoming events (sorted by date ascending)
const upcomingEvents = [...EVENTS]
  .filter((e) => isUpcoming(e.date))
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 2);

// ══════════════════════════════════════════════════════════════════════════════
//  ANIMATION VARIANTS
// ══════════════════════════════════════════════════════════════════════════════

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ══════════════════════════════════════════════════════════════════════════════
//  HOME PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function Home() {
  return (
    <>
      <SEO description="Your one-stop hub for notices, events, resources & support — AEI Department, College of Engineering Trivandrum." />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  1. HERO — swap component to change theme                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <HeroLightBlue />

      {/* ─── Marquee Strip — mid blue bg, subtle ────────────────── */}
      <Ticker
        items={['Notice Board', 'Events', 'Gallery', 'Resources', 'Grievance', 'Contact']}
        separator="•"
        className="py-3 font-heading font-semibold text-sm md:text-base tracking-wide"
        style={{
          backgroundColor: '#0F2744',
          color: '#7DD3FC',
          borderTop: '1px solid rgba(14,165,233,0.15)',
          borderBottom: '1px solid rgba(14,165,233,0.15)',
        }}
        separatorColor="#0EA5E9"
        speed={25}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  2. QUICK LINKS GRID                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <SectionWrapper background="white" id="explore">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <SectionHeader
            title="Explore"
            subtitle="Everything you need, one tap away"
            number={1}
            eyebrow="Quick Access"
            centered
            showAccent
          />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
        >
          {quickLinks.map((link) => (
            <motion.div key={link.to} variants={staggerItem}>
              <Link to={link.to} className="block h-full">
                <div className={`
                  bg-surface rounded-lg border border-border
                  shadow-card p-4 sm:p-6 text-center
                  transition-all duration-200
                  hover:shadow-card-hover hover:-translate-y-1
                  hover:bg-surface2 hover:border-border-bright
                  ${link.hoverBorder}
                  h-full flex flex-col items-center gap-2 sm:gap-3
                `}>
                  {/* Icon */}
                  <span className={`p-2.5 sm:p-3 rounded-xl ${link.color} transition-transform group-hover:scale-110`}>
                    <link.icon size={20} className="sm:w-6 sm:h-6" />
                  </span>

                  {/* Title */}
                  <span className="text-body sm:text-h4 font-heading font-semibold text-text-primary">
                    {link.label}
                  </span>

                  {/* Description — hidden on very small screens for cleaner 2-col */}
                  <span className="text-caption sm:text-body-sm text-text-muted hidden sm:block">
                    {link.description}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  3. LATEST NOTICES (Preview)                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <SectionWrapper background="default" id="latest-notices">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <SectionHeader
            title="Latest Notices"
            subtitle="Stay updated with important announcements"
            number={2}
            eyebrow="Latest Updates"
            sticker=""
            showAccent
          />
        </motion.div>

        {latestNotices.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-8"
          >
            <Card>
              <EmptyState
                icon="inbox"
                title="No notices yet"
                subtitle="Check back soon — we'll post updates here! "
              />
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-8 space-y-4"
          >
            {latestNotices.map((notice) => (
              <motion.div key={notice.id} variants={staggerItem}>
                <Card clickable className="group">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Left: Content */}
                    <div className="flex-1 min-w-0">
                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {notice.pinned && (
                          <Badge variant="urgent">
                            <Pin size={12} className="mr-1" />
                            Pinned
                          </Badge>
                        )}
                        <Badge variant="general">Notice</Badge>
                      </div>

                      {/* Title */}
                      <h3 className="text-h4 font-heading font-semibold text-text-primary group-hover:text-primary transition-colors mb-1 line-clamp-2">
                        {notice.title}
                      </h3>

                      {/* Date */}
                      <p className="text-caption text-text-muted mb-2">
                        {formatDate(notice.date)}
                      </p>

                      {/* Description (truncated) */}
                      <p className="text-body-sm text-text-secondary line-clamp-2">
                        {notice.description}
                      </p>

                      {/* Attachment Indicator */}
                      {notice.attachmentUrl && (
                        <div className="flex items-center gap-1 mt-2 text-caption text-primary">
                          <Paperclip size={12} />
                          <span>Attachment available</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Arrow */}
                    <div className="hidden sm:flex items-center self-center">
                      <ChevronRight size={20} className="text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* View All Link */}
            <motion.div variants={staggerItem} className="pt-2">
              <Link
                to="/notices"
                className="inline-flex items-center gap-2 text-body font-heading font-semibold text-primary hover:text-primary-bright transition-colors group"
              >
                View all notices
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </SectionWrapper>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  4. UPCOMING EVENTS (Preview)                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <SectionWrapper background="white" id="upcoming-events">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <SectionHeader
            title="Upcoming Events"
            subtitle="Mark your calendar for what's coming up"
            number={3}
            eyebrow="What's Coming"
            sticker=""
            showAccent
            accentColor="accent"
          />
        </motion.div>

        {upcomingEvents.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-8"
          >
            <Card>
              <EmptyState
                icon="calendar"
                title="No upcoming events"
                subtitle="All caught up! New events will be posted here soon "
              />
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-8 space-y-4"
          >
            {upcomingEvents.map((event) => {
              const hideDate = Boolean(event.hideDate);
              const eventDate = new Date(event.date);
              const day = eventDate.getDate();
              const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();

              return (
                <motion.div key={event.id} variants={staggerItem}>
                  <Card clickable className="group">
                    <div className="flex gap-3 sm:gap-5">
                      {/* Date Block */}
                      {!hideDate ? (
                        <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-[rgba(245,158,11,0.15)] to-[rgba(245,158,11,0.08)] flex flex-col items-center justify-center border border-[rgba(245,158,11,0.2)]">
                          <span className="text-h4 sm:text-h3 md:text-h2 font-heading font-bold text-accent leading-none">
                            {day}
                          </span>
                          <span className="text-caption font-heading font-semibold text-accent uppercase tracking-wider">
                            {month}
                          </span>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-primary-soft to-[rgba(14,165,233,0.08)] flex items-center justify-center border border-[rgba(14,165,233,0.2)]">
                          <span className="text-caption sm:text-body-sm font-heading font-semibold text-primary uppercase tracking-wider text-center px-1">
                            Coming Soon
                          </span>
                        </div>
                      )}

                      {/* Event Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="event">Event</Badge>
                          {event.registrationUrl && (
                            <Badge variant="success">Registration Open</Badge>
                          )}
                        </div>

                        <h3 className="text-h4 font-heading font-semibold text-text-primary group-hover:text-primary transition-colors mb-1 line-clamp-1">
                          {event.title}
                        </h3>

                        <p className="text-body-sm text-text-muted">
                          {event.venue}
                          {event.time && ` · ${event.time}`}
                        </p>

                        <p className="text-body-sm text-text-secondary mt-2 line-clamp-2 hidden sm:block">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* View All Link */}
            <motion.div variants={staggerItem} className="pt-2">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 text-body font-heading font-semibold text-primary hover:text-primary-bright transition-colors group"
              >
                View all events
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </SectionWrapper>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  5. ABOUT SNIPPET                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <SectionWrapper background="primary-light" id="about-preview">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="max-w-3xl mx-auto text-center"
        >
          <SectionHeader
            title="Who We Are"
            subtitle={ABOUT.heading}
            number={4}
            eyebrow="About Us"
            centered
            showAccent
          />

          {/* 2-3 lines snippet from about data */}
          <p className="text-body-lg text-text-secondary mt-6 leading-relaxed">
            {ABOUT.paragraphs[0]?.length > 200 
              ? ABOUT.paragraphs[0].substring(0, 200).trim() + '...'
              : ABOUT.paragraphs[0]
            }
          </p>

          <div className="mt-8">
            <Link to="/about">
              <Button
                variant="secondary"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Learn more about us
              </Button>
            </Link>
          </div>
        </motion.div>
      </SectionWrapper>
    </>
  );
}

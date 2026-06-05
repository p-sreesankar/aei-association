import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@data/site-config';

/**
 * SEO Component ΓÇö Sets <title> and <meta description> per page
 *
 * Title format:
 *   Home  ΓåÆ "AEI Association ΓÇö AEI, CET"
 *   Other ΓåÆ "Notices | AEI Association ΓÇö AEI"
 *
 * @example
 * <SEO title="Notices" description="Browse the latest department announcements." />
 */
const SUFFIX = `${SITE_CONFIG.siteName} ΓÇö ${SITE_CONFIG.departmentShort}`;

export default function SEO({ title, description }) {
  const fullTitle = title ? `${title} | ${SUFFIX}` : `${SUFFIX}, ${SITE_CONFIG.collegeShort}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
    </Helmet>
  );
}

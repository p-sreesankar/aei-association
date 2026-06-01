import { SITE_CONFIG, SECTIONS } from '../src/data/site-config.js';

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateConfig(config) {
  const errors = [];
  const warnings = [];

  const requiredStrings = [
    ['siteName', config.siteName],
    ['departmentName', config.departmentName],
    ['departmentShort', config.departmentShort],
    ['collegeName', config.collegeName],
    ['collegeShort', config.collegeShort],
    ['tagline', config.tagline],
    ['footerText', config.footerText],
    ['metaDescription', config.metaDescription],
    ['contact.email', config.contact?.email],
  ];

  for (const [name, value] of requiredStrings) {
    if (!value || String(value).trim() === '') {
      errors.push(`Missing required field: SITE_CONFIG.${name}`);
    }
  }

  if (config.contact?.email && !EMAIL_REGEX.test(config.contact.email)) {
    errors.push(`SITE_CONFIG.contact.email is not a valid email address: ${config.contact.email}`);
  }

  const grievanceFormUrl = config.grievanceFormUrl || '';
  if (!grievanceFormUrl || grievanceFormUrl.includes('EXAMPLE_REPLACE_THIS')) {
    errors.push('SITE_CONFIG.grievanceFormUrl still has the placeholder URL.');
  }

  const socialLinks = config.socialLinks || {};
  const activeSocialLinks = Object.values(socialLinks).filter((value) => value && String(value).trim() !== '');
  if (activeSocialLinks.length === 0) {
    errors.push('All SITE_CONFIG.socialLinks are empty. Add at least one social link.');
  }

  const themeColors = config.themeColors || {};
  for (const [key, value] of Object.entries(themeColors)) {
    if (value && !HEX_COLOR_REGEX.test(value)) {
      errors.push(`SITE_CONFIG.themeColors.${key} = "${value}" is not a valid hex color.`);
    }
  }

  const disabledSections = Object.entries(SECTIONS)
    .filter(([, enabled]) => enabled === false)
    .map(([key]) => key);

  if (disabledSections.length > 0) {
    warnings.push(`Disabled sections: ${disabledSections.join(', ')}.`);
  }

  return { errors, warnings };
}

const result = validateConfig(SITE_CONFIG);

console.log('Config validation summary');

if (result.warnings.length > 0) {
  console.log(`Warnings (${result.warnings.length}):`);
  for (const warning of result.warnings) {
    console.log(`- ${warning}`);
  }
}

if (result.errors.length > 0) {
  console.error(`Errors (${result.errors.length}):`);
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('All config validations passed.');
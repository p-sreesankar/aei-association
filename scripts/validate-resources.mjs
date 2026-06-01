import { RESOURCES } from '../src/data/resources.js';

const ALLOWED_FILE_TYPES = new Set([
  'notes',
  'question-paper',
  'answer-key',
  'formula',
  'video',
  'pdf',
  'doc',
  'xls',
  'ppt',
  'img',
  'zip',
  'link',
]);

const REQUIRED_FIELDS = ['id', 'title', 'description', 'category', 'fileType', 'driveLink', 'addedDate'];

function parseSemester(resource) {
  const haystack = [
    resource.category,
    resource.fileType,
    resource.id,
    resource.title,
    resource.description,
    resource.moduleTitle,
  ]
    .filter(Boolean)
    .join(' ');
  const match = haystack.match(/S([1-8])/i);
  return match ? `S${match[1]}` : null;
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime());
}

function hasDriveLikeLink(url) {
  return /^https?:\/\//i.test(url);
}

function containsAny(text, checks) {
  const normalized = (text || '').toLowerCase();
  return checks.some((c) => normalized.includes(c.toLowerCase()));
}

function validateResources(resources) {
  const errors = [];
  const warnings = [];
  const idSeen = new Set();

  resources.forEach((resource, index) => {
    const at = `index ${index} (id: ${resource.id || 'missing'})`;

    for (const field of REQUIRED_FIELDS) {
      if (!resource[field] || `${resource[field]}`.trim() === '') {
        errors.push(`${at}: missing required field '${field}'.`);
      }
    }

    if (resource.id) {
      if (idSeen.has(resource.id)) {
        errors.push(`${at}: duplicate id '${resource.id}'.`);
      }
      idSeen.add(resource.id);
    }

    if (resource.fileType && !ALLOWED_FILE_TYPES.has(resource.fileType)) {
      errors.push(`${at}: invalid fileType '${resource.fileType}'.`);
    }

    if (resource.addedDate && !isValidDate(resource.addedDate)) {
      errors.push(`${at}: invalid addedDate '${resource.addedDate}', expected YYYY-MM-DD.`);
    }

    if (resource.driveLink && !hasDriveLikeLink(resource.driveLink)) {
      errors.push(`${at}: invalid driveLink '${resource.driveLink}'.`);
    }

    if (resource.fileType && /scheme/i.test(resource.fileType)) {
      errors.push(`${at}: fileType contains scheme text '${resource.fileType}'.`);
    }

    const semester = parseSemester(resource);
    if (!semester) {
      warnings.push(`${at}: could not parse semester from fields.`);
    }
  });

  const bySemester = new Map();
  const bySemesterModule = new Map();

  resources.forEach((resource) => {
    const semester = parseSemester(resource) || 'Unknown';
    bySemester.set(semester, (bySemester.get(semester) || 0) + 1);

    const moduleName = (resource.moduleTitle || resource.description || '').toLowerCase();
    if (!bySemesterModule.has(semester)) bySemesterModule.set(semester, []);
    bySemesterModule.get(semester).push(moduleName);
  });

  if ((bySemester.get('S2') || 0) !== 27) {
    errors.push(`S2 count mismatch: expected 27, found ${bySemester.get('S2') || 0}.`);
  }

  if ((bySemester.get('S4') || 0) !== 21) {
    errors.push(`S4 count mismatch: expected 21, found ${bySemester.get('S4') || 0}.`);
  }

  const s3Modules = bySemesterModule.get('S3') || [];
  const s3Checks = [
    'artificial intelligence & data science',
    'transducers & measurements',
    'logic circuit design',
  ];
  for (const module of s3Checks) {
    if (!s3Modules.some((value) => value.includes(module))) {
      errors.push(`S3 missing expected module '${module}'.`);
    }
  }

  const s6Modules = bySemesterModule.get('S6') || [];
  const s6Checks = [
    ['power electronics'],
    ['industrial economics', 'industrial economics and foreign trade'],
    ['digital signal processing', 'dsp'],
    ['process dynamics & control', 'process dynamics and control'],
  ];
  for (const variants of s6Checks) {
    if (!s6Modules.some((value) => containsAny(value, variants))) {
      errors.push(`S6 missing expected module family '${variants[0]}'.`);
    }
  }

  return { errors, warnings, bySemester };
}

const result = validateResources(RESOURCES);

console.log('Resource validation summary');
console.log('Semester counts:', Object.fromEntries(result.bySemester.entries()));

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

console.log('All resource validations passed.');

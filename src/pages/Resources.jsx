import { useMemo, useState } from 'react';
import {
  Calendar,
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Link2,
  Presentation,
  Search,
  X,
} from 'lucide-react';
import SEO from '@components/SEO';
import { RESOURCES } from '@data/resources';
import { SectionWrapper } from '@components/layout';
import { Card, EmptyState, PageBanner, SectionHeader } from '@components/ui';
import { formatDate } from '@utils/date';

const TARGET_SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S6'];

const FILE_TYPE_META = {
  notes: { icon: FileText, color: 'bg-primary-soft text-primary' },
  'question-paper': { icon: FileText, color: 'bg-[rgba(59,130,246,0.12)] text-blue-500' },
  'answer-key': { icon: FileText, color: 'bg-[rgba(16,185,129,0.12)] text-emerald-500' },
  formula: { icon: FileText, color: 'bg-[rgba(245,158,11,0.12)] text-amber-500' },
  video: { icon: Link2, color: 'bg-[rgba(239,68,68,0.12)] text-red-500' },
  pdf: { icon: FileText, color: 'bg-[rgba(239,68,68,0.12)] text-red-500' },
  doc: { icon: FileText, color: 'bg-[rgba(59,130,246,0.12)] text-blue-500' },
  xls: { icon: FileSpreadsheet, color: 'bg-[rgba(16,185,129,0.12)] text-emerald-500' },
  ppt: { icon: Presentation, color: 'bg-[rgba(249,115,22,0.12)] text-orange-500' },
  img: { icon: FileImage, color: 'bg-[rgba(168,85,247,0.12)] text-purple-500' },
  zip: { icon: FileArchive, color: 'bg-[rgba(120,113,108,0.12)] text-stone-500' },
  link: { icon: Link2, color: 'bg-[rgba(14,165,233,0.12)] text-sky-500' },
};

const MODULE_PRIORITY = {
  S2: [
    'Chemistry',
    'Engineering Entrepreneurship and IPR',
    'Foundations of Computing (FoC)',
    'Mathematics',
    'Network Theory (NT)',
    'Programming in C (PRC)',
  ],
  S3: [
    'Artificial Intelligence & Data Science',
    'Transducers & Measurements',
    'Logic Circuit Design',
  ],
  S4: ['Series 1 Question Papers', 'Series 2 Question Papers'],
  S6: [
    'Power Electronics',
    'Industrial Economics',
    'Digital Signal Processing',
    'Process Dynamics & Control',
  ],
};

function parseSemester(resource) {
  const haystack = [
    resource.category,
    resource.fileType,
    resource.id,
    resource.title,
    resource.description,
  ]
    .filter(Boolean)
    .join(' ');

  const match = haystack.match(/S([1-8])/i);
  return match ? `S${match[1]}` : 'Unknown';
}

function schemeForSemester(semester) {
  const semNumber = Number((semester || '').replace('S', ''));
  if (!Number.isFinite(semNumber)) return 'Unknown Scheme';
  return semNumber <= 4 ? '2024 Scheme' : '2019 Scheme';
}

function normalizeType(resource) {
  const raw = (resource.fileType || '').toLowerCase().trim();
  const hintText = [
    resource.id,
    resource.title,
    resource.moduleTitle,
    resource.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (raw.includes('question-paper') || raw.includes('question paper')) return 'question-paper';
  if (raw.includes('answer-key') || raw.includes('answer key')) return 'answer-key';
  if (raw.includes('formula')) return 'formula';
  if (raw.includes('video')) return 'video';

  // Treat notes and pdf as one unified resource type.
  if (raw === 'notes') return 'notes';
  if (raw === 'pdf') return 'notes';

  if (['pdf', 'doc', 'xls', 'ppt', 'img', 'zip', 'link'].includes(raw)) return raw;
  return 'link';
}

function extractModule(resource) {
  const source = resource.moduleTitle || resource.description || resource.title || 'General Resources';
  return source.replace(/\s*\(.*?\)\s*/g, '').trim();
}

function moduleOrderKey(semester, moduleName) {
  const canonical = moduleName.toLowerCase();
  const list = MODULE_PRIORITY[semester] || [];
  const idx = list.findIndex((name) => canonical.includes(name.toLowerCase()));
  if (idx !== -1) return idx;

  const moduleMatch = moduleName.match(/module\s*(\d+)/i);
  if (moduleMatch) return 100 + Number(moduleMatch[1]);
  return 500;
}

function ResourceCard({ resource }) {
  const meta = FILE_TYPE_META[resource.normalizedType] || { icon: File, color: 'bg-surface3 text-text-muted' };
  const Icon = meta.icon;

  return (
    <a
      href={resource.driveLink}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group flex gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-surface border border-border
        shadow-card hover:shadow-card-hover transition-all duration-200
        hover:-translate-y-0.5 active:scale-[0.98] min-h-[44px]
      "
    >
      <div className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg ${meta.color}`}>
        <Icon size={18} className="sm:w-5 sm:h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-heading font-bold text-body text-text-primary leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {resource.title}
          </h4>
          <span className="shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-surface2 text-text-muted">
            {resource.normalizedType}
          </span>
        </div>

        <p className="text-body-sm text-text-secondary leading-relaxed mt-1 line-clamp-2">
          {resource.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-caption text-text-muted flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(resource.addedDate)}
          </span>

          <span className="inline-flex items-center gap-1.5 text-caption font-heading font-semibold text-primary group-hover:text-primary-bright transition-colors">
            <Download size={13} />
            Open
            <ExternalLink size={11} className="opacity-50" />
          </span>
        </div>
      </div>
    </a>
  );
}

export default function Resources() {
  const [query, setQuery] = useState('');
  const [activeSemester, setActiveSemester] = useState('ALL');
  const [selectedTypes, setSelectedTypes] = useState(new Set());

  const normalizedResources = useMemo(
    () =>
      RESOURCES.map((resource) => {
        const semester = parseSemester(resource);
        return {
          ...resource,
          semester,
          scheme: schemeForSemester(semester),
          moduleName: extractModule(resource),
          normalizedType: normalizeType(resource),
        };
      }),
    [],
  );

  const availableSemesters = useMemo(() => {
    const semesters = [...new Set(normalizedResources.map((r) => r.semester).filter((s) => s !== 'Unknown'))];
    return semesters.sort((a, b) => Number(a.replace('S', '')) - Number(b.replace('S', '')));
  }, [normalizedResources]);

  const availableTypes = useMemo(() => {
    const types = [...new Set(normalizedResources.map((r) => r.normalizedType))];
    const preferred = ['notes', 'question-paper', 'answer-key', 'formula', 'video', 'pdf', 'doc', 'xls', 'ppt', 'img', 'zip', 'link'];
    return types.sort((a, b) => preferred.indexOf(a) - preferred.indexOf(b));
  }, [normalizedResources]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalizedResources.filter((resource) => {
      const semesterMatch = activeSemester === 'ALL' ? true : resource.semester === activeSemester;
      const typeMatch = selectedTypes.size === 0 ? true : selectedTypes.has(resource.normalizedType);
      const searchMatch =
        q.length === 0
          ? true
          : [
              resource.title,
              resource.description,
              resource.moduleName,
              resource.semester,
              resource.scheme,
            ]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(q));
      return semesterMatch && typeMatch && searchMatch;
    });
  }, [normalizedResources, activeSemester, selectedTypes, query]);

  const grouped = useMemo(() => {
    const semesterMap = new Map();

    for (const resource of filtered) {
      if (!semesterMap.has(resource.semester)) {
        semesterMap.set(resource.semester, {
          semester: resource.semester,
          scheme: resource.scheme,
          modules: new Map(),
        });
      }

      const semesterGroup = semesterMap.get(resource.semester);
      if (!semesterGroup.modules.has(resource.moduleName)) {
        semesterGroup.modules.set(resource.moduleName, []);
      }
      semesterGroup.modules.get(resource.moduleName).push(resource);
    }

    return [...semesterMap.values()]
      .sort((a, b) => Number(a.semester.replace('S', '')) - Number(b.semester.replace('S', '')))
      .map((semesterGroup) => ({
        ...semesterGroup,
        modules: [...semesterGroup.modules.entries()]
          .sort(([modA], [modB]) => {
            const keyA = moduleOrderKey(semesterGroup.semester, modA);
            const keyB = moduleOrderKey(semesterGroup.semester, modB);
            if (keyA !== keyB) return keyA - keyB;
            return modA.localeCompare(modB);
          })
          .map(([moduleName, resources]) => ({
            moduleName,
            resources: resources.sort((a, b) => (b.addedDate || '').localeCompare(a.addedDate || '')),
          })),
      }));
  }, [filtered]);

  const targetSummary = useMemo(() => {
    const bySemester = new Map();
    for (const resource of normalizedResources) {
      if (!bySemester.has(resource.semester)) bySemester.set(resource.semester, 0);
      bySemester.set(resource.semester, bySemester.get(resource.semester) + 1);
    }
    return TARGET_SEMESTERS.map((semester) => `${semester}: ${bySemester.get(semester) || 0}`).join(' | ');
  }, [normalizedResources]);

  const toggleType = (type) => {
    const next = new Set(selectedTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setSelectedTypes(next);
  };

  const clearFilters = () => {
    setQuery('');
    setActiveSemester('ALL');
    setSelectedTypes(new Set());
  };

  const hasFilters = query.trim().length > 0 || activeSemester !== 'ALL' || selectedTypes.size > 0;

  return (
    <>
      <SEO
        title="Resources"
        description="Download question papers, answer keys, notes and study resources for all available semesters."
      />

      <PageBanner
        title="Resources & Downloads"
        subtitle="Find materials by semester first, then module."
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Resources', path: '/resources' },
        ]}
        gradientFrom="from-primary-muted"
        gradientTo="to-bg"
      />

      <SectionWrapper background="default">
        {RESOURCES.length === 0 ? (
          <Card>
            <EmptyState
              icon="file"
              title="Resources coming soon"
              subtitle="No downloads are available right now."
            />
          </Card>
        ) : (
          <>
            <div className="sticky top-16 md:top-20 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 py-3 bg-bg/95 backdrop-blur-sm border-y border-border mb-6 sm:mb-8">
              <div className="relative max-w-xl mx-auto mb-3">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by module, title or semester"
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-surface text-body text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary-soft"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <button
                  onClick={() => setActiveSemester('ALL')}
                  className={`px-3 py-1.5 rounded-full text-caption font-heading min-h-[44px] ${
                    activeSemester === 'ALL' ? 'bg-primary text-white' : 'bg-surface2 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All
                </button>
                {availableSemesters.map((semester) => (
                  <button
                    key={semester}
                    onClick={() => setActiveSemester(semester)}
                    className={`px-3 py-1.5 rounded-full text-caption font-heading min-h-[44px] ${
                      activeSemester === semester
                        ? 'bg-primary text-white'
                        : TARGET_SEMESTERS.includes(semester)
                          ? 'bg-primary-soft text-primary hover:bg-primary-muted'
                          : 'bg-surface2 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {semester}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-2.5 py-1.5 rounded-md text-[11px] uppercase tracking-wide min-h-[44px] ${
                      selectedTypes.has(type)
                        ? 'bg-primary text-white'
                        : 'bg-surface2 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {type}
                  </button>
                ))}

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[44px] rounded-md bg-surface2 text-text-secondary hover:text-text-primary"
                  >
                    <X size={14} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <p className="text-caption text-text-muted mb-4 sm:mb-6">
              Showing {filtered.length} resource{filtered.length !== 1 ? 's' : ''}. Target coverage {targetSummary}.
            </p>

            {grouped.length === 0 ? (
              <Card>
                <EmptyState
                  icon="file"
                  title="No resources found"
                  subtitle="Try changing semester, file type, or search terms."
                />
              </Card>
            ) : (
              <div className="space-y-8 sm:space-y-10">
                {grouped.map((semesterGroup) => {
                  const semesterCount = semesterGroup.modules.reduce((sum, moduleGroup) => sum + moduleGroup.resources.length, 0);
                  return (
                    <section key={semesterGroup.semester}>
                      <SectionHeader
                        title={`${semesterGroup.semester} (${semesterGroup.scheme})`}
                        subtitle={`${semesterCount} resource${semesterCount !== 1 ? 's' : ''}`}
                      />

                      <div className="space-y-5 mt-4">
                        {semesterGroup.modules.map((moduleGroup) => (
                          <div key={`${semesterGroup.semester}-${moduleGroup.moduleName}`}>
                            <h3 className="text-body font-heading font-semibold text-text-primary mb-3">
                              {moduleGroup.moduleName}
                            </h3>
                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                              {moduleGroup.resources.map((resource) => (
                                <ResourceCard key={resource.id} resource={resource} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </SectionWrapper>
    </>
  );
}

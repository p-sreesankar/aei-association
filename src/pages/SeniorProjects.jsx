import SEO from '@components/SEO';
import { SectionWrapper } from '@components/layout';
import { Badge, Card, EmptyState, PageBanner, SectionHeader } from '@components/ui';
import { SENIOR_PROJECTS } from '@data/senior-projects';

export default function SeniorProjects() {
  return (
    <>
      <SEO
        title="Projects"
        description="Browse final-year project topics and the students working on them."
      />

      <PageBanner
        title="Projects"
        subtitle="A simple showcase of project topics and the student or team members behind each one."
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Projects', path: '/senior-projects' },
        ]}
        gradientFrom="from-[#0C1D34]"
        gradientTo="to-[#0A1628]"
      />

      <SectionWrapper background="default" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-28 right-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-[1] section-container">
          <SectionHeader
            title="M.Tech Mini-project Report"
            subtitle="Each card highlights the project topic and the name or names of the students involved."
            showAccent
          />

          {SENIOR_PROJECTS.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon="inbox"
                title="No senior projects added yet"
                subtitle="Add entries in src/data/senior-projects.js to publish this page."
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {SENIOR_PROJECTS.map((project) => (
                <Card key={project.id} className="h-full border-border/80 bg-gradient-to-b from-surface to-surface2">
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Project Topic</p>
                        <h3 className="mt-2 text-h4 font-heading font-bold text-text-primary">
                          {project.topic}
                        </h3>
                      </div>
                    </div>

                    <div>
                      <p className="text-caption uppercase tracking-[0.24em] text-text-muted">Student Name(s)</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {project.members.map((member) => (
                          <span
                            key={member}
                            className="rounded-full border border-border bg-bg/70 px-3 py-1.5 text-body-sm text-text-primary"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <span className="text-caption uppercase tracking-[0.22em] text-text-muted">PDF Link</span>
                      <a
                        href={project.pdf}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl border border-primary/30 bg-primary-soft px-4 py-2 text-body-sm font-semibold text-text-primary transition-colors hover:bg-primary hover:text-bg"
                      >
                        Open PDF
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
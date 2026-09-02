import { motion } from 'framer-motion';
import SEO from '@components/SEO';
import { SectionWrapper } from '@components/layout';
import { EmptyState, PageBanner, ProjectShowcaseCard, SectionHeader } from '@components/ui';
import { STUDENT_REPOS } from '@data/student-githubs';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function StudentRepos() {
  return (
    <>
      <SEO
        title="Code Hub"
        description="Explore GitHub repositories and open-source contributions by our AEI students."
      />

      <PageBanner
        title="Student Code Hub"
        subtitle="Discover open-source projects, personal portfolios, and code repositories built by our students."
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Code Hub', path: '/student-repos' },
        ]}
        gradientFrom="from-[#0C1D34]"
        gradientTo="to-[#0A1628]"
      />

      <SectionWrapper background="default" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-blue-700/15 blur-3xl" />

        <div className="relative z-[1]">
          <SectionHeader
            title="GitHub Showcase"
            subtitle="Explore the amazing code our students are writing and maintaining."
            showAccent
          />

          {STUDENT_REPOS.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon="github"
                title="No repositories listed yet"
                subtitle="Add entries to src/data/student-githubs.js to feature student work."
              />
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {STUDENT_REPOS.map((repo) => (
                <motion.div key={repo.id} variants={item}>
                  <ProjectShowcaseCard
                    title={repo.title}
                    description={repo.description}
                    image={repo.image}
                    tags={repo.tags}
                    creators={[repo.studentName]}
                    link={repo.github}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}

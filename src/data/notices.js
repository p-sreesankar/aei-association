// ============================================================================
//  NOTICES — AEI Association Notice Board
// ============================================================================
//
//  HOW TO ADD A NEW NOTICE:
//  ------------------------
//  1. Copy the template below and paste it at the TOP of the array.
//
//     {
//       id:            "your-unique-slug",
//       title:         "Your Notice Title Here",
//       category:      "academic",                      ← one of: academic | administrative | urgent | general
//       date:          "YYYY-MM-DD",
//       description:   "A short summary of the notice (1–3 sentences).",
//       attachmentUrl: "https://drive.google.com/...",   ← or null if no file
//       pinned:        false,                            ← set true to pin at top
//     },
//
//  2. Replace the placeholder values with your actual content.
//  3. Save → git add . → git commit -m "add notice: your title" → git push
//
//  HOW TO REMOVE A NOTICE:
//  -----------------------
//  Find the { ... } block for that notice and delete the entire block
//  (from the opening { to the closing },). Save and push.
//
//  HOW TO PIN A NOTICE:
//  --------------------
//  Set  pinned: true  — it will always appear at the top regardless of date.
//  Only pin 1–2 notices at a time to avoid clutter.
//
//  CATEGORY OPTIONS:
//  -----------------
//  "academic"       → Exams, submissions, timetables, academic deadlines
//  "administrative" → Fees, registrations, office hours, admin matters
//  "urgent"         → Time-sensitive / critical announcements
//  "general"        → Everything else (workshops, opportunities, etc.)
//
//  FIELD REFERENCE:
//  ┌─────────────────┬──────────────────────────────────┬──────────┬──────────────────────────────────────────┐
//  │ Field           │ Type                             │ Required │ Description                              │
//  ├─────────────────┼──────────────────────────────────┼──────────┼──────────────────────────────────────────┤
//  │ id              │ String                           │ Yes      │ Unique slug (lowercase, hyphens)         │
//  │ title           │ String                           │ Yes      │ Notice heading                           │
//  │ category        │ "academic" | "administrative"    │ Yes      │ Determines badge color in the UI         │
//  │                 │ | "urgent" | "general"           │          │                                          │
//  │ date            │ String (YYYY-MM-DD)              │ Yes      │ Date posted — used for sorting           │
//  │ description     │ String                           │ Yes      │ Short body text (1–3 sentences)          │
//  │ attachmentUrl   │ String | null                    │ No       │ Link to PDF/file, or null                │
//  │ pinned          │ Boolean                          │ No       │ Stick to top? (default: false)           │
//  └─────────────────┴──────────────────────────────────┴──────────┴──────────────────────────────────────────┘
//
// ============================================================================

/** @type {Array<{id: string, title: string, category: string, date: string|null, description: string, attachmentUrl: string|null, pinned: boolean}>} */
const NOTICES = [
	{
		id: "rescheduled-second-series-tests-2026",
		title: "Rescheduled Series Examinations — S1, S3, S5 and S7",
		category: "academic",
		date: "2026-08-06",
		description: "The Second Series Examination schedule for S3, S5, and S7 has been revised to 22, 23, 24, and 26 October 2026. The Minor Examination is scheduled for the forenoon session on 22 October. The S1 First Series Examination will commence on 26 October 2026. Students are advised to take note of the revised schedule.",
		attachmentUrl: null,
		pinned: false,
	},
	{
		id: "updated-ktu-academic-calendar-odd-semester-2026",
		title: "Updated Academic Calendar — Odd Semester 2026",
		category: "academic",
		date: "2026-10-08",
		description: "APJ Abdul Kalam Technological University has revised the odd-semester academic calendar following the rescheduling of the College Union Election from 9 October 2026 to 16 October 2026. The Second Series Examination for S3, S5, and S7 of the B.Tech, BBA/BCA, B.Arch, and B.Des programmes must be completed by 24 October 2026. Classes for these semesters will conclude on 31 October 2026. All concerned students and institutions are requested to take note of the revised schedule.",
		attachmentUrl: "/images/events/updation%20of%20academic%20calendar.png",
		pinned: true,
	},
	{
		id: "candela-26-date-announcement",
		title: "Candela ’26 — Save the Date",
		category: "general",
		date: null,
		description: "The wait is almost over. Candela ’26 will begin on 20 August. Stay tuned as the preparations culminate in an extraordinary celebration.",
		attachmentUrl: "https://www.instagram.com/reels/Db0TG2TREOI/",
		pinned: false,
	},
	{
		id: "candela-26-coming-soon",
		title: "Candela ’26 — Coming Soon",
		category: "general",
		date: null,
		description: "A new spark is emerging on the horizon. Candela ’26 is synchronising, amplifying, and preparing to become something extraordinary, bigger, bolder, and brighter. The wait is almost over.",
		attachmentUrl: "https://www.instagram.com/reels/DaAuFDRRtbP/",
		pinned: false,
	},
	{
		id: "s3-first-internal-timetable-2026",
		title: "S3 First Internal Examination Timetable 2026",
		category: "academic",
		date: "2026-08-07",
		description: "The first internal examination timetable for S3 for the 2026 academic year is now available. Students are advised to review the schedule carefully and prepare accordingly.",
		attachmentUrl: "/images/events/timetable-first%20internal%20exam-2026-S3.jpeg",
		pinned: false,
	},
	{
		id: "s5-first-internal-timetable-2026",
		title: "S5 First Internal Examination Timetable 2026",
		category: "academic",
		date: "2026-08-07",
		description: "The first internal examination timetable for S5 for the 2026 academic year is now available. Students are advised to review the schedule carefully and prepare accordingly.",
		attachmentUrl: "/images/events/timetable-first%20internal%20exam-2026-S5.jpeg",
		pinned: false,
	},
	{
		id: "s7-first-internal-timetable-2026",
		title: "S7 First Internal Examination Timetable 2026",
		category: "academic",
		date: "2026-08-07",
		description: "The first internal examination timetable for S7 for the 2026 academic year is now available. Students are advised to review the schedule carefully and prepare accordingly.",
		attachmentUrl: "/images/events/timetable-first%20internal%20exam-2026-S7.jpeg",
		pinned: false,
	},
	{
		id: "candela-26-team-call",
		title: "Candela ’26 Team Call",
		category: "general",
		date: "2026-06-28",
		description: "Applications are invited from students interested in joining the team behind Candela ’26. This is an opportunity to contribute to the planning and execution of the fest and help bring its vision to life. Interested students are encouraged to complete the team-call form through the link provided in the association's Instagram bio.",
		attachmentUrl: "https://www.instagram.com/p/DaIhKN3n-Im/?stkn=MTZveHZ5cnByOWJ0dw%3D%3D",
		pinned: false,
	},
	{
		id: "official-cet-domain-launch",
		title: "AEI Association Website Moves to Official CET Domain",
		category: "general",
		date: "2026-04-20",
		description: "The AEI Association website is now live under the official CET domain. This transition marks an important step toward making the platform more authentic, accessible, and connected to the institution.",
		attachmentUrl: "https://www.instagram.com/p/DXXHxMZk_7K/?stkn=MWJxcmt0bG95aWJmeQ%3D%3D",
		pinned: false,
	},
	{
		id: "aei-magazine-team-recruitment",
		title: "Applications Open for the AEI Association Magazine Team",
		category: "general",
		date: "2026-05-02",
		description: "The AEI Association invites students to join the Magazine Team and contribute to the creation of the department magazine. Selected members will help develop stories, design content, and transform creative ideas into meaningful work. Interested students are encouraged to apply through the link provided in the association's Instagram bio.",
		attachmentUrl: "https://www.instagram.com/p/DX1jYJME3D5/?stkn=ZnR4b3I2cG56MHNs",
		pinned: false,
	},
	{
		id: "magazine-2025-26-article-invitation",
		title: "Invitation for Articles — AEI Department Magazine 2025–26",
		category: "general",
		date: "2026-05-20",
		description: "The Department of Applied Electronics and Instrumentation invites students to submit articles for the 2025–26 department magazine. Contributors are encouraged to explore the relationship between consciousness, perception, memory, measurement, and the possibility of alternate realities. Submission details are available through the link in the department's Instagram bio.",
		attachmentUrl: "https://www.instagram.com/p/DYkNU73zCGf/?stkn=MTNmeXlyNDY0bWV1eQ%3D%3D",
		pinned: false,
	},
	{
		id: "s1-study-notes-available",
		title: "S1 Study Notes Available",
		category: "academic",
		date: "2026-06-14",
		description: "Study notes for S1 students have been uploaded to the AEI Department website and are now available for access. Students may visit the website to view or download the notes whenever required.",
		attachmentUrl: "https://www.instagram.com/p/DZjlnwuTosN/?stkn=MXA0cGkzbHl1Y3JnbA%3D%3D",
		pinned: false,
	},
	{
		id: "mtech-mini-project-reports-aptitude-tests",
		title: "M.Tech Mini-Project Reports and Aptitude Mock Tests Available",
		category: "academic",
		date: "2026-07-12",
		description: "M.Tech mini-project reports and aptitude mock tests are now available through the AEI Department website. Visit https://aei.cet.ac.in to access these resources. Additional features and learning resources will be introduced soon.",
		attachmentUrl: "https://www.instagram.com/p/Das6Y4rzAc_/?stkn=MXAzY3VmYm5oaHV6Zg%3D%3D",
		pinned: true,
	},
	{
		id: "sem-exam-dates-s2-s4-s6-s8",
		title: "Sem Exam Dates",
		category: "academic",
		date: "2026-04-12",
		description: "B.Tech Applied Electronics Detailed Examination Time Table (S2, S4, S6, S8).",
		attachmentUrl: "https://www.instagram.com/p/DWwQmkqk-Vn/?igsh=MTl3dnJhajNxdGc2MA==",
		pinned: true,
	},
];

export { NOTICES };

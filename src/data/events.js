// ============================================================================
//  EVENTS — AEI Association Event Calendar
// ============================================================================
//
//  HOW TO ADD A NEW EVENT:
//  -----------------------
//  1. Copy the template below and paste it at the TOP of the array.
//
//     {
//       id:              "your-event-slug",
//       title:           "Event Name Here",
//       date:            "YYYY-MM-DD",                  ← start / only date
//       endDate:         null,                           ← end date for multi-day events, or null
//       venue:           "Venue Name, Location",
//       description:     "A short description (1–3 sentences).",
//       image:           null,                           ← poster URL, or null → gradient placeholder
//       category:        "workshop",                    ← see CATEGORY OPTIONS below
//       time:            "10:00 AM – 4:00 PM",          ← or null
//       registrationUrl: null,                           ← Google Form link, or null
//       instagramUrl:    null,                           ← Instagram post/reel link, or null
//       hideDate:        false,                          ← true to hide date/calendar on card
//     },
//
//  2. Replace placeholder values with your actual content.
//  3. Save → git add . → git commit → git push → auto-deploys!
//
//  HOW TO REMOVE AN EVENT:
//  -----------------------
//  Delete the entire { ... }, block for that event. Save and push.
//
//  NOTE: You do NOT need to set "upcoming" or "past" status manually.
//  The website compares today's date to event.date and auto-categorises.
//
//  CATEGORY OPTIONS:
//  -----------------
//  "workshop"     → Hands-on tech sessions, labs, bootcamps
//  "fest"         → TechFest, cultural fests, flagship events
//  "seminar"      → Guest talks, alumni talks, panel discussions
//  "competition"  → Hackathons, coding contests, project expos
//  "cultural"     → Onam, Christmas, department celebrations
//  "general"      → Anything else
//
//  FIELD REFERENCE:
//  ┌──────────────────┬──────────────────────────────────┬──────────┬─────────────────────────────────────────────┐
//  │ Field            │ Type                             │ Required │ Description                                 │
//  ├──────────────────┼──────────────────────────────────┼──────────┼─────────────────────────────────────────────┤
//  │ id               │ String                           │ Yes      │ Unique slug (lowercase, hyphens)            │
//  │ title            │ String                           │ Yes      │ Event heading                               │
//  │ date             │ String (YYYY-MM-DD)              │ Yes      │ Start date — used for sorting & status      │
//  │ endDate          │ String (YYYY-MM-DD) | null       │ No       │ End date for multi-day events               │
//  │ venue            │ String                           │ Yes      │ Where the event takes place                 │
//  │ description      │ String                           │ Yes      │ Short body text (1–3 sentences)             │
//  │ image            │ String | null                    │ No       │ Poster/photo URL, or null for placeholder   │
//  │ category         │ String                           │ Yes      │ One of the category options above           │
//  │ time             │ String | null                    │ No       │ Time range, or null                         │
//  │ registrationUrl  │ String | null                    │ No       │ Registration form link, or null             │
//  │ instagramUrl     │ String | null                    │ No       │ Instagram post/reel link, or null           │
//  │ hideDate         │ Boolean                          │ No       │ Hide date and calendar for this event card  │
//  └──────────────────┴──────────────────────────────────┴──────────┴─────────────────────────────────────────────┘
//
// ============================================================================

/** @type {Array<{id: string, title: string, date: string, endDate: string|null, venue: string, description: string, image: string|null, category: string, time: string|null, registrationUrl: string|null, instagramUrl: string|null, hideDate?: boolean}>} */
const EVENTS = [
  {
    id:              "learning-resources-website-launch",
    title:           "Test Series & GitHub Projects Now Available",
    date:            "2026-10-08",
    endDate:         null,
    venue:           "AEI Association Website",
    description:     "The AEI Association brings you more ways to learn, practice, and explore.\n\nTest yourself with series covering Microcontrollers, Analog Circuits, Instrumentation, Digital Electronics, Control, and Signals. Explore technical projects and learn through real implementations on GitHub.\n\nPractice. Explore. Learn. Grow.",
    image:           "/images/events/8-9-26.jpeg",
    category:        "general",
    time:            null,
    registrationUrl: "https://aei.cet.ac.in/",
    instagramUrl:    "https://www.instagram.com/p/DdBpbQdTjVe/?stkn=MW90c2NxcjJoZGY0Nw==",
  },

  {
    id:              "candela-26",
    title:           "Candela '26",
    date:            "2026-04-20",
    endDate:         null,
    venue:           "AEI Department",
    description:     "Candela '26 is coming soon. Stay tuned for the official poster, schedule, and registration details.",
    image:           "/images/events/candela-26.png",
    category:        "fest",
    time:            null,
    registrationUrl: null,
    instagramUrl:    null,
    hideDate:        true,
  },

  {
    id:              "farewell-aei-26",
    title:           "Farewell AEI'26",
    date:            "2026-03-30",
    endDate:         null,
    venue:           "AEI Department",
    description:     "A special farewell gathering for the AEI 2026 batch with faculty, classmates, and shared memories from the journey.",
    image:           "/images/events/farewell-26.png",
    category:        "cultural",
    time:            null,
    registrationUrl: null,
    instagramUrl:    null,
  },

  {
    id:              "department-iftar-26",
    title:           "Department IFTAR '26",
    date:            "2026-03-12",
    endDate:         null,
    venue:           "AEI Department",
    description:     "Department IFTAR '26 organized by AEI students and faculty as an evening of togetherness and community.",
    image:           "/images/events/iftar-26.png",
    category:        "cultural",
    time:            null,
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/reels/DWBcRM2jwfd/",
  },

  {
    id:              "onam-celebration-2025",
    title:           "Onam Celebrations — AEI Department",
    date:            "2025-09-05",
    endDate:         null,
    venue:           "AEI Department Grounds",
    description:     "The annual Onam celebration organized by S6 and S8 students. Pookalam competition, traditional games, Onasadya, and a cultural programme rounded off a memorable day for the AEI family.",
    image:           null,
    category:        "cultural",
    time:            "10:00 AM – 2:00 PM",
    registrationUrl: null,
    instagramUrl:    null,
  },

  {
    id:              "event-2025-03-25",
    title:           "Cracking The Consulting & Analytics Industry",
    date:            "2026-03-25",
    endDate:         null,
    venue:           "EC Seminar Hall",
    description:     "AEI Association × Internship Association present an exclusive session to help you navigate careers in consulting and analytics.\n\nKickstart your career journey by learning directly from seniors who have secured roles in the industry:\n\n• Pranathi Ajayan – KPMG\n• Rahul Sam – Geojit | Incoming Analyst at KPMG\n\n Date: 25 March 2026\n Venue: EC Seminar Hall\n\nDon’t miss this opportunity to gain real insights and guidance ",
    image:           "/images/events/cracking-analytics-and-consulting-industry.png",
    category:        "general",
    time:            "4:30 pm",
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/reel/DW1brENE_DH/?igsh=dTNuc250eWcyNTF4",
  },

];

export { EVENTS };

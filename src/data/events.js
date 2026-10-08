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
//  │ date             │ String (YYYY-MM-DD) | null       │ No       │ Start date — used for sorting & status      │
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

/** @type {Array<{id: string, title: string, date: string|null, endDate: string|null, venue: string, description: string, image: string|null, images?: string[], category: string, time: string|null, registrationUrl: string|null, instagramUrl: string|null, hideDate?: boolean}>} */
const EVENTS = [
  {
    id:              "consulting-analytics-industry-session",
    title:           "Cracking the Consulting & Analytics Industry",
    date:            "2026-03-24",
    endDate:         null,
    venue:           "EC Seminar Hall",
    description:     "The AEI Association, in collaboration with the Internship Cell, presents an exclusive session on navigating careers in consulting and analytics. Pranathi Ajayan from KPMG and Rahul Sam from Geojit, an incoming Analyst at KPMG, will share their experiences and guidance. The session will be held on 25 March 2026.",
    image:           null,
    category:        "seminar",
    time:            null,
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/p/DWRL9XnkeWm/?stkn=cmplZXYwang0aHE0",
  },

  {
    id:              "epoch-placement-talk-session-2-analog-devices",
    title:           "Placement Talk — Stepping into the Core Sector",
    date:            "2026-04-12",
    endDate:         null,
    venue:           "Online",
    description:     "EPOCH, in collaboration with the Internship Cell CET, presents a placement session focused on Digital Design and Design Verification in the core electronics domain. Diya Rose Thomas, Digital Design Intern at Analog Devices, and Keshav Balakrishnan, Design Verification Intern at Analog Devices, will share their insights and experiences. The session is scheduled for 14 April 2026 at 7:00 PM.",
    image:           null,
    category:        "seminar",
    time:            "7:00 PM",
    registrationUrl: "https://meet.google.com/dwd-kpmf-uvi",
    instagramUrl:    null,
  },

  {
    id:              "farewell-seniors-2026",
    title:           "Farewell to Our Seniors",
    date:            null,
    endDate:         null,
    venue:           "AEI Department",
    description:     "A farewell tribute to the graduating seniors, celebrating the memories they created across the campus and wishing them success in the next chapter of their journey.",
    image:           null,
    category:        "cultural",
    time:            null,
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/reels/DXEkmwnk9mD/",
    hideDate:        true,
  },

  {
    id:              "epoch-placement-talk-session-3-athul",
    title:           "Placement Talk",
    date:            "2026-05-23",
    endDate:         null,
    venue:           "Online",
    description:     "EPOCH presents an insightful session with Athul, Senior Embedded Firmware Engineer at Texas Instruments, offering industry perspectives on placements, technical skills, and career growth. The session is organized by the Electronics Department in collaboration with the Internship Cell CET and the EL Association.",
    image:           null,
    category:        "seminar",
    time:            "7:30 PM",
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/p/DYrDu3YRdNm/?stkn=NW0xcGNjZjdjc3g5",
  },

  {
    id:              "epoch-placement-talks-session-7-vykasi-sidhana",
    title:           "Placement Talks",
    date:            "2026-07-03",
    endDate:         null,
    venue:           "Online",
    description:     "EPOCH presents an engaging session with Vykasi Sidhana, placed at South Indian Bank, who will share her placement journey and insights into what recruiters look for in candidates. The session is organized in collaboration with Women TechnoHub by the ECE and AEI Associations.",
    image:           null,
    category:        "seminar",
    time:            "7:30 PM",
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/p/DaVdAK-vzfg/?stkn=OXUxYnpseDR4ZjNk",
  },

  {
    id:              "epoch-placement-talks-session-8-devika-v",
    title:           "Placement Talks",
    date:            "2026-07-10",
    endDate:         null,
    venue:           "Online",
    description:     "EPOCH presents an insightful session with Devika V, Graduate Engineer Trainee at JSW, who will share her placement journey and practical guidance on what recruiters expect from aspiring engineers. The session is organized in collaboration with Women TechnoHub by the ECE and AE Associations.",
    image:           null,
    category:        "seminar",
    time:            "7:00 PM",
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/p/DannInqPAXq/?stkn=MXQwaGxtZWptN3g2NA%3D%3D",
  },

  {
    id:              "electronics-league-2026",
    title:           "Electronics League 2026",
    date:            "2026-08-01",
    endDate:         null,
    venue:           "To be announced",
    description:     "The EC and AE Associations present Electronics League 2026. Meet the organizing team and year captains, and get ready for exciting matches, healthy competition, teamwork, and memorable experiences.",
    image:           "/images/events/electronics%20league%201.png",
    images:          [
      "/images/events/electronics%20league%201.png",
      "/images/events/electronics%20league%20coordinators.png",
      "/images/events/year%20captians%20electronics%20league.png",
    ],
    category:        "general",
    time:            null,
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/p/DbgHMOmP8It/?stkn=MTd5bjMxMzAybXE3bg%3D%3D",
  },

  {
    id:              "prakampanam-onam-celebration-2026",
    title:           "Prakampanam — Onam Celebration",
    date:            "2026-08-20",
    endDate:         null,
    venue:           "Electronics Department Front",
    description:     "The EC and AE Associations invite students to Prakampanam, a celebration filled with floral designs, music, and the festive spirit of Onam.",
    image:           null,
    category:        "cultural",
    time:            "9:00 AM",
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/p/DcQDMMFRL6V/?stkn=dXBxcWlhaTAyYjQ0",
  },

  {
    id:              "epoch-placement-talks-maria-joseph",
    title:           "Placement Talks — EPOCH",
    date:            null,
    endDate:         null,
    venue:           "To be announced",
    description:     "An EPOCH Placement Talks session featuring Maria Joseph. Further details will be announced soon.",
    image:           null,
    category:        "seminar",
    time:            null,
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/p/Dc70TxykTde/?stkn=MWQweG16M243MDBhdA%3D%3D",
    hideDate:        true,
  },

  {
    id:              "epoch-placement-talks-julin-mary-deepak",
    title:           "Placement Talks | EPOCH",
    date:            "2026-09-13",
    endDate:         null,
    venue:           "To be announced",
    description:     "An EPOCH placement-preparation session featuring Julin Mary Deepak, an S7 ECE student at Schneider Electric, covering Analog, C Programming, and Embedded Systems fundamentals. The session will also offer guidance on communicating technical knowledge, acknowledging limitations honestly, and explaining problem-solving approaches clearly.",
    image:           null,
    category:        "seminar",
    time:            null,
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/p/DdO5U2KDGmX/?stkn=MWwyZngwbGg0YjJuNg%3D%3D",
  },

  {
    id:              "professional-profile-career-preparation-session",
    title:           "Professional Profile and Career Preparation Session",
    date:            "2026-09-30",
    endDate:         null,
    venue:           "EC Seminar Hall",
    description:     "A career-preparation session for first- and second-year students covering NPTEL, projects, internships, and LinkedIn. The session will be conducted by Febin Eldhose and will help students build a strong professional foundation.",
    image:           null,
    category:        "seminar",
    time:            "4:00 PM – 5:30 PM",
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/p/Dd6GUZtKnx3/?stkn=c2s4dWoxNW40azVu",
  },

  {
    id:              "epoch-placement-talks-schneider-electric",
    title:           "Placement Talks | EPOCH",
    date:            "2026-09-26",
    endDate:         null,
    venue:           "To be announced",
    description:     "An EPOCH placement-preparation session featuring Abhijith D, an S7 ECE student at Schneider Electric, covering Analog, C Programming, and Embedded Systems fundamentals.",
    image:           null,
    category:        "seminar",
    time:            null,
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/p/DdwKDhMknlP/?stkn=azMzZmV5ZmhiOGhs",
  },

  {
    id:              "epoch-placement-talks-toshiba-schneider",
    title:           "Placement Talks — EPOCH",
    date:            "2026-09-16",
    endDate:         null,
    venue:           "Online",
    description:     "An online placement talk featuring S7 ECE seniors placed at Toshiba and Schneider Electric. The session will cover their preparation strategies, interview experiences, career journeys, and placement guidance.",
    image:           null,
    category:        "seminar",
    time:            "7:30 PM",
    registrationUrl: null,
    instagramUrl:    "https://www.instagram.com/p/DdTFBQiKbrS/?stkn=MTFpYXo0Y25mdnplbA%3D%3D",
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

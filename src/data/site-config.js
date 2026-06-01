// ============================================================================
//  SITE CONFIGURATION — AEI Association
// ============================================================================
//
//  HOW TO EDIT (for non-developers):
//  ---------------------------------
//  This file controls global settings for the entire website.
//  You only need to change the values inside the quotes ("...").
//
//  • To change the tagline:   Find "tagline" below → replace the text in quotes.
//  • To change social links:  Find the "socialLinks" section → update the URLs.
//  • To swap the Google Form: Replace the URL next to "grievanceFormUrl".
//  • To change theme colors:  Update the hex codes (#XXXXXX) in "themeColors".
//
//  RULES:
//  1. Don't delete any commas, curly braces {}, or square brackets [].
//  2. Every text value must be wrapped in quotes: "like this"
//  3. Lines starting with // are comments — they are ignored by the browser.
//  4. After editing, save the file → git add . → git commit -m "update config" → git push
//
// ============================================================================

const SITE_CONFIG = {

  // ---------- Basic Info ----------

  siteName: "AEI Association",                          // [Required] Name shown in header & browser tab
  departmentName: "Applied Electronics and Instrumentation",// [Required] Full department name
  departmentShort: "AEI",                                   // [Required] Short code used in headings
  collegeName: "College of Engineering Trivandrum",          // [Required] Full college name
  collegeShort: "CET",                                      // [Required] Short code
  tagline: "Your one-stop hub for notices, events, resources & support", // [Required] Hero subtitle text

  // ---------- Footer ----------

  footerText: "2026 AEI Association — AEI, CET. All rights reserved.", // [Required] Footer copyright line

  // ---------- Grievance Form ----------
  // Replace this with your own Google Form embed URL.
  // To get it: Open Google Forms → click "Send" → click the embed icon (<>) → copy the URL from the src="..." part.

  grievanceFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc51Wa1GVLcjAqq55u70y33rA0qmYe2_TqWkfFRXdOSS-TrGQ/viewform?embedded=true", // [Required]

  // ---------- Social Links ----------
  // Set a link to "" (empty quotes) to hide that icon on the site.

  socialLinks: {
    instagram: "https://www.instagram.com/ae_association_cet/",        // [Optional] Instagram page URL
    // linkedin:  "", // [Optional] LinkedIn page URL
    youtube:   "",                                           // [Optional] YouTube channel URL
    // email:     "",    // [Optional] General contact email (keep mailto: prefix)
    website:   "",                     // [Optional] College or dept website
  },

  // ---------- Theme Colors ----------
  // These control the site's color scheme. Use hex codes (#RRGGBB).
  // Tip: Pick colors from your college logo or identity guidelines.

  themeColors: {
    primary:    "#1A73E8",   // [Required] Main brand color — buttons, headings, links (CET blue)
    secondary:  "#FF6F00",   // [Required] Accent color — highlights, badges, hover states (warm amber)
    background: "#FAFAFA",   // [Required] Page background
    surface:    "#FFFFFF",   // [Required] Card/panel background
    textDark:   "#212121",   // [Required] Primary text color
    textLight:  "#FAFAFA",   // [Required] Text on colored backgrounds
    muted:      "#757575",   // [Required] Secondary/muted text (dates, captions)
  },

  // ---------- SEO / Meta ----------

  metaDescription: "AEI Association — AEI Department, College of Engineering Trivandrum. Notices, events, resources, grievance portal and more for AEI students.", // [Required]
  ogImage: "assets/og-image.png", // [Optional] Social sharing preview image (1200×630 px recommended)

  // ---------- Contact / Office ----------
  // Used on the Contact page. Set any field to "" to hide it.

  contact: {
    officeRoom:    "Room 203, AEI Block",         // [Optional] Office room / location
    officeHours:   "Mon–Fri, 10:00 AM – 4:00 PM", // [Optional] Working hours
    phone:         "+91-471-2515555",              // [Optional] Department office phone
    email:         "studentassistassociation.aei@cet.ac.in", // [Required] Primary contact email
    whatsapp:      "",                             // [Optional] WhatsApp link (https://wa.me/91XXXXXXXXXX)
    address:       "Department of AEI, College of Engineering Trivandrum, Thiruvananthapuram, Kerala 695016",
  },

  // ---------- Google Maps Embed ----------
  // To get this URL: Google Maps → search your location → Share → Embed a map → copy the src URL
  // Set to "" to hide the map section entirely.

  // mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.123!2d76.9!3d8.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sCollege+of+Engineering+Trivandrum!5e0!3m2!1sen!2sin!4v1234567890", // [Optional]
};

// ============================================================================
//  SECTIONS TOGGLE — Show or hide entire sections of the website
// ============================================================================
//
//  HOW TO USE:
//  Set any section to `false` to hide it everywhere:
//    - Navigation bar (desktop & mobile)
//    - Route / page (visiting the URL shows 404)
//    - Home page quick-link card
//
//  Home and About are always visible (not toggleable).
//
//  Example: To temporarily disable the Grievance page:
//    grievance: false,
//
// ============================================================================

const SECTIONS = {
  notices:   true,   // Notices board page
  events:    true,   // Events page
  resources: true,   // Resources / downloads page
  mockTests: true,   // Mock tests portal and quiz routes
  projects:  false,  // Projects showcase page (temporarily disabled)
  grievance: true,   // Anonymous grievance form page
  admin:     true,   // Admin routes (protected)
  contact:   true,   // Contact page
};

export { SITE_CONFIG, SECTIONS };

const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const { db } = require("../config/db");

const router = express.Router();
router.use(authMiddleware);

// Institutional profile for the "About the College" page. Static descriptive
// content is combined with live counts drawn from the academic tables.
const COLLEGE_PROFILE = {
  name: "DIET Engineering College",
  tagline: "Engineering knowledge for a better tomorrow",
  established: "1998",
  accreditation: "NAAC 'A' Grade · NBA Accredited Programmes",
  affiliation: "Affiliated to the State Technological University · Approved by AICTE",
  address: "DIET Campus, College Road, Knowledge City, 500072",
  email: "info@dietcollege.edu",
  phone: "+91 40 2345 6789",
  website: "www.dietcollege.edu",
  vision:
    "To be a centre of excellence in technical education, producing competent, ethical, and socially responsible engineers.",
  mission: [
    "Deliver a rigorous, industry-relevant curriculum supported by modern laboratories.",
    "Nurture innovation, research, and entrepreneurship among students and faculty.",
    "Foster holistic development through co-curricular, cultural, and community engagement."
  ],
  highlights: [
    "Dedicated placement cell with a strong recruiter network",
    "Well-equipped laboratories and a digital library",
    "Active student clubs across technical, cultural, and sports domains"
  ]
};

router.get("/info", (_req, res) => {
  const stats = db
    .prepare(
      `
        SELECT
          (SELECT COUNT(DISTINCT departments.id) FROM departments JOIN branches ON branches.department_id = departments.id) AS departments,
          (SELECT COUNT(*) FROM branches) AS branches,
          (SELECT COUNT(*) FROM courses) AS courses,
          (SELECT COUNT(*) FROM students) AS students,
          (SELECT COUNT(*) FROM faculty) AS faculty,
          (SELECT COUNT(*) FROM events WHERE event_date >= date('now')) AS upcomingEvents
      `
    )
    .get();

  return res.json({ profile: COLLEGE_PROFILE, stats });
});

module.exports = router;

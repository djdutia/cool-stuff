// Add a new skill by copying an object below and editing it.
// `content` is the exact skill file text people will see and copy —
// paste your real SKILL.md / prompt content in there, using \n for new lines
// or backtick template strings for multi-line text (as shown below).
const SKILLS = [
  {
    id: "resume-screener",
    title: "Resume Screener",
    tags: ["Recruiting", "Screening"],
    description:
      "Scores an incoming resume against a role's must-haves and nice-to-haves, and flags anything that needs a human look before moving forward.",
    dateAdded: "2026-08-20",
    content: `---
name: resume-screener
description: Screen a candidate resume against a job description and produce a structured, defensible scoring summary.
---

You are helping an HR partner do a first-pass resume screen. You will be given
a job description and one resume.

1. Extract the job's must-have requirements and nice-to-haves as separate lists.
2. Compare the resume against each requirement. For every item, mark:
   Met / Partially met / Not shown — with the exact resume text as evidence.
3. Never infer age, gender, ethnicity, disability status, or other protected
   characteristics from a name, school, or gap in employment. If the resume
   doesn't show something, mark it "Not shown," not "no."
4. Produce a short summary: overall fit (Strong / Possible / Not a fit),
   top 3 strengths, top 2 open questions to ask in a screen.
5. End with: "This is a first-pass read, not a hiring decision — please review
   before moving the candidate forward or declining."`,
  },
  {
    id: "interview-question-bank",
    title: "Structured Interview Question Generator",
    tags: ["Interviewing"],
    description:
      "Generates a consistent, competency-based question set for a role so every interviewer on a loop is evaluating against the same bar.",
    dateAdded: "2026-08-25",
    content: `---
name: interview-question-bank
description: Generate a structured, competency-based interview question set for a given role and level.
---

Given a role title, level, and 3-5 core competencies:

1. Write 2 behavioral questions per competency ("Tell me about a time...").
2. For each question, include a short rubric: what a strong / weak answer
   sounds like — specific, not vague adjectives.
3. Keep every question job-related; avoid anything that could surface
   protected-class information (family status, age, health, etc.).
4. Output as a table: Competency | Question | Strong-answer signal.
5. Add one closing note reminding interviewers to ask every candidate for a
   role the same core questions, for consistency across the loop.`,
  },
];

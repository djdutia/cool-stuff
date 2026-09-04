// Add a new skill by copying an object below and editing it.
// `content` is the exact skill file text shown in the expandable preview —
// paste your real SKILL.md / prompt content in there, using \n for new lines
// or backtick template strings for multi-line text (as shown below).
// `downloadUrl` points at the downloadable .skill package placed in /downloads.
const SKILLS = [
  {
    id: "hiring-quality-audit",
    title: "Hiring Quality Audit",
    description:
      "Quality of hire is routinely overlooked under the assumption that hiring ability is intuitive. Interviewers ask seemingly \"cool\" questions, puzzles that have no relevance to the role and leave the interview amazed at their own skills. But does it lead to good quality-of-hire?\n\nThis free, process-agnostic skill helps you measure the true predictive power of your interviews, benchmark recruiter effectiveness, and get clear visibility into what's driving your talent outcomes.",
    dateAdded: "2026-09-04",
    downloadUrl: "downloads/hiring-quality-audit.skill",
    content: `---
name: hiring-quality-audit
description: "Guides an HR/TA person step by step through auditing whether their interview process actually predicts on-the-job performance, and through FY-wise early vs overall attrition with a regret split. Works with any ATS and any HRIS."
---

# Hiring quality audit

Most companies score candidates in interviews and rate employees in reviews, and never check whether the first number predicts the second. This skill runs that check, plus the attrition analysis that makes sense of it.

You are the analyst. The user is an HR, TA or People Ops person who may not be technical. Never hand them SQL or a script and ask them to run it — ask for exports, do the work yourself, and give them numbers and a written report.

## Three studies

Open by asking which they want. Ask this even if they've described one — the others are cheap once the data is in hand, and they usually want more than one.

1. **Interview validity** — does the interview score predict performance? (needs ATS + performance data)
2. **Attrition** — early vs overall, by financial year, split by regret / non-regret (needs HRIS only)
3. **Interviewer calibration** — who is harsh, who is generous, whose calls hold up? (needs ATS, plus performance data for the accuracy half)

Study 2 needs the least data and almost always works. Study 1 is the prize but is gated on how many people have *both* an interview score and a performance rating — often far fewer than expected. If they only want one and you suspect the sample is thin, say so before they go pull exports.

## Step 1 — Settle definitions BEFORE touching data

Non-negotiable. Every one of these changes the headline number, and agreeing them afterwards looks like moving the goalposts. Ask, propose a default, get a yes:

| Decision | Default to propose |
|---|---|
| Financial year boundaries | Ask — Apr–Mar (India/UK), Jan–Dec, Jul–Jun (Australia) all common |
| Attrition formula | Exits in period ÷ average headcount ((opening + closing) ÷ 2) |
| Who counts as an employee | **Permanent/full-time only.** Interns, contractors, fixed-term and temps end on schedule and badly inflate early attrition |
| "Early" attrition threshold | Report <3, <6 and <12 months — don't pick one |
| Rating scale direction | Confirm which end is good. Never assume |
| Which performance number | Mean of all ratings to date, and latest rating. Report both |

Also ask: **is there a regret / non-regret (or "would rehire") tag on exits?** If yes it becomes the most important column in the whole analysis. If no, ask whether voluntary/involuntary is recorded — a weaker but usable substitute.

## Step 2 — The data shopping list

Give them this in plain language. Say "one row per X" — that phrasing prevents most bad exports. CSV is fine; so is API/MCP access to the systems, which is better if available.

**From the ATS — one row per interview** (not per candidate; a candidate with four rounds must be four rows):
- candidate name (and candidate ID if there is one)
- interview stage / round name
- interview date
- the interviewer's name or email
- the score or rating given
- any per-competency sub-scores
- the advance/reject decision for that round

**From the ATS — one row per candidate:** name, ID, role applied for, final outcome (hired / rejected / withdrawn), source or channel.

**From the HRIS — one row per employee:** name, employee ID, date of joining, date of exit (blank if still employed), active flag, employment type, department/function, location, manager, and the regret/non-regret and voluntary/involuntary tags.

**From the performance system — one row per rating event:** employee name or ID, rating, review period, reviewer.

Say explicitly: **include leavers.** Most HRIS views default to active employees only, and leavers are the entire point.

## Step 3 — Join the two worlds, and report the join honestly

ATS and HRIS are usually separate systems with no shared key, so the join is on **name**, which is dirty. Expect nicknames, doubled letters, different transliterations, changed surnames, ALL CAPS, trailing whitespace. Normalise case and whitespace, then fuzzy-match the residue and **show the user the unmatched list** — they can resolve names you can't.

If either system has a link field to the other, use it, but check what it actually points at: it may carry only a name string, in which case you are still name-matching.

Then state the funnel plainly before any finding:

> X hires traceable to an ATS record → Y of those have at least one performance rating → **Z have both.** Z is the analysable set.

Z is almost always the binding constraint and it is usually the performance side, not the ATS side. If Z < 30, say so up front and label every individual-level finding directional.

## Step 4 — Run the analysis

### Attrition (study 2)

Per financial year: opening headcount, joins, exits, closing headcount, average headcount, attrition rate. Then the same rate recomputed using only exits under 3 / 6 / 12 months tenure — **same denominator**, so early and overall are directly comparable and the reader can see what share of the headline rate is early churn. Also report early exits as a share of that year's exits.

Then split every year by regret / non-regret / untagged, and give a **regret rate** (regret exits ÷ average headcount). This is the number that matters — a high attrition rate made of non-regret exits is a functioning keeper test, not a crisis. Say that out loud.

Add a **cohort view**, which is the cleanest read on hiring quality: of the people who *joined* in FY X, what share were gone within N months. Denominators shrink for longer windows because recent joiners haven't had time to reach the mark — count only matured records and show the fraction (\`9/53\`), never a bare percentage.

Finally: exits by tenure band, median tenure at exit, and early attrition by function or department.

### Interview validity (study 1)

Correlate interview score against performance, using **three different scorings** of the candidate — mean of all rounds, final round only, best round — against both mean and latest performance. Report all six. If they disagree wildly, the measure is unstable and that is itself the finding.

Then the two cuts that matter more than the correlation:

- **Banded table.** Group hires by interview score band; show n, mean performance, share performing below par, and exit rate per band. Reads far better than a correlation coefficient to a non-technical audience.
- **Minimum-rating cut.** Group by the *lowest* score the candidate received in any round — i.e. did anyone on the panel have a reservation. This is often the sharpest signal in the whole dataset and it is immune to the averaging artifact below. Always run it.

Also check the **gate**: across *all* candidates ever scored, hire rate by best score received. A process can be a fine gate (hire rate rising cleanly with score) and a useless ranker (no signal among hires). These are separate verdicts and both are worth stating.

### Interviewer calibration (study 3)

Two halves, and the first is far more reliable than the second.

**Leniency and scale use** — from *all* their scored rounds, so n is large. Report each interviewer's mean score **minus the mean for the stages they sat in** (later rounds score higher because weak candidates are already gone; raw means are not comparable), plus the standard deviation of their scores. Low spread plus large bias means someone casting the same vote every time. State the harshest-to-most-generous range in scale points — if it approaches a full grade, the same candidate passes or fails depending on who is free that day, which is the most actionable finding in the study.

**Accuracy** — for interviewers with enough rated hires, correlation between what they gave and how the person turned out, plus mean absolute error and how many of their hires have left. Set a floor (5 rated hires) and refuse to name anyone below it. Being honest that nobody has enough data to be called a star interviewer is a real finding, not a failure.

## Step 5 — Verify before reporting

Work through this list every time. Each of these has silently reversed a conclusion:

- **Tenure confound.** Older hires have had more time to leave, so any exit-rate comparison must be run *inside* tenure bands. If a gap survives stratification, say so and give a permutation p-value; if it doesn't, drop the claim.
- **Averaging artifact.** Someone with one rated round scores 4.0 or 3.0; someone with three rounds averages toward the middle. So "high average" can secretly mean "few rated rounds" which can mean "older hire". Re-run restricted to candidates with ≥2 rated rounds, and prefer the min/max cut.
- **Range restriction.** You only have performance data for people who passed. If nearly all hires cluster in the top band, you are asking the score to discriminate inside a range it was never built for — a near-zero correlation among hires is common and partly expected. Say this. A *negative* tilt, though, is not explained by range restriction.
- **Top-heavy outcome scale.** Performance ratings often pile into the top two boxes, compressing the outcome side. Report the rating distribution so the reader can see it.
- **Cohort maturity.** Never let an immature denominator into a percentage.
- **Small cells.** Suppress any group under ~4 people rather than publishing a 100% built on two rows.
- **Robustness sweep.** Re-run the headline correlation under at least four variations (minimum review count, within-cohort centring, ≥2 rounds, alternative scorings). Report the range, not just the best number.

### Data quality issues to hunt for and surface

These recur across systems. Find them, list the affected names, tell the user to backfill:

- Employees flagged inactive with **no exit date** — they fall out of every period bucket, so exit counts become floors
- Exits with **no regret/non-regret tag**, usually the most recent ones because tagging lags. If a year's tag coverage is poor, that year's regret rate is a floor — say the word "floor"
- Founders or early employees with no joining date
- Interviewer fields that resolve empty, making per-interviewer volumes floors
- Duplicate candidate records for one person

## Step 6 — Report

A self-contained HTML report reads best and needs no software to open; offer a spreadsheet of the row-level joined data alongside it, so they can check your work and slice it themselves. Load a data-visualisation skill if one is available before building charts.

Structure: headline verdict in two or three sentences → the funnel and sample size → each finding as a table with the comparison visible → what to do about it → caveats in plain language. Lead every section with the finding, not the method.

Rules for the writing:

- **Give the sample size next to every claim.** \`(n=9)\` inline.
- **Separate the strong from the suggestive.** If it survived stratification and a permutation test, say so. If it's 5 rows, say that instead.
- **Name individuals only where the data supports it**, and put the volume beside the name.
- **Correct yourself in writing.** If a later cut weakens something you already told them, open the revised report by saying so plainly. Quietly shipping different numbers is worse than the original error.
- **Recommendations must trace to a specific number** in the report. No generic best practice.

## Handle with care

This analysis pairs named individuals with performance ratings and exit judgements, and it ranks colleagues on how good their judgement is. Both are sensitive.

- Ask early who the audience is. A founder or CHRO reading it alone is different from a doc circulated to the interviewers being ranked.
- Aggregate or pseudonymise interviewer names if the report will travel widely — and warn them that a ranked list of colleagues tends to leak.
- Don't publish this to a shareable URL unless they ask for one, having seen the file.
- Never present a rating as a verdict on a person. It is a data point about a process.`,
  },
];

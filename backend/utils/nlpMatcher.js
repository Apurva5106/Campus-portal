/**
 * nlpMatcher.js
 * -----------------------------------------------------------------------
 * A lightweight, dependency-free NLP engine used to:
 *   1. Extract "skills" / keywords from raw resume text
 *   2. Compare extracted resume skills against a job description
 *   3. Produce a matching score (0-100), matched skills, missing skills
 *   4. Produce a short human-readable summary + improvement suggestions
 *
 * This is intentionally implemented with classic NLP techniques
 * (tokenising, stop-word removal, stemming-lite, keyword/skill dictionary
 * matching, TF scoring) rather than a heavy ML library, so it runs fast,
 * has zero external API cost, and is easy to extend.
 * -----------------------------------------------------------------------
 */

// A reasonably broad skill dictionary. Extend this any time new skills
// become relevant -- this is the single source of truth for "known skills".
const SKILL_DICTIONARY = [
  // Programming languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c', 'c#', 'go', 'golang',
  'ruby', 'php', 'kotlin', 'swift', 'rust', 'scala', 'r',
  // Web / frontend
  'html', 'css', 'react', 'reactjs', 'redux', 'angular', 'vue', 'next.js', 'nextjs',
  'tailwind', 'bootstrap', 'sass', 'jquery',
  // Backend
  'node.js', 'nodejs', 'express', 'express.js', 'django', 'flask', 'spring', 'spring boot',
  '.net', 'laravel', 'graphql', 'rest api', 'microservices',
  // Databases
  'mongodb', 'mysql', 'postgresql', 'postgres', 'sql', 'nosql', 'redis', 'firebase',
  'sqlite', 'oracle', 'dynamodb',
  // Data / AI
  'machine learning', 'deep learning', 'nlp', 'data science', 'pandas', 'numpy',
  'tensorflow', 'pytorch', 'scikit-learn', 'ai', 'artificial intelligence',
  'data analysis', 'data structures', 'algorithms', 'dsa',
  // DevOps / Cloud
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'git', 'github',
  'linux', 'terraform', 'devops',
  // Mobile
  'android', 'ios', 'flutter', 'react native',
  // Soft / core CS
  'oop', 'object oriented programming', 'system design', 'operating systems',
  'computer networks', 'dbms', 'agile', 'scrum', 'communication', 'leadership',
  'problem solving', 'teamwork', 'time management',
  // Testing
  'testing', 'jest', 'mocha', 'selenium', 'junit', 'unit testing',
];

// Common stop words to strip out before analysis
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'for', 'to', 'of',
  'in', 'on', 'at', 'by', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'this', 'that', 'these', 'those', 'i', 'we', 'you', 'he', 'she', 'it', 'they',
  'as', 'from', 'will', 'can', 'have', 'has', 'had', 'do', 'does', 'did', 'not',
  'my', 'our', 'their', 'his', 'her', 'its', 'about', 'into', 'over', 'after',
]);

/** Normalise text: lowercase, strip punctuation (but keep + # . inside skill tokens) */
function normalise(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[\r\n]+/g, ' ')
    .replace(/[^a-z0-9+#. ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tokenise normalised text into words, removing stop words & very short tokens */
function tokenize(text) {
  return normalise(text)
    .split(' ')
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Extract known skills present in a block of text by scanning the
 * skill dictionary against the normalised text (substring match handles
 * multi-word skills like "machine learning").
 */
function extractSkills(text) {
  const normalised = normalise(text);
  const found = new Set();
  SKILL_DICTIONARY.forEach((skill) => {
    const pattern = skill.toLowerCase();
    if (normalised.includes(pattern)) {
      found.add(skill);
    }
  });
  return Array.from(found);
}

/**
 * Estimate years of experience mentioned in resume text using regex,
 * e.g. "3 years of experience", "2+ years".
 */
function extractExperienceYears(text) {
  const match = normalise(text).match(/(\d+)\+?\s*year/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Core matching function.
 * @param {string} resumeText  Raw text extracted from the resume
 * @param {string} jobDescription  Raw text of the job description/required skills
 * @returns {object} matching result
 */
function matchResumeToJob(resumeText, jobDescription) {
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescription);

  const resumeSkillSet = new Set(resumeSkills);
  const matchedSkills = jobSkills.filter((s) => resumeSkillSet.has(s));
  const missingSkills = jobSkills.filter((s) => !resumeSkillSet.has(s));

  // Score = (matched / required) weighted 80% + keyword density bonus 20%
  let skillScore = 0;
  if (jobSkills.length > 0) {
    skillScore = (matchedSkills.length / jobSkills.length) * 100;
  } else {
    // no explicit skills found in JD -> fall back to generic token overlap
    const jdTokens = new Set(tokenize(jobDescription));
    const resumeTokens = new Set(tokenize(resumeText));
    let overlap = 0;
    jdTokens.forEach((t) => { if (resumeTokens.has(t)) overlap += 1; });
    skillScore = jdTokens.size ? (overlap / jdTokens.size) * 100 : 0;
  }

  const experienceYears = extractExperienceYears(resumeText);
  const experienceBonus = Math.min(experienceYears * 2, 10); // up to +10

  let finalScore = Math.round(Math.min(skillScore + experienceBonus, 100));
  if (Number.isNaN(finalScore)) finalScore = 0;

  return {
    score: finalScore,
    resumeSkills,
    jobSkills,
    matchedSkills,
    missingSkills,
    experienceYears,
  };
}

/**
 * Generate a human-friendly summary + suggestions for a resume,
 * independent of any specific job (used right after upload).
 */
function generateResumeSummary(resumeText) {
  const skills = extractSkills(resumeText);
  const experienceYears = extractExperienceYears(resumeText);
  const wordCount = tokenize(resumeText).length;

  const suggestions = [];

  if (skills.length < 5) {
    suggestions.push('Add more technical/soft skills relevant to your target role — only a few were detected.');
  }
  if (wordCount < 120) {
    suggestions.push('Your resume looks quite short. Add more detail about projects, internships, and achievements.');
  }
  if (!/project/i.test(resumeText)) {
    suggestions.push('Consider adding a dedicated "Projects" section highlighting 2-3 strong projects.');
  }
  if (!/(internship|experience)/i.test(resumeText)) {
    suggestions.push('Mention any internships or work experience, even short-term ones.');
  }
  if (!/(email|@)/i.test(resumeText)) {
    suggestions.push('Make sure your contact email is clearly visible on the resume.');
  }
  if (!/(github|linkedin)/i.test(resumeText)) {
    suggestions.push('Add links to your GitHub/LinkedIn profile to strengthen credibility.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Your resume covers the basics well — keep it updated with your latest projects and skills.');
  }

  // Basic resume "quality" score independent of any job
  let qualityScore = 40; // base
  qualityScore += Math.min(skills.length * 4, 30); // up to +30 for skills
  qualityScore += Math.min(experienceYears * 3, 15); // up to +15 for experience
  qualityScore += /project/i.test(resumeText) ? 10 : 0;
  qualityScore += /(github|linkedin)/i.test(resumeText) ? 5 : 0;
  qualityScore = Math.min(Math.round(qualityScore), 100);

  const summaryText =
    `Detected ${skills.length} relevant skill(s)` +
    (experienceYears ? ` and approximately ${experienceYears} year(s) of experience.` : '.') +
    (skills.length > 0 ? ` Top skills: ${skills.slice(0, 8).join(', ')}.` : '');

  return {
    qualityScore,
    detectedSkills: skills,
    experienceYears,
    summaryText,
    suggestions,
  };
}

module.exports = {
  SKILL_DICTIONARY,
  extractSkills,
  matchResumeToJob,
  generateResumeSummary,
};

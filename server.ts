import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const app = express();
app.use(express.json({ limit: '10mb' }));

// Helper to check API key
function checkApiKey(res: express.Response) {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured in server environment. Please check the Secrets panel in AI Studio.',
    });
    return false;
  }
  return true;
}

// Robust retry wrapper for handling transient 503/429 spikes
async function generateWithRetry(params: any, maxRetries = 3): Promise<any> {
  let delay = 1200;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      const errStr = JSON.stringify(err?.message || err);
      const isTransient =
        errStr.includes('503') ||
        errStr.includes('429') ||
        errStr.includes('UNAVAILABLE') ||
        errStr.includes('high demand') ||
        errStr.includes('RESOURCE_EXHAUSTED');

      if (isTransient && attempt < maxRetries) {
        console.warn(`[Gemini Retry] Transient demand spike (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
}

function formatApiError(error: any): string {
  const errStr = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
  if (errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE')) {
    return 'The AI service is experiencing temporary peak demand. Please wait a moment and try again.';
  }
  if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) {
    return 'Rate limit reached. Please wait a few seconds and click Retry.';
  }
  return error?.message || 'Failed to complete research analysis. Please try again.';
}

// 1. Research Topic Refinement & Background
app.post('/api/research/topic', async (req, res) => {
  if (!checkApiKey(res)) return;
  const { topic, field, academicLevel } = req.body;
  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'Please provide a valid research topic.' });
  }

  try {
    const prompt = `You are an expert academic research advisor helping college students.
Analyze and refine this research topic for a student at the ${academicLevel || 'undergraduate'} level in the field of ${field || 'General Academic Studies'}.

Topic: "${topic.trim()}"

Provide a structured JSON response with the following format:
{
  "refinedTitle": "An academic, precise title formulated from the topic",
  "scopeAnalysis": "Brief critique of scope (is it too broad, too narrow, or well-scoped?) with advice",
  "subTopics": [
    { "title": "Sub-angle 1", "description": "Why this specific aspect is compelling to research" },
    { "title": "Sub-angle 2", "description": "Why this specific aspect is compelling to research" },
    { "title": "Sub-angle 3", "description": "Why this specific aspect is compelling to research" }
  ],
  "keyKeywords": ["Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5", "Keyword 6"],
  "academicDatabases": ["Recommended database 1 (e.g., IEEE Xplore, PubMed, JSTOR)", "Recommended database 2"],
  "conceptualFramework": "Brief 2-3 sentence overview of the theoretical or conceptual lenses suitable for this topic"
}

Ensure strictly valid JSON only. Do not wrap in markdown backticks or markdown fences.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Topic API error:', error);
    return res.status(500).json({
      error: formatApiError(error),
    });
  }
});

// 2. Generate 5 Academic Research Questions
app.post('/api/research/questions', async (req, res) => {
  if (!checkApiKey(res)) return;
  const { topic, field, focusArea } = req.body;
  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    return res.status(400).json({ error: 'Please provide a research topic.' });
  }

  try {
    const prompt = `You are a university thesis and academic research advisor.
Generate exactly FIVE distinct, academically rigorous, and feasible research questions for college students based on:
Topic: "${topic.trim()}"
Field: "${field || 'Interdisciplinary'}"
Focus Area / Special Angle: "${focusArea || 'General undergraduate/graduate study'}"

Provide a structured JSON response containing an array of exactly 5 questions:
{
  "overview": "A concise paragraph summarizing why these 5 questions provide a strong academic foundation for this topic.",
  "questions": [
    {
      "id": 1,
      "type": "Descriptive / Exploratory / Comparative / Correlational / Evaluative",
      "question": "Clear, precise academic research question ending in a question mark",
      "rationale": "Why this question matters and what contribution it makes to the field",
      "independentVariable": "Key independent variable or phenomenon (if applicable)",
      "dependentVariable": "Key dependent variable or outcome measure (if applicable)",
      "suggestedMethodology": "Recommended method (e.g., Cross-sectional survey, Semi-structured interviews, Content analysis, Pre/Post experimental design)",
      "draftHypothesis": "A testable working hypothesis or expected outcome"
    }
  ]
}

Ensure high academic quality (clear variables, testable, avoids simple yes/no phrasing). Strictly valid JSON only.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Questions API error:', error);
    return res.status(500).json({
      error: formatApiError(error),
    });
  }
});

// 3. Paper Summarizer
app.post('/api/research/summarize', async (req, res) => {
  if (!checkApiKey(res)) return;
  const { text, focus } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length < 40) {
    return res.status(400).json({ error: 'Please paste a longer paper excerpt, abstract, or full section (at least 40 characters).' });
  }

  try {
    const prompt = `You are an academic paper analysis expert for college researchers.
Analyze the following academic paper text or abstract:

Text:
"""
${text.trim().slice(0, 25000)}
"""

Focus or perspective: ${focus || 'Comprehensive Academic Summary'}

Provide a structured JSON output with the following schema:
{
  "tldr": "A 1-2 sentence high-level executive takeaway in plain English",
  "researchObjective": "The exact core problem, objective, or research question the paper addresses",
  "methodology": "The study design, dataset/sample size, experimental or qualitative methods used",
  "keyFindings": [
    "Finding 1 with specific metric or conclusion",
    "Finding 2",
    "Finding 3",
    "Finding 4"
  ],
  "limitations": [
    "Methodological or demographic limitation 1 acknowledged or apparent",
    "Limitation 2"
  ],
  "implications": "How this research can be applied in practice or future research",
  "significanceRating": "High / Moderate / Specialized with 1 sentence rationale",
  "keyTerms": ["Term 1", "Term 2", "Term 3", "Term 4"]
}

Strictly valid JSON only.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Summarizer API error:', error);
    return res.status(500).json({
      error: formatApiError(error),
    });
  }
});

// 4. Research Gap Finder (Supports both provided paper texts/summaries and topics)
app.post('/api/research/gaps', async (req, res) => {
  if (!checkApiKey(res)) return;
  const { topic, context, paperText } = req.body;
  
  const hasPaperText = Boolean(paperText && typeof paperText === 'string' && paperText.trim().length > 30);
  const hasTopic = Boolean(topic && typeof topic === 'string' && topic.trim().length > 0);

  if (!hasPaperText && !hasTopic) {
    return res.status(400).json({ error: 'Please provide either paper text/summaries or a research topic.' });
  }

  try {
    let prompt = '';
    if (hasPaperText) {
      prompt = `You are a senior academic research mentor and peer reviewer helping college students identify novel research gaps directly from provided academic papers.

Analyze the following provided paper(s) text, abstracts, or summaries:
"""
${(paperText || '').trim().slice(0, 25000)}
"""

${topic ? `Additional Research Topic / Focus Angle: "${topic.trim()}"` : ''}

Based strictly on the provided paper(s) and their reported findings, methodologies, and limitations, identify five specific, well-defined research gaps that a new study could address:
1. Methodological Gap (limitations in the paper's experimental setup, measurement tools, or analysis techniques)
2. Population / Demographic Gap (demographics, contexts, or sample cohorts excluded or unrepresented in the paper)
3. Contradictory / Unresolved Findings Gap (conflicting evidence, unexpected results, or tensions with broader literature)
4. Theoretical / Conceptual Gap (untested mechanisms, missing conceptual frameworks, or lack of interdisciplinary connections)
5. Practical / Translation Gap (implementation barriers, unexamined real-world deployment challenges, or policy translation)

Return a structured JSON object:
{
  "gapSummary": "A concise scholarly synthesis of what the provided paper(s) accomplished and where its boundaries/blindspots leave opportunities for new research.",
  "analyzedSourceTitle": "Title or inferred subject of the provided paper(s)",
  "gaps": [
    {
      "gapType": "Methodological Gap | Population Gap | Contradictory Gap | Theoretical Gap | Practical Gap",
      "title": "Short descriptive title of the gap",
      "description": "Exactly what the provided paper overlooked, failed to measure, or acknowledged as a boundary",
      "potentialContribution": "Why solving this gap adds novel academic value to scholarship",
      "suggestedResearchApproach": "Concrete, actionable research study proposal or methodology for a college student to investigate this gap",
      "feasibilityForStudents": "High / Medium / Advanced"
    }
  ]
}

Return strictly valid JSON only.`;
    } else {
      prompt = `You are a senior academic research mentor helping college students find publishable, novel research gaps.
Analyze this topic and current knowledge background:

Topic: "${(topic || '').trim()}"
Context / Known Literature: "${context ? context.trim().slice(0, 8000) : 'Standard undergraduate level literature'}"

Identify five specific, well-defined research gaps across these 5 academic gap taxonomies:
1. Methodological Gap (limitations in existing tools, sample sizes, or designs)
2. Population / Demographic Gap (under-researched cohorts, regional contexts, or socio-demographics)
3. Contradictory / Inconsistent Findings Gap (conflicting results in prior literature)
4. Theoretical / Conceptual Gap (untested frameworks or lack of interdisciplinary bridge)
5. Practical / Implementation Gap (disconnect between lab/theoretical results and real-world deployment)

Return a structured JSON object:
{
  "gapSummary": "Overview of where current scholarship plateaus on this subject",
  "analyzedSourceTitle": "${(topic || '').trim()}",
  "gaps": [
    {
      "gapType": "Methodological Gap | Population Gap | Contradictory Gap | Theoretical Gap | Practical Gap",
      "title": "Short descriptive title of the gap",
      "description": "What current literature has overlooked or where knowledge stops",
      "potentialContribution": "Why solving this gap is valuable for academic literature",
      "suggestedResearchApproach": "Concrete study proposal or methodology to investigate this gap",
      "feasibilityForStudents": "High / Medium / Advanced"
    }
  ]
}

Return strictly valid JSON only.`;
    }

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Gap finder API error:', error);
    return res.status(500).json({
      error: formatApiError(error),
    });
  }
});

// 5. Literature Review Synthesizer (Accepts structured papers or raw paper summaries)
app.post('/api/research/literature-review', async (req, res) => {
  if (!checkApiKey(res)) return;
  const { papers, synthesisGoal, rawSummaries } = req.body;

  let papersData = papers;
  if (!Array.isArray(papersData) || papersData.length < 2) {
    if (typeof rawSummaries === 'string' && rawSummaries.trim().length > 60) {
      // Split raw summaries by separator like '---' or double newlines
      const split = rawSummaries.split(/\n\s*---\s*\n|\n\s*===\s*\n/i).map(s => s.trim()).filter(Boolean);
      if (split.length >= 2) {
        papersData = split.map((s, idx) => ({
          id: `raw-${idx + 1}`,
          title: `Paper ${idx + 1}`,
          authors: `Study ${idx + 1}`,
          year: 'Recent',
          findings: s,
        }));
      } else {
        return res.status(400).json({ error: 'Please provide at least 2 distinct paper summaries (separated by ---) to synthesize a literature review.' });
      }
    } else {
      return res.status(400).json({ error: 'Please provide at least 2 paper summaries to synthesize a literature review.' });
    }
  }

  try {
    const prompt = `You are an academic writing and literature review specialist for university researchers.
Synthesize the following research paper summaries into a coherent, organized academic literature review:

Provided Paper Summaries:
${JSON.stringify(papersData, null, 2)}

Goal / Target Section: ${synthesisGoal || 'General Literature Review Chapter / Section'}

Produce a structured JSON response:
{
  "themeTitle": "Overarching Synthesis Theme",
  "thematicMatrix": [
    {
      "theme": "Identified Theme or Sub-topic 1",
      "papersInAgreement": ["Author (Year) or Paper Title"],
      "coreArgument": "Synthesis of how these papers contribute to this specific theme"
    },
    {
      "theme": "Identified Theme or Sub-topic 2",
      "papersInAgreement": ["Author (Year) or Paper Title"],
      "coreArgument": "Synthesis of how these papers contribute to this specific theme"
    }
  ],
  "pointsOfConsensus": [
    "Clear point of general agreement across the analyzed papers",
    "Another point of consensus"
  ],
  "pointsOfDivergence": [
    "Conflicting finding or methodological debate between specific studies",
    "Unresolved tension in the literature"
  ],
  "synthesisNarrative": "A polished 3-4 paragraph academic literature review synthesis text written in scholarly prose, naturally citing the provided papers using standard in-text citations like (Author, Year) or (Study 1). Ready to be inserted into a research paper draft.",
  "recommendedFutureDirections": [
    "Direction 1 based on the synthesis",
    "Direction 2"
  ]
}

Return strictly valid JSON only.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Literature review API error:', error);
    return res.status(500).json({
      error: formatApiError(error),
    });
  }
});

// 6. Citation Generator (Strict Source Fidelity - Zero Hallucinations)
app.post('/api/research/citations', async (req, res) => {
  const { details } = req.body;
  if (!details || typeof details !== 'object') {
    return res.status(400).json({ error: 'Please provide paper details.' });
  }

  const {
    authors,
    year,
    title,
    source, // journal, book, or conference name
    volume,
    issue,
    pages,
    doiOrUrl,
    type, // 'journal' | 'book' | 'conference' | 'website'
  } = details;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Paper title is required.' });
  }

  // Pure deterministic algorithmic formatting without inventing anything
  // Parse authors
  const authorStr = (authors || 'Unknown Author').trim();
  const yearStr = (year || 'n.d.').trim();
  const titleStr = title.trim();
  const sourceStr = (source || '').trim();
  const volumeStr = (volume || '').trim();
  const issueStr = (issue || '').trim();
  const pagesStr = (pages || '').trim();
  const linkStr = (doiOrUrl || '').trim();

  // Normalize DOI
  let formattedLink = linkStr;
  if (linkStr && !linkStr.startsWith('http')) {
    if (linkStr.startsWith('10.')) {
      formattedLink = `https://doi.org/${linkStr}`;
    } else {
      formattedLink = `https://${linkStr}`;
    }
  }

  // Format APA 7th Edition:
  // Journal: Author, A. A. (Year). Title of article. Title of Periodical, volume(issue), pages. https://doi.org/xx
  // Book: Author, A. A. (Year). Title of work: Capital letter also for subtitle. Publisher.
  let apaReference = `${authorStr} (${yearStr}). ${titleStr}.`;
  if (sourceStr) {
    if (type === 'book') {
      apaReference += ` ${sourceStr}.`;
    } else {
      apaReference += ` ${sourceStr}`;
      if (volumeStr) {
        apaReference += `, ${volumeStr}`;
        if (issueStr) {
          apaReference += `(${issueStr})`;
        }
      }
      if (pagesStr) {
        apaReference += `, ${pagesStr}`;
      }
      apaReference += '.';
    }
  }
  if (formattedLink) {
    apaReference += ` ${formattedLink}`;
  }

  // In-text parenthetical and narrative
  // Extract primary author's surname
  const firstAuthor = authorStr.split(',')[0].split('&')[0].trim();
  const authorParts = firstAuthor.split(' ');
  const primaryLastName = authorParts[authorParts.length - 1] || 'Author';
  const hasMultiple = authorStr.includes('&') || authorStr.includes('and') || authorStr.split(',').length > 2;
  const inTextAuthor = hasMultiple ? `${primaryLastName} et al.` : primaryLastName;

  const inTextParenthetical = `(${inTextAuthor}, ${yearStr})`;
  const inTextNarrative = `${inTextAuthor} (${yearStr})`;

  // MLA 9th format
  let mlaReference = `${authorStr}. "${titleStr}."`;
  if (sourceStr) {
    mlaReference += ` ${sourceStr}`;
    if (volumeStr) mlaReference += `, vol. ${volumeStr}`;
    if (issueStr) mlaReference += `, no. ${issueStr}`;
    if (yearStr && yearStr !== 'n.d.') mlaReference += `, ${yearStr}`;
    if (pagesStr) mlaReference += `, pp. ${pagesStr}`;
    mlaReference += '.';
  } else if (yearStr && yearStr !== 'n.d.') {
    mlaReference += ` ${yearStr}.`;
  }
  if (formattedLink) {
    mlaReference += ` ${formattedLink}.`;
  }

  // Chicago 17th format (Notes & Bibliography)
  let chicagoReference = `${authorStr}. "${titleStr}."`;
  if (sourceStr) {
    chicagoReference += ` ${sourceStr}`;
    if (volumeStr) chicagoReference += ` ${volumeStr}`;
    if (issueStr) chicagoReference += `, no. ${issueStr}`;
    if (yearStr && yearStr !== 'n.d.') chicagoReference += ` (${yearStr})`;
    if (pagesStr) chicagoReference += `: ${pagesStr}`;
    chicagoReference += '.';
  }
  if (formattedLink) {
    chicagoReference += ` ${formattedLink}.`;
  }

  // IEEE format
  let ieeeReference = `[1] ${authorStr}, "${titleStr},"`;
  if (sourceStr) {
    ieeeReference += ` ${sourceStr}`;
    if (volumeStr) ieeeReference += `, vol. ${volumeStr}`;
    if (issueStr) ieeeReference += `, no. ${issueStr}`;
    if (pagesStr) ieeeReference += `, pp. ${pagesStr}`;
    if (yearStr && yearStr !== 'n.d.') ieeeReference += `, ${yearStr}`;
    ieeeReference += '.';
  }
  if (formattedLink) {
    ieeeReference += ` [Online]. Available: ${formattedLink}`;
  }

  // BibTeX citation
  const citeKey = `${primaryLastName.toLowerCase().replace(/[^a-z0-9]/g, '')}${yearStr !== 'n.d.' ? yearStr : 'nodate'}`;
  const bibtex = `@article{${citeKey},
  author = {${authorStr}},
  title = {${titleStr}},
  journal = {${sourceStr || 'Journal'}},
  year = {${yearStr !== 'n.d.' ? yearStr : ''}},
  ${volumeStr ? `volume = {${volumeStr}},` : ''}
  ${issueStr ? `number = {${issueStr}},` : ''}
  ${pagesStr ? `pages = {${pagesStr}},` : ''}
  ${formattedLink ? `doi = {${linkStr}},` : ''}
}`;

  return res.json({
    success: true,
    data: {
      apa: apaReference,
      inTextParenthetical,
      inTextNarrative,
      mla: mlaReference,
      chicago: chicagoReference,
      ieee: ieeeReference,
      bibtex,
      sourceAudit: {
        providedFields: Object.keys(details).filter((k) => !!details[k]),
        strictFidelityConfirmed: true,
        disclaimer: 'Generated directly from your provided metadata without web fabrication or hallucinated publications.',
      },
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ResearchMate',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Setup Vite or static serving
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResearchMate server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

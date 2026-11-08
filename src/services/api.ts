import {
  TopicResult,
  QuestionsResult,
  PaperSummary,
  GapsResult,
  LiteratureReviewResult,
  CitationResult,
  PaperEntry,
} from '../types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred.';
    try {
      const errJson = await res.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {
      errorMsg = `Server error (${res.status} ${res.statusText})`;
    }
    throw new Error(errorMsg);
  }
  const json = await res.json();
  return json.data as T;
}

export async function analyzeTopic(
  topic: string,
  field?: string,
  academicLevel?: string
): Promise<TopicResult> {
  const res = await fetch('/api/research/topic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, field, academicLevel }),
  });
  return handleResponse<TopicResult>(res);
}

export async function generateQuestions(
  topic: string,
  field?: string,
  focusArea?: string
): Promise<QuestionsResult> {
  const res = await fetch('/api/research/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, field, focusArea }),
  });
  return handleResponse<QuestionsResult>(res);
}

export async function summarizePaper(
  text: string,
  focus?: string
): Promise<PaperSummary> {
  const res = await fetch('/api/research/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, focus }),
  });
  return handleResponse<PaperSummary>(res);
}

export async function findResearchGaps(
  params: { topic?: string; context?: string; paperText?: string } | string,
  legacyContext?: string
): Promise<GapsResult> {
  const body = typeof params === 'string'
    ? { topic: params, context: legacyContext }
    : params;

  const res = await fetch('/api/research/gaps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<GapsResult>(res);
}

export async function synthesizeLiterature(
  papers: PaperEntry[],
  synthesisGoal?: string,
  rawSummaries?: string
): Promise<LiteratureReviewResult> {
  const res = await fetch('/api/research/literature-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ papers, synthesisGoal, rawSummaries }),
  });
  return handleResponse<LiteratureReviewResult>(res);
}

export interface CitationFormDetails {
  authors: string;
  year: string;
  title: string;
  source: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doiOrUrl?: string;
  type?: 'journal' | 'book' | 'conference' | 'website';
}

export async function generateCitation(
  details: CitationFormDetails
): Promise<CitationResult> {
  const res = await fetch('/api/research/citations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ details }),
  });
  return handleResponse<CitationResult>(res);
}

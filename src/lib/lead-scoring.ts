export interface ScoringInput {
  budget: string;
  photoCount: number;
  description: string;
  phone: string;
  verified: boolean;
}

export function computeLeadScore(input: ScoringInput): number {
  let score = 0;

  // Budget (0–30)
  score += budgetScore(input.budget);

  // Photo count (0–25)
  score += photoScore(input.photoCount);

  // Description quality (0–25)
  score += descriptionScore(input.description);

  // Phone completeness (0–10)
  score += phoneScore(input.phone);

  // Email verified (0–10)
  score += input.verified ? 10 : 0;

  return Math.min(score, 100);
}

function budgetScore(budget: string): number {
  const max = parseMaxBudget(budget);
  if (max >= 15000) return 30;
  if (max >= 10000) return 25;
  if (max >= 7000) return 20;
  if (max >= 4000) return 15;
  if (max >= 2000) return 10;
  if (max >= 500) return 5;
  return 0;
}

function photoScore(count: number): number {
  if (count >= 5) return 25;
  if (count >= 3) return 20;
  if (count >= 1) return 12;
  return 0;
}

function descriptionScore(description: string): number {
  const len = description.trim().length;
  if (len > 300) return 25;
  if (len > 150) return 20;
  if (len > 80) return 15;
  if (len > 40) return 10;
  if (len >= 10) return 5;
  return 0;
}

function phoneScore(phone: string): number {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) return 10;
  if (digits.length >= 7) return 5;
  return 0;
}

function parseMaxBudget(budget: string): number {
  if (!budget) return 0;
  const cleaned = budget
    .replace(/[$€£,\s]/g, "")
    .replace(/[kK]/g, "000")
    .replace(/\./g, "")
    .toLowerCase();

  // Range format "5000-10000" or "5000-10k"
  const rangeMatch = cleaned.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    return Math.max(parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10));
  }

  // Single value "5000" or "5k" or "5000$"
  const singleMatch = cleaned.match(/(\d+)/);
  if (singleMatch) {
    return parseInt(singleMatch[1], 10);
  }

  return 0;
}

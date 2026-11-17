export interface ParsedTemporalJump {
  isJumpRequest: boolean;
  targetDate: string | null;
  deltaDays: number;
  explanation: string;
}

const MONTHS: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

const WORD_NUMBERS: Record<string, number> = {
  one: 1, a: 1, an: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  fifteen: 15,
  twenty: 20,
};

function formatDateISO(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function diffDaysUTC(fromISO: string, toISO: string): number {
  const [y1, m1, d1] = fromISO.split('-').map(Number);
  const [y2, m2, d2] = toISO.split('-').map(Number);
  const utc1 = Date.UTC(y1, (m1 || 1) - 1, d1 || 1);
  const utc2 = Date.UTC(y2, (m2 || 1) - 1, d2 || 1);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Parses natural language commands to detect explicit or relative time-jump requests.
 * Examples handled:
 * - "fast forward into 2029 February 6th"
 * - "fast-forward into 2042 January 1st"
 * - "fast-forward six years from now and tell me what happens"
 * - "fast-forward into 2028 and, following every implementation that we have made, let me see how our country has progressed"
 * - "jump to 2034-05-12"
 * - "advance 18 months"
 */
export function parseTemporalCommand(command: string, currentDateISO: string): ParsedTemporalJump {
  const lower = command.toLowerCase().trim();

  // Check if command contains temporal jump keywords
  const hasJumpTrigger =
    /\b(fast[\s-]*forward|time[\s-]*jump|jump\s+(to|into|ahead|forward|\d+|one|two|three|four|five|six|seven|eight|nine|ten)|advance\s+(time|to|into|by|\d+|one|two|three|four|five|six|seven|eight|nine|ten)|skip\s+(to|ahead|forward|\d+)|simulate\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)|go\s+to\s+20\d{2}|move\s+forward\s+to|progress\s+(to|into)\s+20\d{2})\b/i.test(lower);

  if (!hasJumpTrigger) {
    return { isJumpRequest: false, targetDate: null, deltaDays: 0, explanation: '' };
  }

  const [curYear, curMonth, curDay] = currentDateISO.split('-').map(Number);
  const baseDate = new Date(Date.UTC(curYear, (curMonth || 1) - 1, curDay || 1));

  // 1. Check explicit ISO date: YYYY-MM-DD
  const isoMatch = lower.match(/\b(20[2-9]\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    const targetDate = isoMatch[0];
    const deltaDays = diffDaysUTC(currentDateISO, targetDate);
    if (deltaDays > 0) {
      return {
        isJumpRequest: true,
        targetDate,
        deltaDays,
        explanation: `Jumping to ${targetDate} (${deltaDays} days)`
      };
    }
  }

  // 2. Check Year + Month + Day or Month + Day + Year or Year + Month
  // e.g. "2029 February 6th", "February 6th 2029", "6th February 2029", "January 1st 2042"
  const monthNamesPattern = Object.keys(MONTHS).join('|');

  // Pattern A: Year followed by Month and optional Day ("2029 february 6th")
  const yearMonthDayRegex = new RegExp(`\\b(20[2-9]\\d)\\s*[,\\-]?\\s*(${monthNamesPattern})(?:\\s+(\\d{1,2})(?:st|nd|rd|th)?)?\\b`, 'i');
  const ymdMatch = lower.match(yearMonthDayRegex);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const monthIdx = MONTHS[ymdMatch[2].toLowerCase()];
    const day = ymdMatch[3] ? parseInt(ymdMatch[3], 10) : 1;
    const target = new Date(Date.UTC(year, monthIdx, Math.min(31, Math.max(1, day))));
    const targetDate = formatDateISO(target);
    const deltaDays = diffDaysUTC(currentDateISO, targetDate);
    if (deltaDays > 0) {
      return {
        isJumpRequest: true,
        targetDate,
        deltaDays,
        explanation: `Jumping to ${targetDate} (${deltaDays} days)`
      };
    }
  }

  // Pattern B: Month + optional Day + Year ("february 6th, 2029" or "february 2029")
  const monthDayYearRegex = new RegExp(`\\b(${monthNamesPattern})(?:\\s+(\\d{1,2})(?:st|nd|rd|th)?)?\\s*[,\\-]?\\s*(20[2-9]\\d)\\b`, 'i');
  const mdyMatch = lower.match(monthDayYearRegex);
  if (mdyMatch) {
    const monthIdx = MONTHS[mdyMatch[1].toLowerCase()];
    const day = mdyMatch[2] ? parseInt(mdyMatch[2], 10) : 1;
    const year = parseInt(mdyMatch[3], 10);
    const target = new Date(Date.UTC(year, monthIdx, Math.min(31, Math.max(1, day))));
    const targetDate = formatDateISO(target);
    const deltaDays = diffDaysUTC(currentDateISO, targetDate);
    if (deltaDays > 0) {
      return {
        isJumpRequest: true,
        targetDate,
        deltaDays,
        explanation: `Jumping to ${targetDate} (${deltaDays} days)`
      };
    }
  }

  // Pattern C: Day + Month + Year ("6th february 2029")
  const dayMonthYearRegex = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${monthNamesPattern})\\s*[,\\-]?\\s*(20[2-9]\\d)\\b`, 'i');
  const dmyMatch = lower.match(dayMonthYearRegex);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const monthIdx = MONTHS[dmyMatch[2].toLowerCase()];
    const year = parseInt(dmyMatch[3], 10);
    const target = new Date(Date.UTC(year, monthIdx, Math.min(31, Math.max(1, day))));
    const targetDate = formatDateISO(target);
    const deltaDays = diffDaysUTC(currentDateISO, targetDate);
    if (deltaDays > 0) {
      return {
        isJumpRequest: true,
        targetDate,
        deltaDays,
        explanation: `Jumping to ${targetDate} (${deltaDays} days)`
      };
    }
  }

  // 3. Check relative duration: "six years from now", "5 years", "18 months", "90 days", "3 weeks"
  const wordNumPattern = Object.keys(WORD_NUMBERS).join('|');
  const relativeRegex = new RegExp(`\\b(\\d+|${wordNumPattern})\\s+(day|days|week|weeks|month|months|year|years|decade|decades)\\b`, 'i');
  const relMatch = lower.match(relativeRegex);
  if (relMatch) {
    const rawNum = relMatch[1].toLowerCase();
    const amount = WORD_NUMBERS[rawNum] !== undefined ? WORD_NUMBERS[rawNum] : parseInt(rawNum, 10);
    const unit = relMatch[2].toLowerCase();

    if (!isNaN(amount) && amount > 0) {
      const target = new Date(baseDate.getTime());
      if (unit.startsWith('day')) {
        target.setUTCDate(target.getUTCDate() + amount);
      } else if (unit.startsWith('week')) {
        target.setUTCDate(target.getUTCDate() + amount * 7);
      } else if (unit.startsWith('month')) {
        target.setUTCMonth(target.getUTCMonth() + amount);
      } else if (unit.startsWith('year')) {
        target.setUTCFullYear(target.getUTCFullYear() + amount);
      } else if (unit.startsWith('decade')) {
        target.setUTCFullYear(target.getUTCFullYear() + amount * 10);
      }
      const targetDate = formatDateISO(target);
      const deltaDays = diffDaysUTC(currentDateISO, targetDate);
      if (deltaDays > 0) {
        return {
          isJumpRequest: true,
          targetDate,
          deltaDays,
          explanation: `Jumping forward ${amount} ${unit} to ${targetDate}`
        };
      }
    }
  }

  // 4. Check standalone target year: "fast-forward into 2028", "jump to 2034"
  const yearOnlyMatch = lower.match(/\b(20[2-9]\d)\b/);
  if (yearOnlyMatch) {
    const targetYear = parseInt(yearOnlyMatch[1], 10);
    if (targetYear > curYear) {
      // Preserve current month/day or default to Jan 1 if phrased as "into YYYY"
      const useSameMonthDay = targetYear - curYear <= 2;
      const target = useSameMonthDay
        ? new Date(Date.UTC(targetYear, (curMonth || 1) - 1, curDay || 1))
        : new Date(Date.UTC(targetYear, (curMonth || 1) - 1, curDay || 1));
      const targetDate = formatDateISO(target);
      const deltaDays = diffDaysUTC(currentDateISO, targetDate);
      if (deltaDays > 0) {
        return {
          isJumpRequest: true,
          targetDate,
          deltaDays,
          explanation: `Jumping to ${targetDate} (${deltaDays} days)`
        };
      }
    }
  }

  return { isJumpRequest: false, targetDate: null, deltaDays: 0, explanation: '' };
}

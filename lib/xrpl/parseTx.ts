export class TxJsonParseError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "TxJsonParseError";
    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack;
    }
  }
}

const quoteKeysRegex = /([{,]\s*)([A-Za-z0-9_]+)\s*:/g;

const preprocess = (raw: string): string => {
  // Replace single quotes with double quotes and quote bare keys.
  const withDoubleQuotes = raw.replace(/'/g, '"');
  return withDoubleQuotes.replace(quoteKeysRegex, '$1"$2":');
};

export const parseTxJsonInput = (raw: string): Record<string, unknown> => {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new TxJsonParseError("트랜잭션 JSON 입력이 비어 있습니다.");
  }

  const attempts: string[] = [trimmed, preprocess(trimmed)];

  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt);
    } catch {
      continue;
    }
  }

  throw new TxJsonParseError(
    "트랜잭션 JSON 파싱에 실패했습니다. 유효한 JSON 형식인지 확인하세요.",
  );
};

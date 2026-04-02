import type { JSX } from "react";

const ADDRESS_KEYS = new Set([
  "Account",
  "Destination",
  "Issuer",
  "ClassicAddress",
  "Counterparty",
  "RegularKey",
]);

const TRANSACTION_TYPE_KEYS = new Set(["TransactionType"]);
const PUBLIC_KEY_KEYS = new Set(["SigningPubKey", "SigningPublicKey", "PublicKey"]);
const SEED_KEYS = new Set(["Seed", "Secret", "WalletSeed", "Mnemonic", "MasterSeed"]);

const JSON_HIGHLIGHT_REGEX =
  /("(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

export type ColoredJsonProps = {
  value: unknown;
};

export function ColoredJson({ value }: ColoredJsonProps): JSX.Element {
  const json = JSON.stringify(value, null, 2);
  if (!json) {
    return (
      <pre className="whitespace-pre-wrap break-words font-mono text-xs text-white">
        -
      </pre>
    );
  }

  const fragments: Array<JSX.Element | string> = [];
  let lastIndex = 0;
  let tokenIndex = 0;
  let currentKey: string | null = null;
  let match: RegExpExecArray | null;

  JSON_HIGHLIGHT_REGEX.lastIndex = 0;

  while ((match = JSON_HIGHLIGHT_REGEX.exec(json)) !== null) {
    if (match.index > lastIndex) {
      fragments.push(json.slice(lastIndex, match.index));
    }

    const token = match[0];
    let color = "#FFD166";

    if (token.startsWith('"')) {
      const nextChar = json[JSON_HIGHLIGHT_REGEX.lastIndex];
      if (nextChar === ":") {
        color = "#FFB3F9";
        currentKey = token.slice(1, -1);
      }
    } else if (token === "true" || token === "false" || token === "null") {
      color = "#7CFC00";
      currentKey = null;
    } else {
      color = "#FF8A5B";
      currentKey = null;
    }

    if (token.startsWith('"') && json[JSON_HIGHLIGHT_REGEX.lastIndex] !== ":") {
      if (currentKey) {
        if (ADDRESS_KEYS.has(currentKey) || TRANSACTION_TYPE_KEYS.has(currentKey)) {
          color = "#D4FF9A";
        } else if (PUBLIC_KEY_KEYS.has(currentKey)) {
          color = "#C6F4FF";
        } else if (SEED_KEYS.has(currentKey)) {
          color = "#FFB788";
        }
      }
      currentKey = null;
    }

    fragments.push(
      <span key={`json-token-${tokenIndex++}`} style={{ color }}>
        {token}
      </span>,
    );
    lastIndex = JSON_HIGHLIGHT_REGEX.lastIndex;
  }

  if (lastIndex < json.length) {
    fragments.push(json.slice(lastIndex));
  }

  return (
    <pre className="whitespace-pre-wrap break-words font-mono text-xs text-white">
      {fragments.map((fragment, index) =>
        typeof fragment === "string" ? (
          <span key={`json-text-${index}`}>{fragment}</span>
        ) : (
          fragment
        ),
      )}
    </pre>
  );
}

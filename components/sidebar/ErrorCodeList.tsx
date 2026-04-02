"use client";

import { useMemo, useState } from "react";
import { ERROR_CODES } from "@/data/xrpl/errorCodes";

const XRPL_DOCS_BASE = {
  tec: "https://xrpl.org/docs/references/protocol/transactions/transaction-results/tec-codes",
  tef: "https://xrpl.org/docs/references/protocol/transactions/transaction-results/tef-codes",
  tel: "https://xrpl.org/docs/references/protocol/transactions/transaction-results/tel-codes",
  tem: "https://xrpl.org/docs/references/protocol/transactions/transaction-results/tem-codes",
  ter: "https://xrpl.org/docs/references/protocol/transactions/transaction-results/ter-codes",
} as const;

const docUrlFor = (cls?: string) => {
  if (!cls) return undefined;
  const key = cls.toLowerCase() as keyof typeof XRPL_DOCS_BASE;
  return XRPL_DOCS_BASE[key];
};

export function ErrorCodeList() {
  const [errorQuery, setErrorQuery] = useState("");

  const filteredErrorCodes = useMemo(() => {
    const q = errorQuery.trim().toLowerCase();
    if (!q) return ERROR_CODES;
    return ERROR_CODES.filter(
      (e) =>
        e.code.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q) ||
        e.class.toLowerCase().includes(q),
    );
  }, [errorQuery]);

  return (
    <>
      <div className="sticky top-0 z-10 -mt-1 mb-3 flex flex-wrap items-center justify-start gap-2 rounded-lg border border-white/20 bg-black/100 p-2">
        <input
          value={errorQuery}
          onChange={(e) => setErrorQuery(e.target.value)}
          placeholder='코드/설명 검색: 예) "tecNO_DST"'
          className="basis-full grow rounded-md border border-white/20 bg-black/30 px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 sm:basis-[260px]"
          spellCheck={false}
        />
      </div>
      {filteredErrorCodes.length === 0 ? (
        <div className="rounded-md border border-white/10 bg-black/30 p-3 text-xs text-white/60">
          결과 없음.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2 text-xs text-white/85 sm:grid-cols-2">
          {filteredErrorCodes.map((e) => (
            <li key={e.code} className="rounded-md border border-white/10 bg-black/40 p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-[12px] text-white">{e.code}</code>
                </div>
                <div className="flex items-center gap-2">
                  {docUrlFor(e.class) && (
                    <a
                      href={docUrlFor(e.class)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/10 px-3 py-1 text-[13px] text-white/95 hover:bg-white/20"
                    >
                      상세
                    </a>
                  )}
                </div>
              </div>
              <p className="text-white/80">{e.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { FLAG_ITEMS } from "@/data/xrpl/flags";

export function FlagList() {
  const [flagQuery, setFlagQuery] = useState("");

  const filteredFlags = useMemo(() => {
    const q = flagQuery.trim().toLowerCase();
    if (!q) return FLAG_ITEMS;
    return FLAG_ITEMS.filter((item) =>
      [item.title, item.description].some((field) => field?.toLowerCase().includes(q)),
    );
  }, [flagQuery]);

  return (
    <>
      <div className="sticky top-0 z-10 -mt-1 mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-white/20 bg-black/100 p-2">
        <input
          value={flagQuery}
          onChange={(e) => setFlagQuery(e.target.value)}
          placeholder="플래그 이름/설명 검색"
          className="basis-full grow rounded-md border border-white/20 bg-black/30 px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 sm:basis-[260px]"
          spellCheck={false}
        />
      </div>
      {filteredFlags.length === 0 ? (
        <div className="rounded-md border border-white/10 bg-black/30 p-3 text-xs text-white/60">
          아직 등록된 플래그가 없습니다.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2 text-xs text-white/85 sm:grid-cols-2">
          {filteredFlags.map((flag) => (
            <li key={flag.id} className="rounded-md border border-white/10 bg-black/40 p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {flag.title || "(제목 미정)"}
                  </p>
                  <p className="text-xs text-white/60">
                    {typeof flag.flag === "number" && Number.isFinite(flag.flag)
                      ? `플래그 값(Decimal): ${flag.flag}`
                      : "(Flag 값 미정)"}
                  </p>
                </div>
                {flag.detailUrl ? (
                  <a
                    href={flag.detailUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white/10 px-3 py-1 text-[13px] text-white/95 hover:bg-white/20"
                  >
                    상세
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="rounded-full bg-white/10 px-3 py-1 text-[13px] text-white/60 opacity-40 cursor-not-allowed"
                  >
                    상세
                  </button>
                )}
              </div>
              <p className="text-white/75">
                {flag.description || "아직 설명이 준비되지 않았습니다."}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

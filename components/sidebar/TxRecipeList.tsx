"use client";

import { useMemo, useState } from "react";
import { RECIPES } from "@/data/xrpl/txRecipes";
import { TX_LINKS } from "@/data/xrpl/txLinks";
import type { SidebarContext } from "@/components/sidebar/types";

const pretty = (obj: unknown) => JSON.stringify(obj, null, 2);

type TxRecipeListProps = {
  context?: SidebarContext;
  onInsertTx: (txJson: string, mode?: "replace" | "append") => void;
  onCloseLibrary: () => void;
  onCloseSidebar: () => void;
};

export function TxRecipeList({
  context,
  onInsertTx,
  onCloseLibrary,
  onCloseSidebar,
}: TxRecipeListProps) {
  const [recipeQuery, setRecipeQuery] = useState("");

  const filteredRecipes = useMemo(() => {
    const q = recipeQuery.trim().toLowerCase();
    if (!q) return RECIPES;
    return RECIPES.filter((r) => r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [recipeQuery]);

  const handleInsert = (json: string) => {
    onInsertTx(json, "replace");
    onCloseLibrary();
    onCloseSidebar();
    setTimeout(() => {
      const el = document.querySelector(
        '#tx-editor, [data-tx-editor="true"], textarea[name="tx"]'
      ) as HTMLTextAreaElement | null;

      if (el) {
        el.classList.add("highlight");
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        window.dispatchEvent(new CustomEvent("xrpl-dev:focus-editor"));

        setTimeout(() => {
          el.classList.remove("highlight");
        }, 500);
      }
    }, 0);
  };

  return (
    <>
      <input
        value={recipeQuery}
        onChange={(e) => setRecipeQuery(e.target.value)}
        placeholder="검색 (Transaction title)"
        className="mb-3 w-full rounded-lg border border-white/10 bg-black/50 p-2 text-xs text-white outline-none focus:border-white/30"
      />
      <ul className="space-y-2">
        {filteredRecipes.map((r) => {
          const json = pretty(r.build(context));
          const networkStatus = r.isMainnetActive
            ? ["Mainnet", "Testnet", "Devnet"]
            : ["Devnet"];
          const txLinkData = TX_LINKS.find((tx) => tx.title === r.title);

          return (
            <li key={r.id} className="rounded-lg border border-white/10 bg-black/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{r.title}</p>
                  {networkStatus.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-xs text-white/60">활성 네트워크:</span>
                      {networkStatus.map((status, index) => (
                        <span
                          key={index}
                          className={`text-xs font-medium ${
                            r.isMainnetActive ? "text-green-500" : "text-yellow-500"
                          }`}
                        >
                          {status}
                          {index < networkStatus.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"
                    onClick={() => handleInsert(json)}
                  >
                    Insert
                  </button>
                  {txLinkData?.docref ? (
                    <a
                      href={txLinkData.docref}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/25"
                    >
                      <span>xrpl.org docs</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title="설명 링크 준비 중"
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold opacity-40 cursor-not-allowed"
                    >
                      설명
                    </button>
                  )}
                  {txLinkData?.jsref ? (
                    <a
                      href={txLinkData.jsref}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/25"
                    >
                      <span>xrpl.js</span>
                    </a>
                  ) : null}
                  {txLinkData?.pyref ? (
                    <a
                      href={txLinkData.pyref}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/25"
                    >
                      <span>xrpl-py</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

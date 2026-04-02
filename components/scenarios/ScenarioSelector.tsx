"use client";

import { SCENARIOS } from "@/data/scenarios";
import type { ScenarioDef } from "@/data/scenarios/types";

type ScenarioSelectorProps = {
  onSelect: (scenario: ScenarioDef) => void;
  onClose: () => void;
};

export function ScenarioSelector({ onSelect, onClose }: ScenarioSelectorProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-6 py-10"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/15 bg-neutral-900 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Scenario Guide</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            닫기
          </button>
        </div>
        <p className="text-sm text-white/60 mb-5">
          핀테크 비즈니스에서 XRPL을 활용하는 실전 시나리오를 스텝별로 체험해보세요.
        </p>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {SCENARIOS.map((scenario, i) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelect(scenario)}
              className="group w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-left transition hover:border-white/20 hover:bg-white/5"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-[#D4FF9A]">
                    {scenario.title}
                  </p>
                  <p className="mt-0.5 text-xs text-white/50">{scenario.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

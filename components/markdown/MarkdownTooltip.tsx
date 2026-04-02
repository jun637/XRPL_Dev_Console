"use client";

import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import { withBasePath } from "@/lib/utils/basePath";

export type MarkdownTooltipState = {
  content: string;
  loading: boolean;
  error: string | null;
};

const prefixAssetUrl = (url?: string) =>
  url && url.startsWith("/") ? withBasePath(url) : url;

export const markdownComponents = {
  a: ({
    node: _node,
    href,
    ...props
  }: ComponentProps<"a"> & { node?: unknown }) => {
    const patchedHref =
      typeof href === "string" ? prefixAssetUrl(href) : href;
    return (
      <a
        {...props}
        href={patchedHref}
        target="_blank"
        rel="noreferrer"
      />
    );
  },
  img: ({
    node: _node,
    src,
    ...props
  }: ComponentProps<"img"> & { node?: unknown }) => {
    const patchedSrc = typeof src === "string" ? prefixAssetUrl(src) : src;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={patchedSrc} />;
  },
};

export const MARKDOWN_TOOLTIP_CLASS =
  "markdown-tooltip space-y-8 text-[15px] leading-relaxed text-white/90 [&_*]:text-white/90 [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-[#D4FF9A] [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:text-lg [&_strong]:text-white [&_strong]:font-semibold [&_em]:text-white/80 [&_em]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-white/30 [&_blockquote]:pl-4 [&_blockquote]:text-white [&_ul]:space-y-1 [&_li]:marker:text-[#D4FF9A] [&_a]:text-[#D4FF9A] [&_a]:underline [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_pre]:rounded-lg [&_pre]:bg-white/5 [&_pre]:p-3";

export const TOOLTIP_OVERLAY_CLASS =
  "pointer-events-none absolute right-0 top-full z-100 mt-2 w-[min(1000px,60vw)] max-w-[1000px] h-[600px] max-h-[800px] overflow-y-auto rounded-2xl border border-white/15 bg-neutral-800 p-4 text-left text-xs leading-relaxed text-white/90 opacity-0 shadow-xl transition-opacity duration-150 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100";

export const useMarkdownTooltip = (path: string): MarkdownTooltipState => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadMarkdown = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(withBasePath(path), { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load ${path} (${response.status})`);
        }
        const text = await response.text();
        if (!cancelled) {
          setContent(text);
        }
      } catch {
        if (!cancelled) {
          setError("툴팁 내용을 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadMarkdown();

    return () => {
      cancelled = true;
    };
  }, [path]);

  return { content, loading, error };
};

export function MarkdownTooltipPanel({
  state,
  emptyMessage,
}: {
  state: MarkdownTooltipState;
  emptyMessage: string;
}) {
  if (state.loading) {
    return <p className="text-sm text-white/70">Markdown 내용을 불러오는 중입니다…</p>;
  }
  if (state.error) {
    return <p className="text-sm text-red-300">{state.error}</p>;
  }
  if (state.content.trim().length > 0) {
    return (
      <div className="rounded-2xl border border-white/20 bg-black/90 p-4 shadow-inner">
        <div className="max-h-[520px] overflow-y-auto rounded-xl border border-white/10 bg-black/95 p-4">
          <div className={MARKDOWN_TOOLTIP_CLASS}>
            <ReactMarkdown components={markdownComponents}>{state.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }
  return <div className="text-sm text-white/70">{emptyMessage}</div>;
}

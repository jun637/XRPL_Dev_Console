"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/utils/basePath";

export type MarkdownContentState = {
  content: string;
  loading: boolean;
  error: string | null;
};

export const useMarkdownContent = (path: string): MarkdownContentState => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
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
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "온보딩 내용을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [path]);

  return { content, loading, error };
};

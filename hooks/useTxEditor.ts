"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
  type MutableRefObject,
} from "react";
import { parseTxJsonInput, TxJsonParseError } from "@/lib/xrpl/parseTx";

export type UseTxEditorResult = {
  rawTx: string;
  setRawTx: (value: string) => void;
  txInputRef: MutableRefObject<HTMLTextAreaElement | null>;
  handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
  insertTx: (next: string, mode?: "replace" | "append") => void;
  parsedTx: Record<string, unknown> | null;
  parseError: string | null;
};

export function useTxEditor(initialValue: string): UseTxEditorResult {
  const [rawTx, setRawTx] = useState(initialValue);
  const txInputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      if (event.key !== "Enter") return;

      const nativeEvent = event.nativeEvent as unknown as {
        isComposing?: boolean;
        keyCode?: number;
      };
      if (nativeEvent?.isComposing || nativeEvent?.keyCode === 229) return;

      const el = txInputRef.current;
      if (!el) return;

      event.preventDefault();

      const value = rawTx;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const before = value.slice(0, start);
      const after = value.slice(end);

      const charBefore = value[start - 1] ?? "";
      const charAfter = value[end] ?? "";
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const currentLine = value.slice(lineStart, start);
      const baseIndent = currentLine.match(/^\s*/)?.[0] ?? "";

      if (charBefore === "{" && charAfter === "}") {
        const insert = `\n${baseIndent}  \n${baseIndent}`;
        const nextValue = before + insert + after;
        setRawTx(nextValue);
        requestAnimationFrame(() => {
          const target = txInputRef.current;
          if (!target) return;
          const caret = start + 1 + baseIndent.length + 2;
          target.selectionStart = caret;
          target.selectionEnd = caret;
          target.focus();
        });
        return;
      }

      const needsExtraIndent = /{\s*$/.test(currentLine);
      const indent = baseIndent + (needsExtraIndent ? "  " : "");
      const insert = `\n${indent}`;
      const nextValue = before + insert + after;
      setRawTx(nextValue);
      requestAnimationFrame(() => {
        const target = txInputRef.current;
        if (!target) return;
        const caret = start + insert.length;
        target.selectionStart = caret;
        target.selectionEnd = caret;
        target.focus();
      });
    },
    [rawTx],
  );

  const insertTx = useCallback(
    (next: string, mode: "replace" | "append" = "replace") => {
      setRawTx((prev) =>
        mode === "replace" ? next : `${prev.trim()}\n\n${next.trim()}`,
      );
    },
    [],
  );

  const parseResult = useMemo(() => {
    try {
      return { parsed: parseTxJsonInput(rawTx), error: null as string | null };
    } catch (error) {
      if (error instanceof TxJsonParseError) {
        return { parsed: null, error: error.message };
      }
      return { parsed: null, error: "트랜잭션 JSON을 확인하세요." };
    }
  }, [rawTx]);

  return {
    rawTx,
    setRawTx,
    txInputRef,
    handleKeyDown,
    insertTx,
    parsedTx: parseResult.parsed,
    parseError: parseResult.error,
  };
}

export const walletConnectProjectId =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_PROJECT_ID?.trim() ?? null : null;

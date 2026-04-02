export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
};

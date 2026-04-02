export const logBasePath = () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("[XRPL Dev Console] basePath:", process.env.NEXT_PUBLIC_BASE_PATH);
  }
};

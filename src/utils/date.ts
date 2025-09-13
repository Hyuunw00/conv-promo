export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
  });

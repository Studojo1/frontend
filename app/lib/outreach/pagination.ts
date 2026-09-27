// Which page numbers the leads pagination shows: at most `size` buttons,
// sliding so the current page stays in view. With ~800 leads at 20 per page
// there are 40 pages, too many to render as a row of buttons.
export function pageWindow(page: number, totalPages: number, size = 7): number[] {
  if (totalPages <= 0) return [];
  const count = Math.min(size, totalPages);
  const current = Math.min(Math.max(1, page), totalPages);
  const half = Math.floor(count / 2);
  const start = Math.min(Math.max(1, current - half), totalPages - count + 1);
  return Array.from({ length: count }, (_, i) => start + i);
}

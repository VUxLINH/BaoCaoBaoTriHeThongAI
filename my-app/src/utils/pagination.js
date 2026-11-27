export const DEFAULT_PAGE_SIZE = 10;

export function paginateItems(items, page, pageSize = DEFAULT_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

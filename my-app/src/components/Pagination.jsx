import { DEFAULT_PAGE_SIZE } from '../utils/pagination';

export default function Pagination({
  totalItems,
  page,
  onPageChange,
  pageSize = DEFAULT_PAGE_SIZE,
}) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav className="pagination-controls" aria-label="Phân trang danh sách">
      <span className="pagination-summary">
        Hiển thị {firstItem}–{lastItem} / {totalItems}
      </span>
      <div className="pagination-buttons">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Trang trước"
        >
          Trước
        </button>
        <span aria-current="page">Trang {currentPage} / {totalPages}</span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Trang sau"
        >
          Sau
        </button>
      </div>
    </nav>
  );
}

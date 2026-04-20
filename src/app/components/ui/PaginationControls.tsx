interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  from: number;
  to: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  from,
  to,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  return (
    <div className="px-5 py-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
      <div>
        Showing {from}-{to} of {totalItems}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5">
          <span>Rows:</span>
          <select
            className="field py-1.5 px-2 text-xs min-w-[84px]"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button className="btn btn-muted btn-sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>
            Prev
          </button>
          <span className="px-2 text-xs">
            {currentPage} / {totalPages}
          </span>
          <button
            className="btn btn-muted btn-sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

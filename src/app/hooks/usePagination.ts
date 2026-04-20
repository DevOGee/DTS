import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

const PAGE_SIZE_OPTIONS = [10, 25, 100, 1000];

export function usePagination(totalItems: number, defaultPageSize = 10) {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const pageFromUrl = Number(searchParams.get('page') || '1');
  const limitFromUrl = Number(searchParams.get('limit') || String(defaultPageSize));

  const pageSize = PAGE_SIZE_OPTIONS.includes(limitFromUrl) ? limitFromUrl : defaultPageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, pageFromUrl), totalPages);
  const offset = (currentPage - 1) * pageSize;

  const setPagination = (nextPage: number, nextPageSize = pageSize) => {
    const params = new URLSearchParams(location.search);
    params.set('page', String(nextPage));
    params.set('limit', String(nextPageSize));
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const setPage = (page: number) => setPagination(page, pageSize);
  const setPageSize = (size: number) => setPagination(1, size);

  return {
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    pageSize,
    currentPage,
    totalPages,
    offset,
    limit: pageSize,
    from: totalItems === 0 ? 0 : offset + 1,
    to: Math.min(offset + pageSize, totalItems),
    setPage,
    setPageSize,
  };
}

export interface PaginationLinks {
  first: string;
  last: string;
  next?: string;
  prev?: string;
}

export interface Pagination {
  has_next: boolean;
  has_prev: boolean;
  links: PaginationLinks;
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

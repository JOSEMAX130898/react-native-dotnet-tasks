/** Contrato JSON de la API (/api/v1/tasks). Refleja exactamente lo que viaja por la red. */
export interface TaskSummaryDto {
  id: number;
  title: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface TaskDetailDto extends TaskSummaryDto {
  description: string | null;
}

export interface PagedResultDto<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
}

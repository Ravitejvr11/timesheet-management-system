import type { ProjectStatus } from './project.model';

export interface CreateProjectRequest {
  name: string;
  code: string;
  status: ProjectStatus;
  clientName: string;
  isBillable: boolean;
  description?: string | null;
  employeeIds: string[];
  id?: number;
}

export type UpdateProjectRequest = CreateProjectRequest

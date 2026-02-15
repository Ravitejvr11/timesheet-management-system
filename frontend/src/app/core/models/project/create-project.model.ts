import type { ProjectStatus } from './project.model';

export interface CreateProjectRequest {
  name: string;
  code: string;
  status: ProjectStatus;
  clientName: string;
  isBillable: boolean;
  description?: string | null;
  employeeIds: string[];
}

export type UpdateProjectRequest = CreateProjectRequest

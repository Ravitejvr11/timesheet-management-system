import type { Project } from '../../core/models/project/project.model';
import type { Employee } from '@core/models/project/employee.model';


export interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;

  employees: Employee[];
  assignedEmployeeIds: string[];
  employeesLoading: boolean;
  statusUpdating: boolean;
}

export const initialProjectState: ProjectState = {
  projects: [],
  loading: false,
  error: null,

  employees: [],
  assignedEmployeeIds: [],
  employeesLoading: false,
  statusUpdating: false,
};


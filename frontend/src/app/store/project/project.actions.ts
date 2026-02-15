import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { Project } from '../../core/models/project/project.model';
import type { CreateProjectRequest, UpdateProjectRequest } from '../../core/models/project/create-project.model';
import type { Employee } from '@core/models/project/employee.model';

export const ProjectActions = createActionGroup({
  source: 'Project',
  events: {
    'Load Projects': emptyProps(),
    'Load Projects Success': props<{ projects: Project[] }>(),
    'Load Projects Failure': props<{ error: string }>(),

    'Create Project': props<{ request: CreateProjectRequest }>(),
    'Create Project Success': props<{ project: Project }>(),
    'Create Project Failure': props<{ error: string }>(),
    'Update Project': props<{ id: number; request: UpdateProjectRequest }>(),
    'Update Project Success': props<{ project: Project }>(),
    'Update Project Failure': props<{ error: string }>(),
    'Activate Project': props<{ id: number }>(),
    'Activate Project Success': props<{ id: number }>(),
    'Activate Project Failure': props<{ error: string }>(),
    'Deactivate Project': props<{ id: number }>(),
    'Deactivate Project Success': props<{ id: number }>(),
    'Deactivate Project Failure': props<{ error: string }>(),


    'Load Employees': emptyProps(),
    'Load Employees Success': props<{ employees: Employee[] }>(),
    'Load Employees Failure': props<{ error: string }>(),

    'Load Assigned Employees': props<{ projectId: number }>(),
    'Load Assigned Employees Success': props<{ employeeIds: string[] }>(),
    'Load Assigned Employees Failure': props<{ error: string }>(),
  },
});

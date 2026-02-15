import { createFeature, createReducer, on } from '@ngrx/store';
import { initialProjectState } from './project.state';
import { ProjectActions } from './project.actions';
import { ProjectStatus } from '@core/models/project/project.model';

export const projectFeature = createFeature({
  name: 'project',
  reducer: createReducer(
    initialProjectState,

    on(ProjectActions.loadProjects, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),

    on(ProjectActions.loadProjectsSuccess, (state, { projects }) => ({
      ...state,
      loading: false,
      projects,
    })),

    on(ProjectActions.loadProjectsFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    on(ProjectActions.loadEmployees, (state) => ({
      ...state,
      employeesLoading: true,
    })),

    on(ProjectActions.loadEmployeesSuccess, (state, { employees }) => ({
      ...state,
      employeesLoading: false,
      employees,
    })),

    on(ProjectActions.loadEmployeesFailure, (state, { error }) => ({
      ...state,
      employeesLoading: false,
      error,
    })),

    on(ProjectActions.loadAssignedEmployees, (state) => ({
      ...state,
      employeesLoading: true,
      assignedEmployeeIds: [],
    })),

    on(
      ProjectActions.loadAssignedEmployeesSuccess,
      (state, { employeeIds }) => ({
        ...state,
        employeesLoading: false,
        assignedEmployeeIds: employeeIds,
      }),
    ),

    on(ProjectActions.loadAssignedEmployeesFailure, (state, { error }) => ({
      ...state,
      employeesLoading: false,
      error,
    })),

    on(ProjectActions.createProject, (state) => ({
      ...state,
      loading: true,
    })),

    on(ProjectActions.createProjectSuccess, (state, { project }) => ({
      ...state,
      loading: false,
      projects: [...state.projects, project],
    })),

    on(ProjectActions.createProjectFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    on(ProjectActions.updateProject, (state) => ({
      ...state,
      loading: true,
    })),

    on(ProjectActions.updateProjectSuccess, (state, { project }) => ({
      ...state,
      loading: false,
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
    })),

    on(ProjectActions.updateProjectFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    on(ProjectActions.activateProject, (state) => ({
      ...state,
      statusUpdating: true,
    })),

    on(ProjectActions.activateProjectSuccess, (state, { id }) => ({
      ...state,
      loading: false,
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, status: ProjectStatus.Active } : p,
      ),
    })),

    on(ProjectActions.activateProjectFailure, (state, { error }) => ({
      ...state,
      statusUpdating: false,
      error,
    })),

    on(ProjectActions.deactivateProject, (state) => ({
      ...state,
      statusUpdating: false,
    })),

    on(ProjectActions.activateProjectSuccess, (state, { id }) => ({
      ...state,
      statusUpdating: false,
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, status: ProjectStatus.Active } : p,
      ),
    })),

    on(ProjectActions.deactivateProjectFailure, (state, { error }) => ({
      ...state,
      statusUpdating: false,
      error,
    })),
  ),
});

import { createFeature, createReducer, on } from '@ngrx/store';
import { initialProjectState } from './project.state';
import { ProjectActions } from './project.actions';

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
  ),
});

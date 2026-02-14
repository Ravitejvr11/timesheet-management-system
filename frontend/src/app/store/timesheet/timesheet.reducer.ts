import { createFeature, createReducer, on } from '@ngrx/store';
import { initialTimesheetState } from './timesheet.state';
import { TimesheetActions } from './timesheet.action';

const reducer = createReducer(
  initialTimesheetState,

  /* =============================
     LOAD PROJECTS
  ============================== */

  on(TimesheetActions.loadProjects, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // selecting the first project by default
  on(TimesheetActions.loadProjectsSuccess, (state, { projects }) => ({
    ...state,
    projects,
    selectedProjectId:
      state.selectedProjectId ?? (projects.length ? projects[0].id : null),
    loading: false,
  })),

  on(TimesheetActions.loadProjectsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  /* =============================
     LOAD TIMESHEETS
  ============================== */

  on(TimesheetActions.loadTimesheets, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TimesheetActions.loadTimesheetsSuccess, (state, { timesheets }) => ({
    ...state,
    timesheets,
    loading: false,
  })),

  on(TimesheetActions.loadTimesheetsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  /* =============================
     SELECT PROJECT
  ============================== */

  on(TimesheetActions.selectProject, (state, { projectId }) => ({
    ...state,
    selectedProjectId: projectId,
  })),
);

export const timesheetFeature = createFeature({
  name: 'timesheet',
  reducer,
});

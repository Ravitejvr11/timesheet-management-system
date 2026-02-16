import { createFeature, createReducer, on } from '@ngrx/store';
import { initialTimesheetState } from './timesheet.state';
import { TimesheetActions } from './timesheet.action';
import { TimesheetStatus } from '@core/models/timesheet/timesheet-status.util';

export const timesheetFeature = createFeature({
  name: 'timesheet',

  reducer: createReducer(
    initialTimesheetState,

    /* =============================
       LOAD PROJECTS
    ============================== */

    on(TimesheetActions.loadProjects, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),

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

    /* =============================
       CREATE TIMESHEET
    ============================== */

    on(TimesheetActions.createTimesheet, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),

    on(TimesheetActions.createTimesheetSuccess, (state) => ({
      ...state,
      loading: false,
    })),

    on(TimesheetActions.createTimesheetFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    /* =============================
        UPDATE TIMESHEET
      ============================== */

    on(TimesheetActions.updateTimesheet, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),

    on(TimesheetActions.updateTimesheetSuccess, (state, { timesheet }) => ({
      ...state,
      loading: false,
      timesheets: state.timesheets.map((ts) =>
        ts.id === timesheet.id ? timesheet : ts,
      ),
    })),

    on(TimesheetActions.updateTimesheetFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    on(TimesheetActions.submitTimesheetSuccess, (state, { id }) => ({
      ...state,
      timesheets: state.timesheets.map((ts) =>
        ts.id === id ? { ...ts, status: TimesheetStatus.Submitted } : ts,
      ),
    })),

    on(TimesheetActions.loadManagerTimesheets, (state) => ({
      ...state,
      managerLoading: true,
    })),

    on(
      TimesheetActions.loadManagerTimesheetsSuccess,
      (state, { timesheets }) => ({
        ...state,
        managerLoading: false,
        managerTimesheets: timesheets,
      }),
    ),

    on(TimesheetActions.loadManagerTimesheetsFailure, (state, { error }) => ({
      ...state,
      managerLoading: false,
      error,
    })),

    on(TimesheetActions.approveTimesheet, (state) => ({
      ...state,
      approvalLoading: true,
    })),

    on(TimesheetActions.approveTimesheetSuccess, (state, { id }) => ({
      ...state,
      approvalLoading: false,
      managerTimesheets: state.managerTimesheets.map((t) =>
        t.id === id ? { ...t, status: TimesheetStatus.Approved } : t,
      ),
    })),

    on(TimesheetActions.approveTimesheetFailure, (state, { error }) => ({
      ...state,
      approvalLoading: false,
      error,
    })),

    on(TimesheetActions.rejectTimesheet, (state) => ({
      ...state,
      approvalLoading: true,
    })),

    on(TimesheetActions.rejectTimesheetSuccess, (state, { id, comments }) => ({
      ...state,
      approvalLoading: false,
      managerTimesheets: state.managerTimesheets.map((t) =>
        t.id === id ? { ...t, status: TimesheetStatus.Rejected, comments } : t,
      ),
    })),

    on(TimesheetActions.rejectTimesheetFailure, (state, { error }) => ({
      ...state,
      approvalLoading: false,
      error,
    })),

    on(TimesheetActions.loadReportSummary, (state) => ({
      ...state,
      reportLoading: true,
    })),

    on(TimesheetActions.loadReportSummarySuccess, (state, { summary }) => ({
      ...state,
      reportLoading: false,
      reportSummary: summary,
    })),

    on(TimesheetActions.loadReportSummaryFailure, (state, { error }) => ({
      ...state,
      reportLoading: false,
      error,
    })),
  ),
});

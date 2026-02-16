import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of, take } from 'rxjs';
import { ProjectService } from '@core/services/project.service';
import { TimesheetActions } from './timesheet.action';
import { TimesheetService } from '@core/services/timesheet.service';
import { timesheetFeature } from './timesheet.reducer';
import { Store } from '@ngrx/store';
import type { TimesheetDetailModel } from '@core/models/timesheet/timesheet-details.model';
import { Router } from '@angular/router';

@Injectable()
export class TimesheetEffects {
  private actions$ = inject(Actions);
  private projectService = inject(ProjectService);
  private timesheetService = inject(TimesheetService);
  private store = inject(Store);
  private router = inject(Router);

  // load projects
  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.loadProjects),
      switchMap(() =>
        this.projectService.getMyProjects().pipe(
          map((projects) => TimesheetActions.loadProjectsSuccess({ projects })),
          catchError((error) =>
            of(
              TimesheetActions.loadProjectsFailure({
                error: error?.message ?? 'Failed to load projects',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // create timesheet
  createTimesheet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.createTimesheet),
      switchMap(({ projectId, weekStartDate, weekEndDate }) =>
        this.timesheetService
          .createTimesheet({
            projectId,
            weekStartDate,
            weekEndDate,
          })
          .pipe(
            map((timesheet) =>
              TimesheetActions.createTimesheetSuccess({ timesheet }),
            ),
            catchError((error) =>
              of(
                TimesheetActions.createTimesheetFailure({
                  error: error?.error?.message ?? 'Failed to create timesheet',
                }),
              ),
            ),
          ),
      ),
    ),
  );

  // load timesheets
  loadTimesheets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.loadTimesheets),
      switchMap(({ projectId }) =>
        this.timesheetService.getTimesheets(projectId).pipe(
          map((timesheets) =>
            TimesheetActions.loadTimesheetsSuccess({
              timesheets,
            }),
          ),
          catchError((error) =>
            of(
              TimesheetActions.loadTimesheetsFailure({
                error: error?.error?.message ?? 'Failed to load timesheets',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  autoLoadTimesheets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        TimesheetActions.loadProjectsSuccess,
        TimesheetActions.selectProject,
        TimesheetActions.createTimesheetSuccess,
      ),
      switchMap(() => {
        return this.store.select(timesheetFeature.selectSelectedProjectId).pipe(
          take(1),
          map((projectId) =>
            projectId
              ? TimesheetActions.loadTimesheets({ projectId })
              : { type: '[Timesheet] No Project Selected' },
          ),
        );
      }),
    ),
  );

  updateTimesheet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.updateTimesheet),
      switchMap(({ id, weekStartDate, weekEndDate, entries }) =>
        this.timesheetService
          .updateTimesheet(id, {
            weekStartDate,
            weekEndDate,
            entries,
          })
          .pipe(
            map((response) =>
              TimesheetActions.updateTimesheetSuccess({
                timesheet: response as TimesheetDetailModel,
              }),
            ),
            catchError((error) =>
              of(
                TimesheetActions.updateTimesheetFailure({
                  error: error?.error?.message ?? 'Failed to update timesheet',
                }),
              ),
            ),
          ),
      ),
    ),
  );

  submitTimesheet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.submitTimesheet),
      switchMap(({ id }) =>
        this.timesheetService.submitTimesheet(id).pipe(
          map(() => TimesheetActions.submitTimesheetSuccess({ id })),
          catchError((error) =>
            of(TimesheetActions.submitTimesheetFailure({ error })),
          ),
        ),
      ),
    ),
  );

  navigateAfterCreate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TimesheetActions.createTimesheetSuccess),
        map(({ timesheet }) => {
          this.router.navigate([
            '/dashboard',
            'timesheets',
            timesheet?.id,
            'entry',
          ]);
        }),
      ),
    { dispatch: false },
  );

  loadManagerTimesheets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.loadManagerTimesheets),
      switchMap(() =>
        this.timesheetService.getForManager().pipe(
          map((timesheets) =>
            TimesheetActions.loadManagerTimesheetsSuccess({ timesheets }),
          ),
          catchError((error) =>
            of(
              TimesheetActions.loadManagerTimesheetsFailure({
                error: error?.message ?? 'Failed to load timesheets',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  approveTimesheet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.approveTimesheet),
      switchMap(({ id }) =>
        this.timesheetService.approveTimesheet(id).pipe(
          map(() => TimesheetActions.approveTimesheetSuccess({ id })),
          catchError((error) =>
            of(
              TimesheetActions.approveTimesheetFailure({
                error: error?.message ?? 'Failed to approve timesheet',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  rejectTimesheet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.rejectTimesheet),
      switchMap(({ id, comments }) =>
        this.timesheetService.rejectTimesheet(id, comments).pipe(
          map(() => TimesheetActions.rejectTimesheetSuccess({ id, comments })),
          catchError((error) =>
            of(
              TimesheetActions.rejectTimesheetFailure({
                error: error?.message ?? 'Failed to reject timesheet',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadReportSummary$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.loadReportSummary),
      switchMap(({ filter }) =>
        this.timesheetService.getReportSummary(filter).pipe(
          map((summary) =>
            TimesheetActions.loadReportSummarySuccess({ summary }),
          ),
          catchError((error) =>
            of(
              TimesheetActions.loadReportSummaryFailure({
                error: error?.message ?? 'Failed to load report',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}

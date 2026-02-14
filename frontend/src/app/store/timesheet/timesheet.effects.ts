import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of, take } from 'rxjs';
import { ProjectService } from '@core/services/project.service';
import { TimesheetActions } from './timesheet.action';
import { TimesheetService } from '@core/services/timesheet.service';
import { timesheetFeature } from './timesheet.reducer';
import { Store } from '@ngrx/store';

@Injectable()
export class TimesheetEffects {
  private actions$ = inject(Actions);
  private projectService = inject(ProjectService);
  private timesheetService = inject(TimesheetService);
  private store = inject(Store);

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
            map(() => TimesheetActions.createTimesheetSuccess()),
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
}

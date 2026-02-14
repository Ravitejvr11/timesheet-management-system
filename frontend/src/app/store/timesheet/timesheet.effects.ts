import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of } from 'rxjs';
import { ProjectService } from '@core/services/project.service';
import { TimesheetActions } from './timesheet.action';

@Injectable()
export class TimesheetEffects {
  private actions$ = inject(Actions);
  private projectService = inject(ProjectService);

  // load projects
  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetActions.loadProjects),
      switchMap(() =>
        this.projectService.getMyProjects().pipe(
          map((projects) =>
            TimesheetActions.loadProjectsSuccess({ projects }),
          ),
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
}

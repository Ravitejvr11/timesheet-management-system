import { inject, Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { ProjectService } from '../../core/services/project.service';
import { ProjectActions } from './project.actions';

@Injectable()
export class ProjectEffects {
  private actions$ = inject(Actions);
  private projectService = inject(ProjectService);

  loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.loadProjects),
      switchMap(() =>
        this.projectService.getAll().pipe(
          map((projects) => ProjectActions.loadProjectsSuccess({ projects })),
          catchError((error) =>
            of(
              ProjectActions.loadProjectsFailure({
                error: error?.message ?? 'Failed to load projects',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  createProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.createProject),
      mergeMap(({ request }) =>
        this.projectService.create(request).pipe(
          map(() => ProjectActions.loadProjects()),
          catchError((error) =>
            of(
              ProjectActions.loadProjectsFailure({
                error: error?.message ?? 'Failed to create project',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  updateProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.updateProject),
      mergeMap(({ request }) =>
        this.projectService.update(request).pipe(
          map(() => ProjectActions.loadProjects()),
          catchError((error) =>
            of(
              ProjectActions.loadProjectsFailure({
                error: error?.message ?? 'Failed to update project',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  activateProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.activateProject),
      mergeMap(({ id }) =>
        this.projectService.activate(id).pipe(
          map(() => ProjectActions.loadProjects()),
          catchError((error) =>
            of(
              ProjectActions.loadProjectsFailure({
                error: error?.message ?? 'Failed to activate project',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  deactivateProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.deactivateProject),
      mergeMap(({ id }) =>
        this.projectService.deactivate(id).pipe(
          map(() => ProjectActions.loadProjects()),
          catchError((error) =>
            of(
              ProjectActions.loadProjectsFailure({
                error: error?.message ?? 'Failed to deactivate project',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadEmployees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.loadEmployees),
      switchMap(() =>
        this.projectService.getEmployees().pipe(
          map((employees) =>
            ProjectActions.loadEmployeesSuccess({ employees }),
          ),
          catchError((error) =>
            of(
              ProjectActions.loadEmployeesFailure({
                error: error?.message ?? 'Failed to load employees',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadAssignedEmployees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.loadAssignedEmployees),
      switchMap(({ projectId }) =>
        this.projectService.getAssignedEmployees(projectId).pipe(
          map((employeeIds) =>
            ProjectActions.loadAssignedEmployeesSuccess({ employeeIds }),
          ),
          catchError((error) =>
            of(
              ProjectActions.loadAssignedEmployeesFailure({
                error: error?.message ?? 'Failed to load assigned employees',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}

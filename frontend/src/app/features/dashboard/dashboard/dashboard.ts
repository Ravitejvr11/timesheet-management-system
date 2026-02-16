import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import type { OnInit } from '@angular/core';
import type { Project } from '@core/models/project/project.model';
import type { TimesheetRow } from '@core/models/timesheet/timesheet-row.model';
import { AuthStore } from '@core/state/auth.store';
import { buildTimesheetDataSource } from 'src/app/shared/builders/timesheet-datasource.builder';
import { TimesheetStats } from 'src/app/shared/components/timesheet-stats/timesheet-stats';
import { TimesheetTable } from 'src/app/shared/components/timesheet-table/timesheet-table';
import { Store } from '@ngrx/store';
import { timesheetFeature } from 'src/app/store/timesheet/timesheet.reducer';
import { TimesheetActions } from 'src/app/store/timesheet/timesheet.action';
import { Dialog } from 'src/app/shared/components/dialog/dialog';
import { AddTimesheetForm } from 'src/app/shared/components/add-timesheet-form/add-timesheet-form';
import type { AddTimesheetPayload } from '@core/models/timesheet/timesheet-add.model';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    TimesheetTable,
    TimesheetStats,
    Dialog,
    AddTimesheetForm,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private store = inject(Store);
  private authStore = inject(AuthStore);
  private elementRef = inject(ElementRef);
  private actions$ = inject(Actions);
  loading = this.store.selectSignal(timesheetFeature.selectLoading);
  private router = inject(Router);

  isAddDialogOpen = signal(false);

  projects = this.store.selectSignal(timesheetFeature.selectProjects);
  timesheets = this.store.selectSignal(timesheetFeature.selectTimesheets);

  selectedProjectId = this.store.selectSignal(
    timesheetFeature.selectSelectedProjectId,
  );
  isDropdownOpen = signal(false);

  user = computed(() => this.authStore.user());
  isEmployee = computed(() => this.user()?.role === 'Employee');
  selectedProjectName = computed(() => {
    const id = this.selectedProjectId();
    return this.projects().find((p) => p.id === id)?.name;
  });

  // For data table
  dataSource = computed<TimesheetRow[]>(() => {
    const timesheets = this.timesheets();
    const projects = this.projects();

    if (!timesheets.length || !projects.length) {
      return [];
    }

    return buildTimesheetDataSource(timesheets, projects);
  });

  constructor() {
    effect(() => {
      const handleClick = (event: MouseEvent): void => {
        if (
          this.isDropdownOpen() &&
          !this.elementRef.nativeElement.contains(event.target)
        ) {
          this.isDropdownOpen.set(false);
        }
      };

      document.addEventListener('click', handleClick);

      return (): void => document.removeEventListener('click', handleClick);
    });

    this.actions$
      .pipe(
        ofType(TimesheetActions.createTimesheetSuccess),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.closeAddDialog();

        const selectedProjectId = this.selectedProjectId();
        if (selectedProjectId) {
          this.store.dispatch(
            TimesheetActions.loadTimesheets({
              projectId: selectedProjectId,
            }),
          );
        }
      });
  }

  ngOnInit(): void {
    this.store.dispatch(TimesheetActions.loadProjects());
  }

  onProjectChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);

    this.store.dispatch(
      TimesheetActions.selectProject({
        projectId: value,
      }),
    );
  }

  getTotalBillableHours(): number {
    const total = this.timesheets().reduce(
      (sum, t) => sum + t.totalBillableHours,
      0,
    );

    return Math.round(total * 100) / 100;
  }

  getTotalNonBillableHours(): number {
    const total = this.timesheets().reduce(
      (sum, t) => sum + t.totalNonBillableHours,
      0,
    );
    return Math.round(total * 100) / 100;
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update((v) => !v);
  }

  selectProject(project: Project): void {
    this.store.dispatch(
      TimesheetActions.selectProject({
        projectId: project.id,
      }),
    );
    this.isDropdownOpen.set(false);
  }

  openAddDialog(): void {
    this.isAddDialogOpen.set(true);
  }

  closeAddDialog(): void {
    this.isAddDialogOpen.set(false);
  }

  handleAddTimesheet(payload: AddTimesheetPayload): void {
    this.store.dispatch(
      TimesheetActions.createTimesheet({
        projectId: payload.projectId,
        weekStartDate: payload.weekFrom,
        weekEndDate: payload.weekTo,
      }),
    );
  }
}

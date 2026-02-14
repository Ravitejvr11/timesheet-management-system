import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import type { Project } from '@core/models/project/project.model';
import type { TimesheetRow } from '@core/models/timesheet/timesheet-row.model';
import type { TimesheetViewModel } from '@core/models/timesheet/timesheetViewModel';
import { ProjectService } from '@core/services/project.service';
import { AuthStore } from '@core/state/auth.store';
import { buildTimesheetDataSource } from 'src/app/shared/builders/timesheet-datasource.builder';
import { TimesheetStats } from 'src/app/shared/components/timesheet-stats/timesheet-stats';
import { TimesheetTable } from 'src/app/shared/components/timesheet-table/timesheet-table';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TimesheetTable, TimesheetStats],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private projectService = inject(ProjectService);
  private authStore = inject(AuthStore);
  private elementRef = inject(ElementRef);

  projects = signal<Project[]>([]);
  selectedProjectId = signal<number | null>(null);
  isDropdownOpen = signal(false);

  user = computed(() => this.authStore.user());
  isEmployee = computed(() => this.user()?.role === 'Employee');
  selectedProjectName = computed(() => {
    const id = this.selectedProjectId();
    return this.projects().find((p) => p.id === id)?.name;
  });

  timesheets = signal<TimesheetViewModel[]>([
    {
      id: 1,
      projectId: 1,
      weekStartDate: '2024-02-02',
      weekEndDate: '2024-02-08',
      totalBillableHours: 40,
      totalNonBillableHours: 2,
      status: 1,
      submittedAt: '2024-02-09',
      approvedAt: null,
    },
  ]);

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
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.projectService.getMyProjects().subscribe({
      next: (data) => {

        this.projects.set(data);
        if (data.length > 0) {
          this.selectedProjectId.set(data[0].id);
        }
      },
    });
  }

  onProjectChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.selectedProjectId.set(value);
  }

  getTotalBillableHours(): number {
    return this.timesheets().reduce((sum, t) => sum + t.totalBillableHours, 0);
  }

  getTotalNonBillableHours(): number {
    return this.timesheets().reduce(
      (sum, t) => sum + t.totalNonBillableHours,
      0,
    );
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update((v) => !v);
  }

  selectProject(project: Project): void {
    this.selectedProjectId.set(project.id);
    this.isDropdownOpen.set(false);
  }
}

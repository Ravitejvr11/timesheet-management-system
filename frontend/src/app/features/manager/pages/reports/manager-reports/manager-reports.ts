import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MultiSelect } from 'src/app/shared/components/multi-select/multi-select';
import type {
  ProjectHoursSummary,
  TimeReportFilter,
} from '@core/models/reports/project-hours-summay.model';
import { TimesheetActions } from 'src/app/store/timesheet/timesheet.action';
import { timesheetFeature } from 'src/app/store/timesheet/timesheet.reducer';
import type { Employee } from '@core/models/project/employee.model';
import type { Project } from '@core/models/project/project.model';
import { projectFeature } from 'src/app/store/project/project.reducer';
import { ProjectActions } from 'src/app/store/project/project.actions';
import { Spinner } from 'src/app/shared/components/spinner/spinner';

@Component({
  standalone: true,
  selector: 'app-manager-reports',
  imports: [CommonModule, MultiSelect, Spinner],
  templateUrl: './manager-reports.html',
  styleUrl: './manager-reports.scss',
})
export class ManagerReports {
  private store = inject(Store);

  constructor() {
    const range = this.getCurrentMonthRange();

    this.fromDate.set(range.from);
    this.toDate.set(range.to);
    this.store.dispatch(ProjectActions.loadProjects());
    this.store.dispatch(ProjectActions.loadEmployees());
    this.loadReport();
  }

  summary = toSignal(this.store.select(timesheetFeature.selectReportSummary), {
    initialValue: null as ProjectHoursSummary | null,
  });

  loading = toSignal(this.store.select(timesheetFeature.selectReportLoading), {
    initialValue: false,
  });

  // Filters
  fromDate = signal<string>('');
  toDate = signal<string>('');
  selectedEmployeeIds = signal<string[]>([]);
  selectedProjectIds = signal<string[]>([]);
  employees = toSignal(this.store.select(projectFeature.selectEmployees), {
    initialValue: [] as Employee[],
  });

  projects = toSignal(this.store.select(projectFeature.selectProjects), {
    initialValue: [] as Project[],
  });

  employeeOptions = computed(() =>
    this.employees().map((e) => ({
      id: e.id,
      name: e.name,
    })),
  );

  projectOptions = computed(() =>
    this.projects().map((p) => ({
      id: p.id.toString(),
      name: p.name,
    })),
  );

  loadReport(): void {
    if (!this.fromDate() || !this.toDate()) return;

    const filter: TimeReportFilter = {
      fromDate: this.fromDate(),
      toDate: this.toDate(),
      employeeIds: this.selectedEmployeeIds(),
      projectIds: this.selectedProjectIds().map((id) => Number(id)),
    };

    this.store.dispatch(TimesheetActions.loadReportSummary({ filter }));
  }

  totalHours = computed(() => this.summary()?.totalHours ?? 0);
  totalBillable = computed(() => this.summary()?.totalBillableHours ?? 0);
  totalNonBillable = computed(() => this.summary()?.totalNonBillableHours ?? 0);

  expandedProjectId = signal<number | null>(null);

  toggleProject(id: number): void {
    this.expandedProjectId.update((curr) => (curr === id ? null : id));
  }

  private getCurrentMonthRange(): {
    from: string;
    to: string;
  } {
    const now = new Date();

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date();

    const format = (d: Date) => d.toISOString().split('T')[0];

    return {
      from: format(firstDay),
      to: format(today),
    };
  }
}

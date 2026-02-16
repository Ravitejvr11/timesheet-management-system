import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import type { ManagerTimesheet } from '@core/models/timesheet/manager-timesheet.model';
import { TimesheetStatus } from '@core/models/timesheet/timesheet-status.util';
import type { TableColumn } from 'src/app/shared/components/app-table/app-table.component';
import { AppTable } from 'src/app/shared/components/app-table/app-table.component';
import { AppDialog } from 'src/app/shared/components/app-dialog/app-dialog';
import { TimesheetActions } from 'src/app/store/timesheet/timesheet.action';
import { timesheetFeature } from 'src/app/store/timesheet/timesheet.reducer';
import { Spinner } from 'src/app/shared/components/spinner/spinner';

@Component({
  standalone: true,
  selector: 'app-manager-timesheets',
  imports: [CommonModule, AppTable, AppDialog, Spinner],
  templateUrl: './manager-timesheets.html',
  styleUrl: './manager-timesheets.scss',
})
export class ManagerTimesheets {
  private store = inject(Store);
  approveDialogOpen = signal(false);
  selectedTimesheetForApproval = signal<ManagerTimesheet | null>(null);
  viewDialogOpen = signal(false);
  selectedTimesheetForView = signal<ManagerTimesheet | null>(null);

  constructor() {
    this.store.dispatch(TimesheetActions.loadManagerTimesheets());
  }

  timesheets = toSignal(
    this.store.select(timesheetFeature.selectManagerTimesheets),
    { initialValue: [] as ManagerTimesheet[] },
  );

  loading = toSignal(this.store.select(timesheetFeature.selectManagerLoading), {
    initialValue: false,
  });

  approvalLoading = toSignal(
    this.store.select(timesheetFeature.selectApprovalLoading),
    { initialValue: false },
  );

  rejectDialogOpen = signal(false);
  rejectComments = signal('');
  selectedTimesheetId = signal<number | null>(null);

  openRejectDialog(id: number): void {
    this.selectedTimesheetId.set(id);
    this.rejectComments.set('');
    this.rejectDialogOpen.set(true);
  }

  closeRejectDialog(): void {
    this.rejectDialogOpen.set(false);
  }

  approve(id: number): void {
    this.store.dispatch(TimesheetActions.approveTimesheet({ id }));
  }

  reject(): void {
    const id = this.selectedTimesheetId();
    const comments = this.rejectComments().trim();

    if (!id || !comments) return;

    this.store.dispatch(
      TimesheetActions.rejectTimesheet({
        id,
        comments,
      }),
    );

    this.closeRejectDialog();
  }

  getStatusLabel(status: TimesheetStatus): string {
    return TimesheetStatus[status];
  }

  columns = signal<TableColumn<ManagerTimesheet>[]>([
    { header: 'Employee', field: 'employeeName' },
    { header: 'Week Start', field: 'weekStartDate' },
    { header: 'Week End', field: 'weekEndDate' },
    { header: 'Billable', field: 'totalBillableHours' },
    { header: 'Non-Billable', field: 'totalNonBillableHours' },
  ]);

  openApproveDialog(t: ManagerTimesheet): void {
    this.selectedTimesheetForApproval.set(t);
    this.approveDialogOpen.set(true);
  }

  closeApproveDialog(): void {
    this.selectedTimesheetForApproval.set(null);
    this.approveDialogOpen.set(false);
  }

  confirmApprove(): void {
    const ts = this.selectedTimesheetForApproval();
    if (!ts) return;

    this.store.dispatch(TimesheetActions.approveTimesheet({ id: ts.id }));

    this.closeApproveDialog();
  }

  openViewDialog(t: ManagerTimesheet): void {
    this.selectedTimesheetForView.set(t);
    this.viewDialogOpen.set(true);
  }

  closeViewDialog(): void {
    this.selectedTimesheetForView.set(null);
    this.viewDialogOpen.set(false);
  }
}

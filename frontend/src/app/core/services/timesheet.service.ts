import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import type { Observable } from 'rxjs';
import type { AddTimesheetPayload } from '@core/models/timesheet/timesheet-add.model';
import type { TimesheetViewModel } from '@core/models/timesheet/timesheetViewModel';
import type { UpdateTimesheetRequest } from 'src/app/store/timesheet/timesheet.state';
import type { ManagerTimesheet } from '@core/models/timesheet/manager-timesheet.model';
import type {
  TimeReportFilter,
  ProjectHoursSummary,
} from '@core/models/reports/project-hours-summay.model';

@Injectable({
  providedIn: 'root',
})
export class TimesheetService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/timesheets`;

  createTimesheet(payload: {
    projectId: number;
    weekStartDate: string;
    weekEndDate: string;
  }): Observable<AddTimesheetPayload> {
    return this.http.post<AddTimesheetPayload>(this.baseUrl, payload);
  }

  getTimesheets(projectId: number): Observable<TimesheetViewModel[]> {
    return this.http.get<TimesheetViewModel[]>(
      `${this.baseUrl}/my?projectId=${projectId}`,
    );
  }

  updateTimesheet(
    id: number,
    payload: UpdateTimesheetRequest,
  ): Observable<UpdateTimesheetRequest> {
    return this.http.put<UpdateTimesheetRequest>(
      `${this.baseUrl}/${id}`,
      payload,
    );
  }

  submitTimesheet(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/submit`, {});
  }

  getForManager(): Observable<ManagerTimesheet[]> {
    return this.http.get<ManagerTimesheet[]>(this.baseUrl);
  }

  approveTimesheet(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/approve`, {});
  }

  rejectTimesheet(id: number, comments: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/${id}/reject`,
      JSON.stringify(comments),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  getReportSummary(filter: TimeReportFilter): Observable<ProjectHoursSummary> {
    return this.http.post<ProjectHoursSummary>(
      `${this.baseUrl.replace('timesheets', 'report')}/analytics`,
      filter,
    );
  }
}

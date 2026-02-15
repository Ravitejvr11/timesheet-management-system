import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import type { Observable } from 'rxjs';
import type { AddTimesheetPayload } from '@core/models/timesheet/timesheet-add.model';
import type { TimesheetViewModel } from '@core/models/timesheet/timesheetViewModel';

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
    return this.http.get<TimesheetViewModel[]>(`${this.baseUrl}/my?projectId=${projectId}`);
  }
}

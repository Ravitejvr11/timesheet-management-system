import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import type { Project } from '@core/models/project/project.model';
import type { Observable } from 'rxjs';
import type { CreateProjectRequest, UpdateProjectRequest } from '@core/models/project/create-project.model';
import type { Employee } from '@core/models/project/employee.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/projects`;

  // employee api
  getMyProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/my`);
  }

  // manager api
  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  create(request: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, request);
  }

  update(id: number, request: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/${id}`, request);
  }

  activate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees`);
  }

  getAssignedEmployees(projectId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/${projectId}/employees`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import type { Project } from '@core/models/project/project.model';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/projects`;

  getMyProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/my`);
  }
}

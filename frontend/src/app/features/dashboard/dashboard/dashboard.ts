import { Component, inject } from '@angular/core';
import type { OnInit } from '@angular/core';
import { ProjectService } from '@core/services/project.service';
import { AuthStore } from '@core/state/auth.store';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})

export class Dashboard implements OnInit {
  private projectService = inject(ProjectService);
  private authStore = inject(AuthStore);

  ngOnInit(): void {
        this.projectService.getMyProjects().subscribe({
      next: (data) => {
        console.log(data);
        console.log(this.authStore.user());

      }
    });
  }

}

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-manager',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.scss',
})
export class ManagerComponent {}

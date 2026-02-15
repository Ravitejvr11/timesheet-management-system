import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { timesheetFeature } from './app/store/timesheet/timesheet.reducer';
import { TimesheetEffects } from './app/store/timesheet/timesheet.effects';
import { projectFeature } from './app/store/project/project.reducer';
import { ProjectEffects } from './app/store/project/project.effects';



bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({
      [timesheetFeature.name]: timesheetFeature.reducer,
      [projectFeature.name]: projectFeature.reducer,
    }),
    provideEffects([TimesheetEffects, ProjectEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
    }),
  ],
}).catch((err) => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient() // чтобы сервисы могли использовать HttpClient,
    ,provideRouter(routes)
  ]
}).catch(err => console.error(err));

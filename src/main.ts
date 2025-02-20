// src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, inject } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
// Если нужен Interceptor для JWT:
import { AuthInterceptor } from './app/interceptors/auth.interceptor'; // (если есть)
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpLoaderFactory } from './app/app.config';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
        // Подключаем сам TranslateModule и указываем, как грузить переводы
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),
    provideRouter(routes),
    // Если нужно автомат. прикрепление токена:
     {
       provide: HTTP_INTERCEPTORS,
       useClass: AuthInterceptor,
       multi: true
     }
  ]
})
.catch(err => console.error(err));


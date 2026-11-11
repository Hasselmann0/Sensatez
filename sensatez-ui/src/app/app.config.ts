import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideInfrastructureAdapters } from './infrastructure/di/infrastructure.providers';
import { jwtInterceptor } from './infrastructure/http/jwt.interceptor';
import { problemDetailsInterceptor } from './infrastructure/http/problem-details.interceptor';

registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([jwtInterceptor, problemDetailsInterceptor])),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideInfrastructureAdapters()
  ]
};

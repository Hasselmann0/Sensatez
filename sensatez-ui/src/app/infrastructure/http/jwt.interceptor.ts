import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionStoragePort } from '../../domain/ports/session-storage.port';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionStorage = inject(SessionStoragePort);
  const token = sessionStorage.getToken();

  const isApiUrl = req.url.startsWith(environment.apiUrl);
  const isLoginUrl = req.url.endsWith('/auth/login');

  if (token && isApiUrl && !isLoginUrl) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};

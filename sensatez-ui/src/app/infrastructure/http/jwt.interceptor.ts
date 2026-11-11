import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionStoragePort } from '../../domain/ports/session-storage.port';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionStorage = inject(SessionStoragePort);
  const token = sessionStorage.getToken();

  if (token && !req.url.endsWith('/auth/login')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};

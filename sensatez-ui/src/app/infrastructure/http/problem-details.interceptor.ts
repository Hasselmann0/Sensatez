import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ProblemDetails } from '../../domain/models/problem-details.model';
import { NotificationPort, SessionStoragePort } from '../../domain/ports/ports.tokens';

export const problemDetailsInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationPort);
  const router = inject(Router);
  const sessionStorage = inject(SessionStoragePort);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const problem = err.error as ProblemDetails | undefined;

      if (err.status === 401) {
        sessionStorage.clear();
        notification.error(
          problem?.detail || 'E-mail ou senha inválidos, ou sessão expirada.',
          'Não autorizado'
        );
        if (!router.url.startsWith('/login')) {
          router.navigate(['/login']);
        }
      } else if (err.status === 400 && problem?.errors?.length) {
        const details = problem.errors.map(e => `${e.mensagem}`).join(' • ');
        notification.warning(details, problem.title || 'Dados inválidos');
      } else if (err.status === 404 || err.status === 409) {
        notification.error(
          problem?.detail || 'Violação de regra de negócio ou recurso não encontrado.',
          problem?.title || 'Operação bloqueada'
        );
      } else if (err.status === 0) {
        notification.error(
          'Não foi possível conectar à API em http://localhost:5114. Verifique se o backend .NET 10 está rodando.',
          'Servidor offline'
        );
      } else {
        notification.error(problem?.detail || 'Ocorreu um erro inesperado ao processar a solicitação.');
      }

      return throwError(() => err);
    })
  );
};

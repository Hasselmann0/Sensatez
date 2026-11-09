import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ProblemDetails } from '../../domain/models/problem-details.model';
import { ToastService } from '../../presentation/shared/services/toast.service';
import { TokenStorageService } from '../storage/token-storage.service';

export const problemDetailsInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const problem = err.error as ProblemDetails | undefined;

      if (err.status === 401) {
        tokenStorage.clear();
        toast.error(problem?.detail || 'E-mail ou senha inválidos, ou sessão expirada.', 'Não autorizado');
        if (!router.url.startsWith('/login')) {
          router.navigate(['/login']);
        }
      } else if (err.status === 400 && problem?.errors?.length) {
        const details = problem.errors.map(e => `${e.mensagem}`).join(' • ');
        toast.warning(details, problem.title || 'Dados inválidos');
      } else if (err.status === 404 || err.status === 409) {
        toast.error(
          problem?.detail || 'Violação de regra de negócio ou recurso não encontrado.',
          problem?.title || 'Operação bloqueada'
        );
      } else if (err.status === 0) {
        toast.error(
          'Não foi possível conectar à API em http://localhost:5114. Verifique se o backend .NET 10 está rodando.',
          'Servidor offline'
        );
      } else {
        toast.error(problem?.detail || 'Ocorreu um erro inesperado ao processar a solicitação.');
      }

      return throwError(() => err);
    })
  );
};


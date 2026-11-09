import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommandBus } from '../../../application/cqrs/cqrs-bus';
import { AuthStore, LoginCommand } from '../../../application/use-cases/auth/auth.cqrs';
import { ThemeService } from '../../../infrastructure/storage/theme.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly commandBus = inject(CommandBus);
  private readonly router = inject(Router);
  readonly authStore = inject(AuthStore);
  readonly themeService = inject(ThemeService);

  readonly showPassword = signal<boolean>(false);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['admin@sensatez.com.br', [Validators.required, Validators.email]],
    password: ['Admin@2026!', [Validators.required]]
  });

  fillAdminCredentials(): void {
    this.loginForm.patchValue({
      email: 'admin@sensatez.com.br',
      password: 'Admin@2026!'
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.commandBus.dispatch(new LoginCommand({ email, password })).subscribe({
      next: () => {
        this.router.navigate(['/painel']);
      }
    });
  }
}

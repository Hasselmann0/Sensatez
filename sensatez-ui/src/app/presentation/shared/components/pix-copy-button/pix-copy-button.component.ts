import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-pix-copy-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pix-copy-button.component.html',
  styleUrl: './pix-copy-button.component.css'
})
export class PixCopyButtonComponent {
  readonly pixKey = input<string | null | undefined>(null);
  readonly copied = signal<boolean>(false);
  private readonly toast = inject(ToastService);

  copy(event: Event): void {
    event.stopPropagation();
    const key = this.pixKey();
    if (!key) return;
    navigator.clipboard?.writeText(key);
    this.copied.set(true);
    this.toast.info(`Chave Pix "${key}" copiada para a área de transferência!`);
    setTimeout(() => this.copied.set(false), 2000);
  }
}


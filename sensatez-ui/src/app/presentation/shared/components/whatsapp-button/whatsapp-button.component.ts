import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './whatsapp-button.component.html',
  styleUrl: './whatsapp-button.component.css'
})
export class WhatsappButtonComponent {
  readonly phone = input<string | null | undefined>(null);
  readonly label = input<string>('WhatsApp');
  readonly message = input<string>('');

  openWhatsApp(event: Event): void {
    event.stopPropagation();
    const digits = (this.phone() ?? '').replace(/\D/g, '');
    if (!digits) return;
    const fullPhone = digits.startsWith('55') ? digits : `55${digits}`;
    const text = this.message() ? `?text=${encodeURIComponent(this.message())}` : '';
    window.open(`https://wa.me/${fullPhone}${text}`, '_blank', 'noopener');
  }
}


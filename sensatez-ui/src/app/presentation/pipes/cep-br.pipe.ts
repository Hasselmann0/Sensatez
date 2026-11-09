import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cepBr', standalone: true })
export class CepBrPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '-';
    const digits = value.replace(/\D/g, '');
    if (digits.length === 8) {
      return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value;
  }
}


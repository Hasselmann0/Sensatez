import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class DocumentValidator {
  static clean(value: string | null | undefined): string {
    return (value ?? '').replace(/\D/g, '');
  }

  static formatCpfOrCnpj(value: string | null | undefined): string {
    const d = this.clean(value).slice(0, 14);
    if (d.length <= 11) {
      if (d.length <= 3) return d;
      if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
      if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
      return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
    }
    if (d.length <= 12) {
      return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
    }
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
  }

  static formatPhoneBr(value: string | null | undefined): string {
    const d = this.clean(value).slice(0, 11);
    if (d.length === 0) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
  }

  static formatCepBr(value: string | null | undefined): string {
    const d = this.clean(value).slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
  }

  static isValidCpf(cpf: string): boolean {
    const digits = this.clean(cpf);
    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits.charAt(i), 10) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(digits.charAt(9), 10)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits.charAt(i), 10) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    return remainder === parseInt(digits.charAt(10), 10);
  }

  static isValidCnpj(cnpj: string): boolean {
    const digits = this.clean(cnpj);
    if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) {
      return false;
    }

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits.charAt(i), 10) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(digits.charAt(12), 10)) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(digits.charAt(i), 10) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    return digit2 === parseInt(digits.charAt(13), 10);
  }

  static isValidCpfOrCnpj(value: string): boolean {
    const digits = this.clean(value);
    if (digits.length === 11) return this.isValidCpf(digits);
    if (digits.length === 14) return this.isValidCnpj(digits);
    return false;
  }

  static cpfOrCnpjValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const raw = control.value;
      if (!raw) return null;
      return DocumentValidator.isValidCpfOrCnpj(raw)
        ? null
        : { invalidDocument: 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.' };
    };
  }
}


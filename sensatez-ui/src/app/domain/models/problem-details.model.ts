export interface FieldValidationError {
  campo: string;
  mensagem: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: FieldValidationError[];
}


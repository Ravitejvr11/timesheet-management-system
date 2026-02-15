import type {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
} from '@angular/forms';

/**
 * Validates HH:mm format (00:00 - 23:59)
 */
export const hhmmValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = control.value as string;

  if (!value) return null;

  if (!/^\d{2}:\d{2}$/.test(value)) {
    return { invalidFormat: true };
  }

  const [h, m] = value.split(':').map(Number);

  if (h > 23 || m > 59) {
    return { invalidFormat: true };
  }

  return null;
};

/**
 * Validates total time does not exceed 24 hours (1440 minutes)
 */
export const max24Validator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const group = control as FormGroup;

  const billable = group.get('billableTime')?.value ?? '00:00';
  const nonBillable = group.get('nonBillableTime')?.value ?? '00:00';

  const total =
    toMinutes(billable) + toMinutes(nonBillable);

  return total > 1440 ? { maxExceeded: true } : null;
};

/**
 * Helper function
 */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

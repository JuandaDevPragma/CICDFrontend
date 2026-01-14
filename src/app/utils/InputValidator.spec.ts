import { FormControl, FormGroupDirective } from '@angular/forms';
import { InputErrorStateMatcher } from './InputValidator';

describe('InputErrorStateMatcher', () => {
  let matcher: InputErrorStateMatcher;

  beforeEach(() => {
    matcher = new InputErrorStateMatcher();
  });

  it('should return true if control is invalid and dirty', () => {
    const control = new FormControl('', { validators: () => ({ invalid: true }) });
    control.markAsDirty();
    expect(matcher.isErrorState(control, null)).toBeTrue();
  });

  it('should return true if control is invalid and touched', () => {
    const control = new FormControl('', { validators: () => ({ invalid: true }) });
    control.markAsTouched();
    expect(matcher.isErrorState(control, null)).toBeTrue();
  });

  it('should return true if control is invalid and form is submitted', () => {
    const control = new FormControl('', { validators: () => ({ invalid: true }) });
    const form = { submitted: true } as FormGroupDirective;
    expect(matcher.isErrorState(control, form)).toBeTrue();
  });

  it('should return false if control is valid', () => {
    const control = new FormControl('valid');
    expect(matcher.isErrorState(control, null)).toBeFalse();
  });

  it('should return false if control is null', () => {
    expect(matcher.isErrorState(null, null)).toBeFalse();
  });
});

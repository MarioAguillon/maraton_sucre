import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  CATEGORY_OPTIONS,
  CategoryCode,
  REGISTRATION_FEE_LABEL,
  ageOnEventDay,
  findCategory,
} from '../../config/event.config';
import {
  RegistrationData,
  RegistrationService,
  ValidationErrorResponse,
} from '../../services/registration';
import { RegistrationState } from '../../services/registration-state';

type FieldName = keyof Registration['form']['controls'];
type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const NAME_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const CITY_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-.]+$/;
const MIN_AGE_ANY_CATEGORY = Math.min(...CATEGORY_OPTIONS.map((c) => c.minAge));
const MAX_AGE = 100;

/** Fecha válida, no futura y con la edad mínima de alguna categoría. */
const birthDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const age = ageOnEventDay(control.value);
  if (control.value && age === null) return { invalidDate: true };
  if (age === null) return null;
  if (age > MAX_AGE || age < 0) return { invalidDate: true };
  if (age < MIN_AGE_ANY_CATEGORY) return { minAge: { required: MIN_AGE_ANY_CATEGORY, actual: age } };
  return null;
};

/** Validador de grupo: la edad debe cumplir el mínimo de la categoría elegida. */
const categoryAgeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const age = ageOnEventDay(group.get('fecha_nacimiento')?.value);
  const category = findCategory(group.get('categoria')?.value);
  if (age === null || !category) return null;
  return age < category.minAge
    ? { categoryAge: { required: category.minAge, actual: age, label: category.label } }
    : null;
};

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-registration',
  styleUrl: './registration.scss',
  templateUrl: './registration.html',
})
export class Registration {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(RegistrationService);
  private readonly state = inject(RegistrationState);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly genderOptions = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
  ] as const;
  readonly categoryOptions = CATEGORY_OPTIONS;
  readonly feeLabel = REGISTRATION_FEE_LABEL;

  readonly form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(NAME_PATTERN)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(NAME_PATTERN)]],
      fecha_nacimiento: ['', [Validators.required, birthDateValidator]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      celular: ['', [Validators.required, Validators.pattern(/^3\d{9}$/)]],
      ciudad_municipio: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(CITY_PATTERN)]],
      genero: ['', Validators.required],
      categoria: ['' as CategoryCode | '', Validators.required],
      /** Honeypot: campo trampa para bots (oculto con CSS). */
      website: [''],
      terminos: [false, Validators.requiredTrue],
    },
    { validators: categoryAgeValidator },
  );

  // ─── Estado reactivo (signals: compatible con zoneless) ─────────────
  readonly status = signal<SubmitStatus>('idle');
  readonly submitError = signal('');
  readonly registrationCode = signal('');
  readonly isSubmitting = computed(() => this.status() === 'submitting');

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
  readonly calculatedAge = computed(() => ageOnEventDay(this.formValue().fecha_nacimiento));
  readonly selectedCategory = computed(() => findCategory(this.formValue().categoria));
  readonly isFreeRace = computed(() => this.selectedCategory()?.free ?? false);

  constructor() {
    // Preselección desde las tarjetas de distancias / circuitos.
    effect(() => {
      const code = this.state.preselectedCategory();
      if (!code) return;
      const control = this.form.controls.categoria;
      control.setValue(code);
      control.markAsDirty();
      this.state.preselectedCategory.set(null);
    });
  }

  hasError(field: FieldName): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  /** Error cruzado edad ↔ categoría (se muestra bajo "Categoría"). */
  get categoryAgeError(): string {
    const err = this.form.errors?.['categoryAge'];
    const touched = this.form.controls.categoria.dirty || this.form.controls.categoria.touched;
    if (!err || !touched) return '';
    return `${err.label} exige ${err.required} años o más al día del evento (tendrás ${err.actual}).`;
  }

  getErrorMessage(field: FieldName): string {
    const errors = this.form.controls[field].errors;
    if (!errors) return '';
    if (errors['server']) return errors['server'];
    if (errors['required']) return field === 'terminos' ? 'Debes aceptar los términos y condiciones' : 'Este campo es obligatorio';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['email']) return 'Correo electrónico inválido';
    if (errors['invalidDate']) return 'Fecha de nacimiento inválida';
    if (errors['minAge']) return `Debes tener al menos ${errors['minAge'].required} años al día del evento`;
    if (errors['pattern']) {
      if (field === 'celular') return 'Número colombiano inválido (10 dígitos, inicia con 3)';
      if (field === 'ciudad_municipio') return 'Solo letras, espacios, guiones y puntos';
      return 'Formato inválido: solo se permiten letras';
    }
    return 'Campo inválido';
  }

  onSubmit(): void {
    if (this.isSubmitting()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.controls.categoria.markAsDirty();
      this.focusFirstInvalid();
      return;
    }

    this.status.set('submitting');
    this.submitError.set('');

    const payload: RegistrationData = this.form.getRawValue();

    this.api.register(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.registrationCode.set(response.data?.codigo ?? '');
          this.status.set('success');
          this.form.reset();
          this.focusAfterRender('.registration__success-title');
        } else {
          this.fail(response.message || 'No fue posible completar la inscripción.');
        }
      },
      error: (error: HttpErrorResponse) => this.fail(this.mapHttpError(error)),
    });
  }

  resetForm(): void {
    this.status.set('idle');
    this.submitError.set('');
    this.registrationCode.set('');
    this.form.reset();
    this.focusAfterRender('#nombre');
  }

  private fail(message: string): void {
    this.submitError.set(message);
    this.status.set('error');
  }

  private mapHttpError(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.';
      case 409:
        this.setServerError('correo', 'Este correo electrónico ya está registrado.');
        return 'Este correo electrónico ya está registrado.';
      case 422: {
        const body = error.error as ValidationErrorResponse | null;
        const errors = body?.errors ?? [];
        errors.forEach((e) => this.setServerError(e.campo, e.mensaje));
        this.focusFirstInvalid();
        return errors.map((e) => e.mensaje).join('. ') || 'Revisa los datos del formulario.';
      }
      case 429:
        return 'Demasiados intentos. Espera 15 minutos e intenta de nuevo.';
      default:
        return 'Error al procesar la inscripción. Intenta de nuevo.';
    }
  }

  private setServerError(field: string, message: string): void {
    const control = this.form.get(field);
    if (!control) return;
    control.setErrors({ ...(control.errors ?? {}), server: message });
    control.markAsTouched();
  }

  private focusFirstInvalid(): void {
    this.focusAfterRender('[formcontrolname].ng-invalid');
  }

  private focusAfterRender(selector: string): void {
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus(),
      { injector: this.injector },
    );
  }
}

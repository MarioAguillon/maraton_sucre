import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-registration',
  styleUrl: './registration.scss',
  templateUrl: './registration.html',
})
export class Registration {
  registrationForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  registrationCode = '';

  genderOptions = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
  ];

  categoryOptions = [
    { value: 'elite_18', label: 'Elite 18+', minAge: 18, race: 'cuarto' },
    { value: 'elite_45', label: 'Elite 45+', minAge: 45, race: 'cuarto' },
    { value: 'recreativa_18', label: 'Recreativa 18+', minAge: 18, race: 'cuarto' },
    { value: 'recreativa_45', label: 'Recreativa 45+', minAge: 45, race: 'cuarto' },
    { value: '6k_abierta', label: '6K La Peña - Sucre (Gratis)', minAge: 0, race: '6k' },
  ];

  private apiUrl = 'http://localhost:3000/api/inscripciones';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.registrationForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/),
      ]],
      apellidos: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/),
      ]],
      fecha_nacimiento: ['', [
        Validators.required,
        this.minAgeValidator(18),
      ]],
      correo: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(150),
      ]],
      celular: ['', [
        Validators.required,
        Validators.pattern(/^3\d{9}$/),
      ]],
      ciudad_municipio: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ]],
      genero: ['', Validators.required],
      categoria: ['', Validators.required],
      // Honeypot — campo trampa para bots (oculto con CSS)
      website: [''],
      // Aceptación de términos
      terminos: [false, Validators.requiredTrue],
    });
  }

  /**
   * Validador: edad mínima al día del evento (9 Enero 2027).
   */
  private minAgeValidator(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const birthDate = new Date(control.value);
      const eventDate = new Date('2027-01-09');
      let age = eventDate.getFullYear() - birthDate.getFullYear();
      const m = eventDate.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && eventDate.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= minAge ? null : { minAge: { required: minAge, actual: age } };
    };
  }

  /**
   * Calcula la edad al momento del evento para mostrar la categoría sugerida.
   */
  get calculatedAge(): number | null {
    const dob = this.registrationForm.get('fecha_nacimiento')?.value;
    if (!dob) return null;
    const birthDate = new Date(dob);
    const eventDate = new Date('2027-01-09');
    let age = eventDate.getFullYear() - birthDate.getFullYear();
    const m = eventDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && eventDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Retorna true si el campo tiene error y fue tocado.
   */
  hasError(field: string): boolean {
    const control = this.registrationForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Retorna el mensaje de error para un campo.
   */
  getErrorMessage(field: string): string {
    const control = this.registrationForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.errors['email']) return 'Correo electrónico inválido';
    if (control.errors['pattern']) {
      if (field === 'celular') return 'Número colombiano inválido (10 dígitos, inicia con 3)';
      return 'Formato inválido — solo se permiten letras';
    }
    if (control.errors['minAge']) return `Debes tener al menos ${control.errors['minAge'].required} años al día del evento`;
    return 'Campo inválido';
  }

  /**
   * Determina si la categoría seleccionada es la 6K (gratis).
   */
  get is6kRace(): boolean {
    return this.registrationForm.get('categoria')?.value === '6k_abierta';
  }

  /**
   * Envía el formulario al backend.
   */
  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

    const formData = { ...this.registrationForm.value };

    this.http.post<any>(this.apiUrl, formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.submitSuccess = true;
          this.registrationCode = response.data?.codigo || '';
          this.registrationForm.reset();
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error.status === 409) {
          this.submitError = 'Este correo electrónico ya está registrado.';
        } else if (error.status === 422) {
          const errors = error.error?.errors || [];
          this.submitError = errors.map((e: any) => e.mensaje).join('. ');
        } else if (error.status === 429) {
          this.submitError = 'Demasiados intentos. Espera 15 minutos.';
        } else {
          this.submitError = 'Error al procesar la inscripción. Intenta de nuevo.';
        }
      },
    });
  }

  /**
   * Resetea el estado del formulario para una nueva inscripción.
   */
  resetForm(): void {
    this.submitSuccess = false;
    this.submitError = '';
    this.registrationCode = '';
    this.registrationForm.reset();
  }
}

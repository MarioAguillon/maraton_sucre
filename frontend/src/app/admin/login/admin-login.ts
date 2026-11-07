import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuth } from '../admin-auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  private readonly auth = inject(AdminAuth);
  private readonly router = inject(Router);

  readonly form = inject(NonNullableFormBuilder).group({
    usuario: ['', Validators.required],
    contrasena: ['', Validators.required],
  });

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  private readonly userInput = viewChild<ElementRef<HTMLInputElement>>('userInput');

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Ingresa usuario y contraseña.');
      return;
    }

    const { usuario, contrasena } = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);

    this.auth.login(usuario.trim(), contrasena).subscribe({
      next: () => this.router.navigateByUrl('/admin'),
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.form.controls.contrasena.reset();
        this.error.set(
          err.status === 401 ? 'Usuario o contraseña incorrectos.'
          : err.status === 429 ? 'Demasiados intentos. Espera unos minutos.'
          : err.status === 0 ? 'No hay conexión con el servidor.'
          : 'No fue posible iniciar sesión. Intenta de nuevo.',
        );
        this.userInput()?.nativeElement.focus();
      },
    });
  }
}

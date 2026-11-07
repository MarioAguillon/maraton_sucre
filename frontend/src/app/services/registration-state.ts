import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CategoryCode } from '../config/event.config';

/**
 * Estado compartido entre tarjetas (distancias / circuitos) y el formulario.
 * Sustituye la manipulación directa del DOM (`getElementById` + `dispatchEvent`).
 */
@Injectable({ providedIn: 'root' })
export class RegistrationState {
  private readonly document = inject(DOCUMENT);

  /** Categoría preseleccionada desde fuera del formulario. */
  readonly preselectedCategory = signal<CategoryCode | null>(null);

  selectCategory(code: CategoryCode): void {
    this.preselectedCategory.set(code);
    this.document.getElementById('inscripcion')?.scrollIntoView({ behavior: 'smooth' });
  }
}

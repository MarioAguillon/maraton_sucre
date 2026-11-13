import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CATEGORY_OPTIONS, CategoryCode, findCategory } from '../../config/event.config';
import { AdminApi } from '../admin-api.service';
import { AdminAuth } from '../admin-auth.service';
import { Athlete, AthleteUpdate, Gender, RegistrationStatus } from '../admin.models';
import { exportAthletesToXlsx } from '../export-excel';

type SortKey = 'codigo_inscripcion' | 'nombre' | 'edad_al_evento' | 'created_at';
type LoadState = 'loading' | 'ready' | 'error';

const LETTERS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

/** Normaliza para búsqueda: minúsculas y sin tildes. */
const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

@Component({
  selector: 'app-admin-dashboard',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  private readonly api = inject(AdminApi);
  private readonly fb = inject(NonNullableFormBuilder);
  readonly auth = inject(AdminAuth);

  readonly categories = CATEGORY_OPTIONS;
  readonly statuses: { value: RegistrationStatus; label: string }[] = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  // ─── Estado ──────────────────────────────────────
  readonly athletes = signal<Athlete[]>([]);
  readonly loadState = signal<LoadState>('loading');
  readonly search = signal('');
  readonly categoryFilter = signal<CategoryCode | ''>('');
  readonly sortKey = signal<SortKey>('created_at');
  readonly sortDir = signal<'asc' | 'desc'>('desc');
  readonly exporting = signal(false);
  readonly notice = signal<string | null>(null);
  readonly testingEmail = signal(false);

  // ─── Métricas ────────────────────────────────────
  readonly totals = computed(() => {
    const list = this.athletes();
    const sixK = list.filter((a) => a.tipo_carrera === '6k_la_pena').length;
    return { total: list.length, tenK: list.length - sixK, sixK };
  });

  // ─── Tabla filtrada y ordenada ───────────────────
  readonly filtered = computed(() => {
    const term = normalize(this.search());
    const category = this.categoryFilter();
    const key = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;

    return this.athletes()
      .filter((a) => !category || a.categoria === category)
      .filter((a) => {
        if (!term) return true;
        const haystack = normalize(`${a.nombre} ${a.apellidos} ${a.cedula ?? ''} ${a.codigo_inscripcion}`);
        return haystack.includes(term);
      })
      .sort((a, b) => {
        const va = key === 'nombre' ? `${a.nombre} ${a.apellidos}` : a[key];
        const vb = key === 'nombre' ? `${b.nombre} ${b.apellidos}` : b[key];
        return (typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), 'es')) * dir;
      });
  });

  readonly hasFilters = computed(() => !!this.search() || !!this.categoryFilter());

  // ─── Modales ─────────────────────────────────────
  private readonly editDialog = viewChild.required<ElementRef<HTMLDialogElement>>('editDialog');
  private readonly deleteDialog = viewChild.required<ElementRef<HTMLDialogElement>>('deleteDialog');

  /** Atleta en edición; `null` con `formOpen` activo significa "agregar nuevo". */
  readonly editing = signal<Athlete | null>(null);
  readonly formOpen = signal(false);
  readonly sendEmail = signal(true);
  readonly deleting = signal<Athlete | null>(null);
  readonly saving = signal(false);
  readonly dialogError = signal<string | null>(null);

  readonly editForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(LETTERS)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(LETTERS)]],
    cedula: ['', [Validators.pattern(/^\d{5,12}$/)]],
    fecha_nacimiento: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    celular: ['', [Validators.required, Validators.pattern(/^3\d{9}$/)]],
    ciudad_municipio: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    genero: ['masculino' as Gender, Validators.required],
    categoria: ['elite_18' as CategoryCode, Validators.required],
    estado: ['pendiente' as RegistrationStatus, Validators.required],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loadState.set('loading');
    this.api.list().subscribe({
      next: (list) => {
        this.athletes.set(list);
        this.loadState.set('ready');
      },
      error: () => this.loadState.set('error'),
    });
  }

  categoryLabel(code: string): string {
    return findCategory(code)?.label ?? code;
  }

  statusLabel(status: RegistrationStatus): string {
    return this.statuses.find((s) => s.value === status)?.label ?? status;
  }

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set(key === 'created_at' ? 'desc' : 'asc');
    }
  }

  ariaSort(key: SortKey): 'ascending' | 'descending' | null {
    return this.sortKey() === key ? (this.sortDir() === 'asc' ? 'ascending' : 'descending') : null;
  }

  clearFilters(): void {
    this.search.set('');
    this.categoryFilter.set('');
  }

  async exportExcel(): Promise<void> {
    const rows = this.filtered();
    if (!rows.length || this.exporting()) return;
    this.exporting.set(true);
    try {
      const date = new Date().toISOString().slice(0, 10);
      await exportAthletesToXlsx(rows, `inscritos-maraton-bolivar-sucre-${date}.xlsx`);
      this.flash(`Excel generado con ${rows.length} atleta${rows.length === 1 ? '' : 's'}.`);
    } catch {
      this.flash('No se pudo generar el archivo Excel.');
    } finally {
      this.exporting.set(false);
    }
  }

  // ─── Correo de prueba ────────────────────────────
  sendTestEmail(): void {
    const correo = window.prompt('¿A qué correo enviamos la prueba?', this.lastTestEmail)?.trim();
    if (!correo) return;
    this.lastTestEmail = correo;
    this.testingEmail.set(true);
    this.api.testEmail(correo).subscribe({
      next: (message) => {
        this.testingEmail.set(false);
        this.flash(`${message} Revisa la bandeja (y la carpeta de spam).`, 8000);
      },
      error: (err: HttpErrorResponse) => {
        this.testingEmail.set(false);
        this.flash(this.errorMessage(err, 'No se pudo enviar el correo de prueba.'), 12000);
      },
    });
  }
  private lastTestEmail = '';

  // ─── Agregar ─────────────────────────────────────
  openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
    this.sendEmail.set(true);
    this.dialogError.set(null);
    this.editForm.reset({
      nombre: '', apellidos: '', cedula: '', fecha_nacimiento: '', correo: '', celular: '',
      ciudad_municipio: '', genero: 'masculino', categoria: 'elite_18', estado: 'pendiente',
    });
    this.editDialog().nativeElement.showModal();
  }

  // ─── Editar ──────────────────────────────────────
  openEdit(athlete: Athlete): void {
    this.editing.set(athlete);
    this.formOpen.set(true);
    this.dialogError.set(null);
    this.editForm.reset({
      nombre: athlete.nombre,
      apellidos: athlete.apellidos,
      cedula: athlete.cedula ?? '',
      fecha_nacimiento: athlete.fecha_nacimiento?.slice(0, 10) ?? '',
      correo: athlete.correo,
      celular: athlete.celular,
      ciudad_municipio: athlete.ciudad_municipio,
      genero: athlete.genero,
      categoria: athlete.categoria,
      estado: athlete.estado,
    });
    this.editDialog().nativeElement.showModal();
  }

  saveEdit(): void {
    const athlete = this.editing();
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.dialogError.set('Revisa los campos marcados.');
      return;
    }

    const value = this.editForm.getRawValue();
    const changes: AthleteUpdate = { ...value, cedula: value.cedula.trim() || null };

    this.saving.set(true);
    this.dialogError.set(null);

    if (!athlete) {
      this.api.create({ ...value, cedula: changes.cedula ?? null, enviar_correo: this.sendEmail() }).subscribe({
        next: (created) => {
          this.athletes.update((list) => [created, ...list]);
          this.saving.set(false);
          this.editDialog().nativeElement.close();
          this.flash(`${created.nombre} ${created.apellidos} inscrito con el código ${created.codigo_inscripcion}.`);
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.dialogError.set(this.errorMessage(err, 'No se pudo crear la inscripción.'));
        },
      });
      return;
    }

    this.api.update(athlete.id, changes).subscribe({
      next: (updated) => {
        this.athletes.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
        this.saving.set(false);
        this.editDialog().nativeElement.close();
        this.flash(`Datos de ${updated.nombre} ${updated.apellidos} actualizados.`);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.dialogError.set(this.errorMessage(err, 'No se pudo guardar.'));
      },
    });
  }

  // ─── Eliminar ────────────────────────────────────
  openDelete(athlete: Athlete): void {
    this.deleting.set(athlete);
    this.dialogError.set(null);
    this.deleteDialog().nativeElement.showModal();
  }

  confirmDelete(): void {
    const athlete = this.deleting();
    if (!athlete) return;
    this.saving.set(true);
    this.api.remove(athlete.id).subscribe({
      next: () => {
        this.athletes.update((list) => list.filter((a) => a.id !== athlete.id));
        this.saving.set(false);
        this.deleteDialog().nativeElement.close();
        this.flash(`Registro ${athlete.codigo_inscripcion} eliminado.`);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.dialogError.set(this.errorMessage(err, 'No se pudo eliminar.'));
      },
    });
  }

  closeDialog(dialog: HTMLDialogElement): void {
    if (!this.saving()) dialog.close();
  }

  onDialogClosed(): void {
    this.editing.set(null);
    this.formOpen.set(false);
    this.deleting.set(null);
    this.dialogError.set(null);
  }

  fieldInvalid(name: keyof typeof this.editForm.controls): boolean {
    const control = this.editForm.controls[name];
    return control.invalid && control.touched;
  }

  private errorMessage(err: HttpErrorResponse, fallback: string): string {
    const body = err.error as { message?: string; errors?: { mensaje: string }[] } | null;
    return body?.errors?.[0]?.mensaje ?? body?.message ?? (err.status === 0 ? 'Sin conexión con el servidor.' : fallback);
  }

  private noticeTimer?: ReturnType<typeof setTimeout>;
  private flash(message: string, ms = 4000): void {
    clearTimeout(this.noticeTimer);
    this.notice.set(message);
    this.noticeTimer = setTimeout(() => this.notice.set(null), ms);
  }
}

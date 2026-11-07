# Marathon Platform — Project Guidelines for Claude Code

## 1. Project Overview
Plataforma web oficial para evento de Maratón de alto rendimiento, diseñada bajo estándares visuales y de rendimiento de nivel internacional (inspirada en las webs de las *World Marathon Majors*: Valencia, Berlín, Boston, New York).

- **Estructura**:
  - `frontend/`: Aplicación Angular moderna (v22+) con componentes Standalone y SCSS.
  - `backend/`: API REST Node.js / Express con base de datos.

---

## 2. Comandos Principales
- **Compilar y validar Frontend**: `cd frontend && npm run build`
- **Iniciar Frontend en desarrollo**: `cd frontend && npm start` (corre en `http://localhost:4200`)
- **Iniciar Backend**: `cd backend && npm start`

> **REGLA DE ORO DE VERIFICACIÓN**: Siempre que termines de modificar código en el frontend, ejecuta `cd frontend && npm run build` para comprobar que no existan errores de compilación ni de TypeScript.

---

## 3. Estándares de Diseño y UI/UX (Nivel Élite Mundial)
- **Estilo Visual**: Energético, atlético, premium y minimalista.
- **Tipografía**: Jerarquía marcada, encabezados con fuerza visual e impacto deportivo, excelente legibilidad.
- **Paleta y Contrastes**: Cumplimiento estricto de accesibilidad WCAG AA. Degradados sutiles, overlays oscuros sobre fotografías de acción.
- **Micro-interacciones**: Transiciones suaves en hover, estados activos claros, feedback visual inmediato en formularios y botones.
- **Responsive Design**: Mobile-first riguroso. La experiencia en smartphone debe ser tan fluida e imponente como en pantallas 4K.

---

## 4. Estándares de Código Angular
- Usar **Standalone Components** (`standalone: true` implícito o explícito en Angular 22).
- Priorizar reactividad moderna (`signals`, `computed`) e inyección moderna con `inject()`.
- Estilos modulares en SCSS limpios, organizados con variables o utilidades consistentes.
- Manejo robusto de validaciones de formularios y estados de carga (loading, error, success).

---

## 5. Reglas de Interacción para Claude Code
1. **Planificar antes de ejecutar**: Resume en 2-3 viñetas qué vas a hacer antes de tocar archivos complejos.
2. **Enfocado y conciso**: Explica únicamente lo necesario para ahorrar tokens de contexto.
3. **Verificación autónoma**: Si al ejecutar `npm run build` surge algún error, resuélvelo antes de devolver el control al usuario.


# 🏃 ¼ Maratón Bolívar - Sucre (Enero 9 de 2027)

Sitio web oficial y sistema de registro de atletas para la **¼ Maratón Bolívar - Sucre**.

---

## 🛠️ Stack Tecnológico

- **Frontend:** Angular 19+ (Standalone Components, HTML/SCSS/TS desacoplados, Reactive Forms, animaciones fluidas).
- **Backend:** Node.js + Express (Middlewares de seguridad, rate-limiting, honeypot anti-bots, sanitización).
- **Base de Datos:** Supabase (PostgreSQL en la nube).
- **Paleta Visual:** Fondo Morado Deportivo (`#1A0933`, `#27104A`), Azul Eléctrico (`#0EA5E9`), Verde Meta (`#10B981`), Rojo Salida (`#EF4444`).

---

## 🚀 Cómo Iniciar el Proyecto

### 1. Iniciar el Backend (API Express)
En una terminal:
```bash
cd backend
npm run dev
```
El servidor arrancará en: `http://localhost:3000`  
Verifica la salud del servicio en: `http://localhost:3000/api/health`

### 2. Iniciar el Frontend (Angular)
En otra terminal:
```bash
cd frontend
npm start
```
Abre tu navegador en: `http://localhost:4200`

---

## 🗄️ Configuración de Supabase (Base de Datos)

1. Ingresa a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. Ve al **SQL Editor** en Supabase.
3. Copia y ejecuta todo el contenido de:
   [`backend/database/schema.sql`](file:///c:/Angular%20Davis/maraton/backend/database/schema.sql)
4. En Supabase ve a **Project Settings > API** y copia:
   - **Project URL**
   - **anon / public key**
5. Pégalos en el archivo [`backend/.env`](file:///c:/Angular%20Davis/maraton/backend/.env):
   ```env
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-anon-key-aqui
   PORT=3000
   FRONTEND_URL=http://localhost:4200
   ```

---

## 🛡️ Seguridad y Protección Anti-Bot Implementada

1. **Honeypot Field:** Campo oculto (`website`) en el formulario. Los bots automatizados lo completan y la API descarta silenciosamente la petición sin alertar al bot.
2. **Rate Limiting:** `express-rate-limit` restringe las peticiones por IP a máximo 5 intentos cada 15 minutos en el endpoint de inscripción.
3. **Validación Dual:**
   - Frontend con `ReactiveFormsModule` (edad mínima calculada al 9 de enero 2027, formato de celular colombiano `3XXXXXXXXX`, email válido).
   - Backend con `express-validator` (escapado de caracteres, sanitización XSS, validaciones estrictas).
4. **Cabeceras HTTP Seguras:** `helmet` para protección contra clickjacking, MIME sniffing y ataques comunes.

---

## 🎬 Prompts de Video con Inteligencia Artificial

### 1. Video de la Salida (Hero de la Web)
> **Herramienta sugerida:** Google Veo / Google Flow / Runway Gen-3 / Sora  
> **Prompt:**
> ```text
> Cinematic ultra-realistic 4K wide-angle shot of the starting line of a major marathon at sunrise. In the center, a towering modern inflatable archway branded with vibrant sports banners in purple, blue, red, and green. A diverse crowd of athletic marathon runners in colorful professional running gear warming up, stretching, jumping with adrenaline, and breathing in the crisp morning air, focused expressions of anticipation and determination. Golden hour sunlight casting long shadows and dramatic lens flares on the asphalt road. Camera begins low near the ground and smoothly pulls back and rises in a sweeping drone-style cinematic movement, revealing the energetic atmosphere and banners waving gently in the breeze. 60fps, photorealistic, 8k resolution, sports documentary aesthetic.
> ```

### 2. Video Aéreo del Recorrido (Bolívar - Sucre)
> **Herramienta sugerida:** Google Earth Studio / Runway Gen-3 / Luma Dream Machine  
> **Prompt:**
> ```text
> Cinematic aerial drone footage flying smoothly over a scenic asphalt road connecting two historic colonial mountain towns in Santander Colombia at sunrise. Panoramic views of green tropical hills, winding highway with clear lane markings, misty valleys, and distant mountains. Golden morning light, continuous forward tracking shot along the running route. 4k resolution, smooth 60fps drone cinematography, inspiring and grand sports documentary mood.
> ```

---

## 📁 Estructura del Código

```text
maraton/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── hero/          # Video hero, CTA y banner
│   │   │   │   ├── countdown/     # Cuenta regresiva al 9 Ene 2027
│   │   │   │   ├── categories/    # Tarjetas ¼ Maratón y 6K La Peña con premios
│   │   │   │   ├── route-map/     # Trazado, highlights y mapa
│   │   │   │   ├── registration/  # Formulario validado con anti-bot
│   │   │   │   ├── sponsors/      # Grilla de patrocinadores por categoría
│   │   │   │   └── footer/        # Enlaces, contacto y redes
│   │   │   └── services/          # Servicio HTTP de inscripción
│   │   └── styles/                # Variables y mixins SCSS
│   └── public/assets/             # Imágenes, posters y videos
│
└── backend/
    ├── database/schema.sql        # Script SQL para Supabase
    └── src/
        ├── config/supabase.js     # Conexión cliente Supabase
        ├── controllers/           # Lógica de registro y código único MBS-XXXX
        ├── middlewares/           # Anti-bot, Rate limiter, Validator
        ├── routes/                # Endpoints /api/inscripciones
        └── server.js              # Servidor Express
```


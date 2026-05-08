# 🏆 Quiniela Mundial 2026

Quiniela multijugador para el Mundial 2026. Stack: **Next.js 14 + Supabase + Vercel**.

---

## ✅ Guía de Despliegue (≈15 minutos)

### PASO 1 — Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → **New Project**
2. Pon nombre: `quiniela-mundial-2026`
3. Elige una contraseña fuerte para la DB y guárdala
4. Espera ~2 minutos a que se cree el proyecto

### PASO 2 — Crear las tablas en Supabase

1. En tu proyecto Supabase → **SQL Editor** → **New query**
2. Copia y pega TODO el contenido del archivo `supabase-schema.sql`
3. Click en **Run** (o Ctrl+Enter)
4. Debes ver: "Success. No rows returned"

### PASO 3 — Obtener las credenciales de Supabase

1. En Supabase → **Settings** → **API**
2. Copia:
   - **Project URL** → algo como `https://abcdefgh.supabase.co`
   - **anon public key** → el token largo que empieza con `eyJ...`

### PASO 4 — Subir el código a GitHub

```bash
# En tu computadora, dentro de la carpeta del proyecto:
git init
git add .
git commit -m "Quiniela Mundial 2026"

# Crea un repositorio en github.com (botón + → New repository)
# Luego conecta y sube:
git remote add origin https://github.com/TU_USUARIO/quiniela-mundial-2026.git
git branch -M main
git push -u origin main
```

### PASO 5 — Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Importa tu repositorio de GitHub
3. En **Environment Variables**, agrega estas 3 variables:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Tu Project URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon key de Supabase |
| `ADMIN_PASSWORD` | La contraseña que TÚ elijas para el admin |

4. Click **Deploy** → espera ~2 minutos
5. ¡Listo! Vercel te da una URL tipo `https://quiniela-mundial-2026.vercel.app`

---

## 🎮 Cómo usar la quiniela

### Para los jugadores:
1. Entran a la URL que te da Vercel
2. Click en **"Entrar"** → se registran con nombre + contraseña
3. Van a **⚽ Grupos** e ingresan sus predicciones (se guardan automáticamente)
4. Van a **🏆 Eliminatorias** para predecir rondas y el campeón
5. Ven la **📊 Tabla** para ver cómo van todos

### Para el admin (tú):
1. Cualquier usuario puede ir a `/admin`
2. Ingresa la `ADMIN_PASSWORD` que pusiste en Vercel
3. Ingresa los marcadores reales conforme se juegan los partidos
4. Los puntos se calculan automáticamente en la tabla

---

## 📊 Sistema de puntos

### Fase de Grupos
| Acierto | Puntos |
|---------|--------|
| Marcador exacto (ej: predijiste 2-1, fue 2-1) | **3 pts** |
| Solo el ganador o empate | **1 pt** |
| Fallo total | **0 pts** |

### Eliminatorias (puntos escalan por ronda)
| Ronda | Exacto | Solo ganador |
|-------|--------|--------------|
| Octavos | 3 pts | 1 pt |
| Cuartos | 4 pts | 2 pts |
| Semifinal | 5 pts | 2 pts |
| 3er puesto | 4 pts | 2 pts |
| Final | 6 pts | 3 pts |

### Campeón
| Acierto | Puntos |
|---------|--------|
| Aciertas el campeón del mundial | **10 pts** |

---

## 🔧 Desarrollo local (opcional)

```bash
# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env.local
# Edita .env.local con tus valores reales

# Correr en desarrollo
npm run dev
# → Abre http://localhost:3000
```

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx              # Home
│   ├── login/page.tsx        # Login + Registro
│   ├── grupos/page.tsx       # Predicciones fase de grupos
│   ├── eliminatorias/page.tsx # Predicciones eliminatorias
│   ├── clasificacion/page.tsx # Tabla de puntos
│   ├── admin/page.tsx        # Panel admin (resultados reales)
│   └── api/
│       ├── auth/             # Login + registro
│       ├── predictions/      # Guardar predicciones
│       ├── results/          # Guardar resultados (admin)
│       └── leaderboard/      # Calcular puntos
├── components/
│   ├── Navbar.tsx
│   └── MatchCard.tsx
└── lib/
    ├── supabase.ts           # Cliente Supabase
    ├── auth-context.tsx      # Sesión del usuario
    └── data.ts               # Equipos, grupos, partidos
```

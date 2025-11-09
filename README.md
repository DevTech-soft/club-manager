# 🏐 Volleyball Club Manager

Sistema completo de gestión para clubes de voleibol que permite administrar jugadores, equipos, entrenadores, asistencias y torneos de manera eficiente.

## 📋 Descripción

Volleyball Club Manager es una aplicación web fullstack diseñada para facilitar la administración de clubes deportivos de voleibol. Ofrece funcionalidades para registrar jugadores, crear equipos, gestionar asistencias, organizar torneos con sistema de grupos y seguimiento de partidos con sets detallados.

## ✨ Características Principales

### Gestión de Jugadores
- ✅ Registro completo de jugadores con información personal
- ✅ Historial de estadísticas por fecha
- ✅ Gestión de pagos mensuales
- ✅ Búsqueda por documento de identidad
- ✅ Categorización por subcategoría y posición

### Gestión de Equipos
- ✅ Creación de equipos por categoría (Masculino, Femenino, Mixto)
- ✅ Asignación de jugadores a equipos
- ✅ Clasificación por nivel (Básico, Intermedio, Avanzado)
- ✅ Asignación de entrenadores

### Gestión de Asistencias
- ✅ Registro diario de asistencias
- ✅ Seguimiento por jugador
- ✅ Historial de asistencias

### Gestión de Torneos
- ✅ Creación de torneos (Rápido o Estándar)
- ✅ Registro de equipos externos
- ✅ Generación automática de grupos
- ✅ Sistema round-robin de partidos
- ✅ Gestión de sets por partido
- ✅ Tabla de posiciones automática
- ✅ Seguimiento de puntos, victorias y derrotas

### Administración
- ✅ Gestión de entrenadores
- ✅ Configuración personalizada del club (colores, logos)
- ✅ Autenticación JWT con refresh tokens
- ✅ Roles de usuario (Admin, Superadmin, Coach)

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Shadcn/ui** - Componentes UI
- **React Router** - Enrutamiento
- **Context API** - Manejo de estado

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **Prisma ORM** - Base de datos ORM
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Hashing de contraseñas

## 📁 Estructura del Proyecto

```
club-manager/
├── frontend/                    # Aplicación React
│   ├── components/             # Componentes React
│   │   ├── ui/                # Componentes UI base (Shadcn)
│   │   ├── layout/            # Layout components
│   │   └── features/          # Componentes por feature
│   ├── services/              # Servicios API
│   ├── context/               # React Context
│   ├── lib/                   # Utilidades
│   ├── App.tsx                # Componente principal
│   ├── index.tsx              # Entry point
│   ├── types.ts               # Tipos TypeScript
│   └── package.json           # Dependencias frontend
│
├── backend/                    # API REST
│   ├── src/
│   │   ├── config/            # Configuración (DB, constantes)
│   │   ├── controllers/       # Controladores HTTP
│   │   ├── services/          # Lógica de negocio
│   │   ├── routes/            # Definición de rutas
│   │   ├── middlewares/       # Middlewares (auth, etc.)
│   │   ├── utils/             # Utilidades y mappers
│   │   ├── types/             # Tipos TypeScript
│   │   └── server.ts          # Entry point
│   ├── prisma/
│   │   └── schema.prisma      # Esquema de base de datos
│   └── package.json           # Dependencias backend
│
├── .env                        # Variables de entorno
├── .gitignore                  # Archivos ignorados
└── README.md                   # Este archivo
```

## 🚀 Instalación

### Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 14.x
- **Git**

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd club-manager
   ```

2. **Configurar variables de entorno**

   Crear archivo `.env` en la raíz del proyecto:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/volleyball_club"

   # JWT
   JWT_SECRET="tu-secret-key-super-segura"

   # Gemini API (opcional)
   GEMINI_API_KEY="tu-gemini-api-key"
   ```

3. **Instalar dependencias del Backend**
   ```bash
   cd backend
   npm install
   ```

4. **Configurar base de datos**
   ```bash
   # Generar cliente Prisma
   npx prisma generate

   # Ejecutar migraciones
   npx prisma migrate dev

   # (Opcional) Sembrar datos de prueba
   npx prisma db seed
   ```

5. **Instalar dependencias del Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

## 🎯 Ejecución

### Desarrollo

**Opción 1: Ejecutar Frontend y Backend por separado**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# API corriendo en http://localhost:3001
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# App corriendo en http://localhost:5173
```

**Opción 2: Usar script concurrente (recomendado)**

Desde la raíz:
```bash
npm run dev:all
```

### Producción

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Los archivos estáticos estarán en frontend/dist/
```

## 📜 Scripts Disponibles

### Frontend (`frontend/`)
```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para producción
npm run preview      # Vista previa de build de producción
npm run lint         # Ejecutar linter
```

### Backend (`backend/`)
```bash
npm run dev          # Iniciar servidor con nodemon
npm run build        # Compilar TypeScript
npm start            # Iniciar servidor de producción
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio
```

## 🏗️ Arquitectura

### Backend - Arquitectura en Capas

```
Routes → Controllers → Services → Database
```

- **Routes**: Definición de endpoints y validación de entrada
- **Controllers**: Manejo de peticiones HTTP y respuestas
- **Services**: Lógica de negocio y reglas de dominio
- **Database (Prisma)**: Acceso a datos y persistencia

### Frontend - Arquitectura por Componentes

```
App → Pages → Features → Components → UI
```

- **Context API**: Gestión de estado global (Auth, Theme)
- **Services**: Comunicación con API REST
- **Components**: Componentes reutilizables
- **UI**: Componentes base de Shadcn/ui

## 🔌 API Endpoints

### Autenticación
```
POST   /api/auth/login          # Iniciar sesión
POST   /api/auth/logout         # Cerrar sesión
POST   /api/auth/refresh        # Refrescar token
GET    /api/auth/me             # Obtener usuario actual
```

### Jugadores
```
GET    /api/players             # Listar todos los jugadores
GET    /api/players/:id         # Obtener jugador por ID
GET    /api/players/document/:doc  # Buscar por documento
POST   /api/players             # Crear jugador
PUT    /api/players/:id         # Actualizar jugador
DELETE /api/players/:id         # Eliminar jugador
POST   /api/players/:id/payment # Registrar pago
```

### Equipos
```
GET    /api/teams               # Listar todos los equipos
GET    /api/teams/:id           # Obtener equipo por ID
POST   /api/teams               # Crear equipo
PUT    /api/teams/:id           # Actualizar equipo
DELETE /api/teams/:id           # Eliminar equipo
```

### Torneos
```
GET    /api/tournaments         # Listar torneos
GET    /api/tournaments/:id     # Obtener torneo
POST   /api/tournaments         # Crear torneo
PUT    /api/tournaments/:id     # Actualizar torneo
DELETE /api/tournaments/:id     # Eliminar torneo
GET    /api/tournaments/:id/positions  # Tabla de posiciones
```

### Partidos
```
GET    /api/matches?tournamentId=xxx  # Listar partidos
GET    /api/matches/:id                # Obtener partido
POST   /api/matches                    # Generar partidos (round-robin)
POST   /api/matches/groups             # Generar grupos y partidos
PUT    /api/matches/:id                # Actualizar partido
PATCH  /api/matches/:id/finish         # Finalizar partido
POST   /api/matches/:matchId/sets      # Crear set
POST   /api/matches/:matchId/sets/:setId/finish   # Finalizar set
PATCH  /api/matches/:matchId/sets/:setId          # Actualizar puntos
```

### Otros Endpoints
```
GET    /api/coaches             # Gestión de entrenadores
GET    /api/attendances         # Gestión de asistencias
GET    /api/groups              # Grupos de torneos
GET    /api/club-settings       # Configuración del club
```

## 🔐 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** con los siguientes tokens:

- **Access Token**: Expira en 15 minutos (almacenado en cookie HTTP-only)
- **Refresh Token**: Expira en 7 días (almacenado en cookie HTTP-only)

### Credenciales por defecto:

**Admin:**
- Usuario: `admin`
- Contraseña: `password`

**Superadmin:**
- Usuario: `superadmin`
- Contraseña: `superpassword`

**Coaches:**
- Usuario: documento del entrenador
- Contraseña: documento del entrenador (por defecto)

## 🗄️ Base de Datos

### Modelos Principales

- **Player**: Jugadores del club
- **Team**: Equipos
- **Coach**: Entrenadores
- **Attendance**: Asistencias
- **Tournament**: Torneos
- **TournamentTeam**: Equipos registrados en torneos
- **Group**: Grupos de torneos
- **Match**: Partidos
- **MatchSet**: Sets de partidos
- **Position**: Tabla de posiciones
- **ClubSettings**: Configuración del club

### Diagrama de Relaciones

```
Player ←→ Team (Many-to-Many)
Player → StatsRecord (One-to-Many)
Player → Attendance (One-to-Many)

Team → TournamentTeam (One-to-Many)
Tournament → TournamentTeam (One-to-Many)
Tournament → Group (One-to-Many)

Group → Match (One-to-Many)
Match → MatchSet (One-to-Many)
Match → Position (One-to-Many)
```

## 🎨 Personalización

La aplicación permite personalizar:

- 🎨 **Colores del tema** (primario, secundario, terciario, etc.)
- 🖼️ **Logo del club**
- 📝 **Nombre del club**
- ⚙️ **Habilitar/deshabilitar** creación de equipos
- 💰 **Habilitar/deshabilitar** pagos mensuales

Acceso: `/settings` (requiere rol Admin/Superadmin)

## 🧪 Testing

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## 📦 Despliegue

### Backend (Heroku, Railway, Render)
1. Configurar variables de entorno
2. Ejecutar migraciones de Prisma
3. Compilar TypeScript
4. Iniciar servidor

### Frontend (Vercel, Netlify)
1. Compilar aplicación
2. Desplegar carpeta `dist/`
3. Configurar redirecciones para SPA

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Historial de Cambios

### v2.0.0 (2025-11-09)
- ✅ Refactorización completa del backend a arquitectura en capas
- ✅ Reorganización del proyecto en estructura monorepo (frontend/backend)
- ✅ Separación de responsabilidades (routes, controllers, services)
- ✅ Mejoras en la documentación

### v1.0.0 (2024)
- 🎉 Lanzamiento inicial

## 📄 Licencia

Este proyecto es privado y está bajo licencia propietaria.

## 👥 Autor

Desarrollado por el equipo de Dev-Tech

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o contacta al equipo de desarrollo.

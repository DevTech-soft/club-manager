# 🏐 Volleyball Club Manager - Backend

API REST para el sistema de gestión de clubes de voleibol.

## 📋 Descripción

Backend desarrollado con Node.js, Express y TypeScript que proporciona una API REST completa para la gestión de clubes de voleibol. Implementa autenticación JWT, manejo de torneos con sistema de grupos y seguimiento detallado de partidos.

## 🛠️ Tecnologías

- **Node.js** 18.x - Runtime JavaScript
- **Express.js** 4.x - Framework web
- **TypeScript** 5.x - Tipado estático
- **Prisma ORM** 5.x - Object-Relational Mapping
- **PostgreSQL** 14.x - Base de datos relacional
- **JWT** - Autenticación y autorización
- **bcrypt** - Hashing de contraseñas
- **cookie-parser** - Manejo de cookies
- **cors** - Cross-Origin Resource Sharing

## 📁 Estructura

```
backend/
├── src/
│   ├── config/              # Configuración
│   │   ├── constants.ts     # Constantes JWT, cookies
│   │   └── database.ts      # Cliente Prisma
│   │
│   ├── controllers/         # Controladores HTTP
│   │   ├── auth.controller.ts
│   │   ├── coaches.controller.ts
│   │   ├── players.controller.ts
│   │   ├── teams.controller.ts
│   │   ├── attendances.controller.ts
│   │   ├── tournaments.controller.ts
│   │   ├── groups.controller.ts
│   │   ├── matches.controller.ts
│   │   └── settings.controller.ts
│   │
│   ├── services/            # Lógica de negocio
│   │   ├── auth.service.ts
│   │   ├── coaches.service.ts
│   │   ├── players.service.ts
│   │   ├── teams.service.ts
│   │   ├── attendances.service.ts
│   │   ├── tournaments.service.ts
│   │   ├── groups.service.ts
│   │   ├── matches.service.ts
│   │   ├── sets.service.ts
│   │   ├── positions.service.ts
│   │   └── settings.service.ts
│   │
│   ├── routes/              # Definición de rutas
│   │   ├── index.ts         # Router central
│   │   ├── auth.routes.ts
│   │   ├── coaches.routes.ts
│   │   ├── players.routes.ts
│   │   ├── teams.routes.ts
│   │   ├── attendances.routes.ts
│   │   ├── tournaments.routes.ts
│   │   ├── groups.routes.ts
│   │   ├── matches.routes.ts
│   │   └── settings.routes.ts
│   │
│   ├── middlewares/         # Middlewares
│   │   ├── auth.ts          # Autenticación JWT
│   │   └── index.ts
│   │
│   ├── utils/               # Utilidades
│   │   ├── mappers.ts       # Transformación de datos
│   │   └── tournaments.ts   # Cálculo de grupos
│   │
│   └── server.ts            # Entry point
│
├── prisma/
│   ├── schema.prisma        # Schema de BD
│   └── migrations/          # Migraciones
│
├── package.json
├── tsconfig.json
└── .env
```

## 🏗️ Arquitectura

### Patrón de Capas

```
HTTP Request → Routes → Controllers → Services → Database
                  ↓           ↓           ↓
              Middlewares  Validation   Prisma
```

### Responsabilidades

- **Routes**: Definición de endpoints y middlewares
- **Controllers**: Manejo de HTTP (request/response)
- **Services**: Lógica de negocio y reglas de dominio
- **Prisma**: Acceso a datos y persistencia

## 🚀 Instalación

### Requisitos Previos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm >= 9.x

### Pasos

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**

   Crear archivo `.env`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/volleyball_club"

   # Server
   PORT=3001

   # JWT
   JWT_SECRET="tu-secret-key-super-segura"
   ```

3. **Generar cliente Prisma**
   ```bash
   npx prisma generate
   ```

4. **Ejecutar migraciones**
   ```bash
   npx prisma migrate dev
   ```

5. **Iniciar servidor**
   ```bash
   npm run dev
   ```

## 📜 Scripts

```bash
npm run dev              # Servidor desarrollo (nodemon)
npm run build            # Compilar TypeScript
npm start                # Servidor producción
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio
npm run prisma:seed      # Sembrar datos
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Usuario actual

### Players
- `GET /api/players` - Listar jugadores
- `GET /api/players/:id` - Obtener jugador
- `GET /api/players/document/:doc` - Buscar por documento
- `POST /api/players` - Crear jugador
- `PUT /api/players/:id` - Actualizar jugador
- `DELETE /api/players/:id` - Eliminar jugador
- `POST /api/players/:id/payment` - Registrar pago

### Teams
- CRUD completo de equipos

### Tournaments
- CRUD completo de torneos
- `GET /api/tournaments/:id/positions` - Tabla de posiciones

### Matches
- `GET /api/matches?tournamentId=xxx` - Listar partidos
- `POST /api/matches` - Generar partidos (round-robin)
- `POST /api/matches/groups` - Generar grupos y partidos
- `PATCH /api/matches/:id/finish` - Finalizar partido
- `POST /api/matches/:matchId/sets` - Crear set
- `POST /api/matches/:matchId/sets/:setId/finish` - Finalizar set
- `PATCH /api/matches/:matchId/sets/:setId` - Actualizar puntos

### Otros
- Coaches, Attendances, Groups, Settings

Ver documentación completa en README principal.

## 🔐 Autenticación

### JWT con Cookies

```typescript
// Access Token: 15 minutos
// Refresh Token: 7 días

// Almacenados en cookies HTTP-only
{
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
}
```

### Credenciales por defecto

**Admin:**
- User: `admin`
- Pass: `password`

**Superadmin:**
- User: `superadmin`
- Pass: `superpassword`

## 🗄️ Base de Datos

### Modelos Principales

```prisma
model Player {
  id            String
  name          String
  document      String @unique
  position      Position
  subCategory   SubCategory
  teams         Team[]
  statsHistory  StatsRecord[]
  attendances   Attendance[]
}

model Team {
  id            String
  name          String
  mainCategory  MainCategory
  subCategory   SubCategory
  players       Player[]
  tournamentTeams TournamentTeam[]
}

model Tournament {
  id              String
  name            String
  category        String
  type            TournamentType
  registeredTeams TournamentTeam[]
  groups          Group[]
}

model Match {
  id            String
  tournament    Tournament
  group         Group
  teamA         TournamentTeam
  teamB         TournamentTeam
  sets          MatchSet[]
  status        MatchStatus
  winnerId      String?
}
```

### Migraciones

```bash
# Crear migración
npx prisma migrate dev --name add_new_field

# Aplicar migraciones
npx prisma migrate deploy

# Reset BD (desarrollo)
npx prisma migrate reset
```

## 🧪 Testing

```bash
npm run test              # Ejecutar tests
npm run test:watch        # Tests en modo watch
npm run test:coverage     # Cobertura de tests
```

## 📊 Monitoreo

### Prisma Studio

```bash
npx prisma studio
# Abre en http://localhost:5555
```

### Logs

Los logs se manejan con `console.log` en desarrollo.

Para producción, considerar:
- Winston
- Morgan
- Pino

## 🔧 Configuración

### CORS

Configurado en `src/server.ts`:

```typescript
app.use(cors());
```

Para producción, especificar orígenes permitidos:

```typescript
app.use(cors({
  origin: 'https://tu-dominio.com',
  credentials: true
}));
```

### Rate Limiting

Considerar implementar rate limiting para producción:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite por IP
});

app.use('/api/', limiter);
```

## 🚀 Despliegue

### Heroku

```bash
# Agregar addon PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main

# Ejecutar migraciones
heroku run npx prisma migrate deploy
```

### Railway

1. Conectar repositorio
2. Agregar PostgreSQL addon
3. Configurar variables de entorno
4. Deploy automático

### Render

1. Crear Web Service
2. Agregar PostgreSQL
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npm start`

## 📝 Mejoras Futuras

- [ ] Validación de inputs con Zod
- [ ] Rate limiting
- [ ] Logs estructurados (Winston/Pino)
- [ ] Tests unitarios e integración
- [ ] Documentación con Swagger
- [ ] Health check endpoint
- [ ] Métricas con Prometheus
- [ ] Cache con Redis

## 👥 Contribución

Ver guía de contribución en README principal.

---

**API URL (dev):** http://localhost:3001
**Prisma Studio:** http://localhost:5555

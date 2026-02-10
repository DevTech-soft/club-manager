# Ajustes de Proyecto - Mejoras y Recomendaciones

## 📋 Resumen Ejecutivo

Este documento contiene un análisis detallado del proyecto **Club Manager** y propone mejoras en tres áreas clave:
1. **Estructura del proyecto**
2. **Consumo de API**
3. **Rendimiento**

---

## 🏗️ 1. MEJORAS DE ESTRUCTURA

### 1.1 Backend

#### ✅ Estructura Actual (Buena)
```
backend/src/
├── config/          # Configuraciones
├── controllers/     # Controladores HTTP
├── middlewares/     # Middlewares Express
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── utils/           # Utilidades
├── lib/             # Clientes (Prisma)
└── types.ts         # Tipos globales
```

#### 🔧 Mejoras Propuestas

##### A. Implementar Patrón Repository
**Problema:** Los servicios acceden directamente a Prisma, dificultando testing y acoplando la app a la DB.

**Solución:** Crear capa de repositorios:
```
backend/src/
├── repositories/     # NUEVO
│   ├── base.repository.ts
│   ├── player.repository.ts
│   ├── team.repository.ts
│   └── index.ts
```

```typescript
// repositories/base.repository.ts
export abstract class BaseRepository<T, CreateDTO, UpdateDTO> {
  constructor(protected model: any) {}
  
  async findAll(): Promise<T[]> {
    return this.model.findMany();
  }
  
  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }
  
  async create(data: CreateDTO): Promise<T> {
    return this.model.create({ data });
  }
  
  async update(id: string, data: UpdateDTO): Promise<T> {
    return this.model.update({ where: { id }, data });
  }
  
  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }
}

// repositories/player.repository.ts
export class PlayerRepository extends BaseRepository<Player, CreatePlayerDTO, UpdatePlayerDTO> {
  constructor() {
    super(prisma.player);
  }
  
  async findWithStats(): Promise<Player[]> {
    return this.model.findMany({
      include: { statsHistory: { orderBy: { date: 'desc' } } }
    });
  }
}
```

**Beneficios:**
- ✅ Facilita mocking para tests
- ✅ Centraliza queries complejas
- ✅ Desacopla servicios de Prisma

##### B. Implementar Validación con Zod
**Problema:** No hay validación de datos de entrada en los controladores.

**Solución:**
```typescript
// validators/player.validator.ts
import { z } from 'zod';

export const createPlayerSchema = z.object({
  name: z.string().min(2).max(100),
  document: z.string().regex(/^\d+$/),
  email: z.string().email().optional(),
  birthDate: z.string().datetime(),
  position: z.enum(['Setter', 'Libero', 'MiddleBlocker', 'OutsideHitter', 'OppositeHitter']),
  subCategory: z.enum(['Basico', 'Intermedio', 'Avanzado']),
});

// middlewares/validate.ts
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      next(error);
    }
  };
};

// Uso en rutas
router.post('/', validate(createPlayerSchema), playerController.create);
```

##### C. Centralizar Manejo de Errores
**Problema:** Los errores se manejan de forma inconsistente.

**Solución:**
```typescript
// errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// middlewares/errorHandler.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code
      }
    });
  }
  
  // Log error details for debugging
  console.error('Unhandled error:', err);
  
  return res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  });
};
```

##### D. Agregar Logging Estructurado
```typescript
// utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

##### E. Implementar Rate Limiting
```typescript
// middlewares/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite por IP
  message: 'Too many requests, please try again later'
});

// Aplicar en server.ts
app.use('/api/', apiLimiter);

// Limitar más endpoints de auth
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 intentos de login por IP
  skipSuccessfulRequests: true
});
```

### 1.2 Frontend

#### ✅ Estructura Actual (Buena)
```
frontend/
├── components/
│   ├── dashboard/    # Componentes del dashboard
│   ├── layout/       # Layout y Sidebar
│   ├── pages/        # Páginas
│   ├── shared/       # Componentes compartidos
│   └── ui/           # Componentes UI base
├── context/          # Contextos React
├── services/         # API y servicios
│   ├── resources/    # APIs por recurso ✅
│   ├── apiClient.ts  # HTTP Client ✅
│   └── api.types.ts  # Tipos de API
├── lib/              # Utilidades
└── types.ts          # Tipos globales
```

#### 🔧 Mejoras Propuestas

##### A. Implementar Feature-Based Structure
**Problema:** Los componentes están organizados por tipo, no por feature.

**Solución para escalar:**
```
frontend/src/
├── features/              # NUEVO
│   ├── players/
│   │   ├── components/
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── PlayerForm.tsx
│   │   │   └── PlayerList.tsx
│   │   ├── hooks/
│   │   │   ├── usePlayers.ts
│   │   │   └── usePlayerMutations.ts
│   │   ├── services/
│   │   │   └── playerApi.ts
│   │   ├── types/
│   │   │   └── player.types.ts
│   │   └── utils/
│   │       └── playerHelpers.ts
│   ├── teams/
│   ├── tournaments/
│   └── auth/
├── shared/               # Componentes/UI compartidos
│   ├── components/
│   ├── hooks/
│   └── utils/
└── app/                  # Configuración de la app
    ├── providers.tsx
    └── router.tsx
```

##### B. Implementar React Query (TanStack Query)
**Problema:** El DataContext maneja fetching y estado manualmente.

**Solución:**
```typescript
// hooks/usePlayers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PLAYERS_KEY = 'players';

export const usePlayers = () => {
  return useQuery({
    queryKey: [PLAYERS_KEY],
    queryFn: playersApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 30 * 1000, // Polling cada 30s
  });
};

export const useCreatePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: playersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLAYERS_KEY] });
    },
  });
};

// Uso en componentes
function PlayerList() {
  const { data: players, isLoading, error } = usePlayers();
  const createPlayer = useCreatePlayer();
  
  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {players?.map(player => <PlayerCard key={player.id} player={player} />)}
    </div>
  );
}
```

**Beneficios:**
- ✅ Caché inteligente
- ✅ Refetch automático
- ✅ Optimistic updates
- ✅ Manejo de estado de loading/error
- ✅ Deduping de requests

##### C. Implementar Barrel Exports
**Problema:** Imports largos y dispersos.

**Solución:**
```typescript
// components/index.ts
export { Button } from './ui/Button';
export { Card } from './ui/Card';
export { Loader } from './ui/Loader';
export { Layout } from './layout/Layout';
export { Sidebar } from './layout/Sidebar';

// Uso simplificado
import { Button, Card, Loader } from '@/components';
```

##### D. Separar Tipos por Dominio
```typescript
// types/player.types.ts
export interface Player {
  id: string;
  name: string;
  // ...
}

export interface PlayerCreationData {
  name: string;
  // ...
}

// types/index.ts (barrel)
export * from './player.types';
export * from './team.types';
export * from './tournament.types';
```

---

## 🌐 2. MEJORAS DE CONSUMO DE API

### 2.1 Backend - API REST

#### 🔧 Mejoras Propuestas

##### A. Implementar Versionado de API
```typescript
// routes/index.ts
const router = Router();

// Version 1
router.use('/v1', v1Routes);

// Version 2 (futura)
// router.use('/v2', v2Routes);
```

##### B. Implementar HATEOAS
```typescript
// utils/hateoas.ts
export const withLinks = (resource: any, links: Link[]) => ({
  data: resource,
  _links: links
});

// Uso en controlador
res.json(withLinks(player, [
  { rel: 'self', href: `/api/players/${player.id}` },
  { rel: 'teams', href: `/api/players/${player.id}/teams` },
  { rel: 'attendances', href: `/api/players/${player.id}/attendances` }
]));
```

##### C. Implementar Paginación Estándar
```typescript
// utils/pagination.ts
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
  links: {
    self: string;
    first: string;
    last: string;
    next?: string;
    prev?: string;
  };
}

// Uso en servicio
export const getPlayers = async (page = 1, perPage = 20): Promise<PaginatedResponse<Player>> => {
  const [players, total] = await Promise.all([
    prisma.player.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      include: { statsHistory: true }
    }),
    prisma.player.count()
  ]);
  
  return {
    data: players.map(mapPlayerForFrontend),
    meta: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage)
    },
    links: generateLinks(req, page, perPage, total)
  };
};
```

##### D. Implementar Filtros y Búsqueda
```typescript
// GET /api/players?position=Setter&category=Avanzado&search=juan
export const getPlayers = async (filters: PlayerFilters) => {
  const where: Prisma.PlayerWhereInput = {};
  
  if (filters.position) {
    where.position = positionToPrisma[filters.position];
  }
  
  if (filters.subCategory) {
    where.subCategory = subCategoryToPrisma[filters.subCategory];
  }
  
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { document: { contains: filters.search } }
    ];
  }
  
  return prisma.player.findMany({ where, include: { statsHistory: true } });
};
```

##### E. Implementar ETag para Caché HTTP
```typescript
// middlewares/etag.ts
import crypto from 'crypto';

export const generateETag = (data: any): string => {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
};

export const conditionalGet = (req: Request, res: Response, next: NextFunction) => {
  const etag = generateETag(res.locals.data);
  const ifNoneMatch = req.headers['if-none-match'];
  
  if (ifNoneMatch === etag) {
    return res.status(304).end();
  }
  
  res.setHeader('ETag', etag);
  next();
};
```

### 2.2 Frontend - API Client

#### ✅ Estructura Actual (Muy Buena)
El frontend ya tiene una excelente estructura de API con:
- `apiClient.ts` - Cliente HTTP genérico
- `resources/` - APIs organizadas por recurso
- Manejo de refresh token

#### 🔧 Mejoras Propuestas

##### A. Implementar Request Deduplication
```typescript
// apiClient.ts - Ya implementado parcialmente
// Mejorar con AbortController para cancelar requests

class ApiClient {
  private pendingRequests = new Map<string, AbortController>();
  
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    // Cancelar request anterior si existe
    const key = `GET:${endpoint}`;
    if (this.pendingRequests.has(key)) {
      this.pendingRequests.get(key)!.abort();
    }
    
    const controller = new AbortController();
    this.pendingRequests.set(key, controller);
    
    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      return this.handleResponse<T>(response, config);
    } finally {
      this.pendingRequests.delete(key);
    }
  }
}
```

##### B. Implementar Retry con Exponential Backoff
```typescript
// apiClient.ts
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
};

private async fetchWithRetry<T>(
  fetchFn: () => Promise<Response>,
  config: RetryConfig = defaultRetryConfig,
  attempt: number = 1
): Promise<Response> {
  try {
    const response = await fetchFn();
    
    if (!response.ok && config.retryableStatuses.includes(response.status)) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (attempt >= config.maxRetries) throw error;
    
    const delay = Math.min(
      config.baseDelay * Math.pow(2, attempt - 1),
      config.maxDelay
    );
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.fetchWithRetry(fetchFn, config, attempt + 1);
  }
}
```

##### C. Implementar Caché de Requests (Stale-While-Revalidate)
```typescript
// cache/apiCache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos
  
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    if (Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.data;
  }
  
  set<T>(key: string, data: T, etag?: string): void {
    this.cache.set(key, { data, timestamp: Date.now(), etag });
  }
  
  invalidate(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) this.cache.delete(key);
    }
  }
}
```

##### D. Implementar WebSocket para Updates en Tiempo Real
```typescript
// services/websocket.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect() {
    this.ws = new WebSocket(`${WS_URL}/updates`);
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleUpdate(update);
    };
    
    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.connect(), 1000 * Math.pow(2, this.reconnectAttempts));
        this.reconnectAttempts++;
      }
    };
  }
  
  private handleUpdate(update: ServerUpdate) {
    switch (update.type) {
      case 'PLAYER_UPDATED':
        queryClient.invalidateQueries(['players', update.data.id]);
        break;
      case 'ATTENDANCE_RECORDED':
        queryClient.invalidateQueries(['attendances']);
        break;
    }
  }
}
```

---

## ⚡ 3. MEJORAS DE RENDIMIENTO

### 3.1 Backend

#### 🔧 Optimizaciones Propuestas

##### A. Implementar Caché con Redis
```typescript
// cache/redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    // Override res.json para cachear respuesta
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      redis.setex(key, ttl, JSON.stringify(data));
      return originalJson(data);
    };
    
    next();
  };
};

// Uso
router.get('/players', cacheMiddleware(60), playerController.getAll);

// Invalidar caché en mutaciones
export const invalidateCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = async (data: any) => {
      await redis.del(`cache:${pattern}`);
      return originalJson(data);
    };
    next();
  };
};
```

##### B. Optimizar Queries de Prisma
```typescript
// services/players.service.ts - Optimizado

// ❌ ANTES: Carga todo incluyendo datos no necesarios
export const getAllPlayers = async () => {
  return prisma.player.findMany({
    include: { statsHistory: true } // Toda la historia
  });
};

// ✅ DESPUÉS: Selecciona solo campos necesarios
export const getAllPlayers = async () => {
  return prisma.player.findMany({
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      position: true,
      subCategory: true,
      // Solo último stats record
      statsHistory: {
        take: 1,
        orderBy: { date: 'desc' },
        select: { stats: true }
      }
    }
  });
};

// ✅ Usar cursores para paginación en lugar de offset
export const getPlayersCursor = async (cursor?: string, limit = 20) => {
  return prisma.player.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { joinDate: 'desc' }
  });
};
```

##### C. Implementar Compresión
```typescript
// server.ts
import compression from 'compression';

// Compresión gzip para respuestas
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6 // Balance entre CPU y compresión
}));
```

##### D. Implementar Clustering
```typescript
// server.ts
import cluster from 'cluster';
import os from 'os';

const numCPUs = os.cpus().length;

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  console.log(`Primary ${process.pid} is running`);
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started on port ${PORT}`);
  });
}
```

##### E. Implementar Connection Pooling
```typescript
// config/database.ts
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// En prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Para migraciones
}
```

##### F. Implementar N+1 Query Prevention
```typescript
// Usar DataLoader para batch queries
import DataLoader from 'dataloader';

const playerLoader = new DataLoader(async (playerIds: string[]) => {
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    include: { statsHistory: true }
  });
  
  const playerMap = new Map(players.map(p => [p.id, p]));
  return playerIds.map(id => playerMap.get(id));
});

// Uso en resolvers
const team = await prisma.team.findUnique({ where: { id } });
const players = await playerLoader.loadMany(team.playerIds);
```

### 3.2 Frontend

#### 🔧 Optimizaciones Propuestas

##### A. Implementar Code Splitting
```typescript
// router.tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const PlayerProfile = lazy(() => import('./pages/PlayerProfile'));
const Tournaments = lazy(() => import('./pages/Tournaments'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/player/:id" element={<PlayerProfile />} />
        <Route path="/tournaments" element={<Tournaments />} />
      </Routes>
    </Suspense>
  );
}
```

##### B. Implementar Virtualización para Listas Largas
```typescript
// components/VirtualPlayerList.tsx
import { Virtualizer } from '@tanstack/react-virtual';

export function VirtualPlayerList({ players }: { players: Player[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: players.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Altura estimada por item
  });
  
  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${item.start}px)`,
            }}
          >
            <PlayerCard player={players[item.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

##### C. Optimizar Re-renders con Memoization
```typescript
// components/PlayerCard.tsx
import { memo, useMemo } from 'react';

interface PlayerCardProps {
  player: Player;
  onSelect: (id: string) => void;
}

export const PlayerCard = memo(function PlayerCard({ player, onSelect }: PlayerCardProps) {
  // Memoizar cálculos costosos
  const stats = useMemo(() => calculatePlayerStats(player), [player.statsHistory]);
  
  // Memoizar callbacks
  const handleClick = useCallback(() => {
    onSelect(player.id);
  }, [onSelect, player.id]);
  
  return (
    <div onClick={handleClick}>
      <h3>{player.name}</h3>
      <StatsDisplay stats={stats} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada
  return prevProps.player.id === nextProps.player.id &&
         prevProps.player.updatedAt === nextProps.player.updatedAt;
});
```

##### D. Implementar Service Worker para Caché Offline
```typescript
// sw.ts
const CACHE_NAME = 'club-manager-v1';
const STATIC_ASSETS = ['/index.html', '/assets/index.js', '/assets/index.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-first para assets estáticos
  if (event.request.destination === 'image' || 
      event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
  
  // Stale-while-revalidate para API
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
        return cached || fetchPromise;
      })
    );
  }
});
```

##### E. Optimizar Imágenes
```typescript
// components/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export function OptimizedImage({ src, alt, width, height }: OptimizedImageProps) {
  // Generar srcset para diferentes tamaños
  const srcSet = [320, 640, 960].map(w => {
    const url = new URL(src);
    url.searchParams.set('w', w.toString());
    return `${url.toString()} ${w}w`;
  }).join(', ');
  
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={`(max-width: 768px) 100vw, ${width}px`}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
    />
  );
}
```

##### F. Implementar Intersection Observer para Lazy Loading
```typescript
// hooks/useIntersectionObserver.ts
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        callback();
      }
    }, options);
    
    if (targetRef.current) {
      observer.observe(targetRef.current);
    }
    
    return () => observer.disconnect();
  }, [callback, options]);
  
  return targetRef;
}

// Uso para lazy loading
function PlayerList() {
  const [page, setPage] = useState(1);
  const loadMoreRef = useIntersectionObserver(() => {
    setPage(p => p + 1);
  });
  
  return (
    <>
      {players.map(player => <PlayerCard key={player.id} player={player} />)}
      <div ref={loadMoreRef}>Cargando más...</div>
    </>
  );
}
```

---

## 📊 4. MONITOREO Y LOGGING

### 4.1 Backend

```typescript
// middlewares/metrics.ts
import promClient from 'prom-client';

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const end = httpRequestDuration.startTimer();
  
  res.on('finish', () => {
    end({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    });
  });
  
  next();
};

// Endpoint para métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

### 4.2 Frontend

```typescript
// utils/performance.ts
export function measureComponentRender(ComponentName: string) {
  return function<T extends React.ComponentType<any>>(Component: T): T {
    return function WrappedComponent(props: any) {
      const startTime = performance.now();
      
      useEffect(() => {
        const duration = performance.now() - startTime;
        
        // Enviar a analytics
        if (duration > 16) { // Más de 1 frame (60fps)
          console.warn(`${ComponentName} render took ${duration}ms`);
          // analytics.track('slow_render', { component: ComponentName, duration });
        }
      });
      
      return createElement(Component, props);
    } as T;
  };
}

// Uso
export const SlowComponent = measureComponentRender('SlowComponent')(SlowComponentBase);
```

---

## ✅ 5. CHECKLIST DE IMPLEMENTACIÓN

### Prioridad Alta (Seguridad y Estabilidad)
- [ ] Implementar validación con Zod
- [ ] Centralizar manejo de errores
- [ ] Agregar rate limiting
- [ ] Implementar logging estructurado

### Prioridad Media (Rendimiento)
- [ ] Migrar DataContext a React Query
- [ ] Implementar paginación en backend
- [ ] Agregar compresión gzip
- [ ] Optimizar queries de Prisma

### Prioridad Baja (Developer Experience)
- [ ] Refactor a Feature-Based Structure
- [ ] Implementar barrel exports
- [ ] Agregar tests unitarios
- [ ] Documentar API con OpenAPI/Swagger

---

## 📚 RECURSOS RECOMENDADOS

### Librerías Sugeridas
- **Backend:**
  - `zod` - Validación de esquemas
  - `winston` - Logging
  - `express-rate-limit` - Rate limiting
  - `ioredis` - Cliente Redis
  - `dataloader` - Batch queries
  - `prom-client` - Métricas Prometheus

- **Frontend:**
  - `@tanstack/react-query` - Data fetching
  - `@tanstack/react-virtual` - Virtualización
  - `zustand` - State management (alternativa ligera a Context)
  - `vite-plugin-pwa` - Service Worker
  - `web-vitals` - Core Web Vitals

---

## 🎯 CONCLUSIÓN

El proyecto ya tiene una **base sólida** con:
- ✅ Separación clara de responsabilidades
- ✅ Estructura de API bien organizada
- ✅ Manejo de autenticación con refresh tokens
- ✅ Tipado TypeScript completo

Las mejoras propuestas se enfocan en:
1. **Escalabilidad** - Mejor estructura para crecimiento
2. **Mantenibilidad** - Código más testable y documentado
3. **Rendimiento** - Optimizaciones en frontend y backend
4. **Developer Experience** - Mejores herramientas y patrones

**Recomendación:** Implementar primero las mejoras de "Prioridad Alta" para fortalecer la base, luego continuar con optimizaciones de rendimiento.

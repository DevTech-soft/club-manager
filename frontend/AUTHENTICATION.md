# 🔐 Sistema de Autenticación Segura

## Resumen de la Implementación

Este proyecto ahora utiliza un **sistema de autenticación seguro** basado en **httpOnly cookies** para los tokens JWT, eliminando las vulnerabilidades de XSS asociadas con localStorage.

---

## 🎯 ¿Qué se Implementó?

### 1. **httpOnly Cookies para Tokens** ✅

Los tokens JWT (`accessToken` y `refreshToken`) se almacenan en **cookies httpOnly** que:
- ✅ **No son accesibles por JavaScript** (protección contra XSS)
- ✅ **Se envían automáticamente** en cada petición
- ✅ **Solo el servidor puede leerlas y modificarlas**

### 2. **localStorage Solo para Datos No Sensibles** ✅

localStorage ahora solo almacena:
- `isAuthenticated` - Boolean indicando si hay sesión
- `userType` - Tipo de usuario (admin, superadmin, coach)
- `coachInfo` - Información pública del coach (sin tokens)

### 3. **Refresh Automático de Tokens** ✅

El `apiClient` detecta automáticamente errores 401 y:
1. Intenta renovar el `accessToken` usando el `refreshToken`
2. Reintenta la petición original si el refresh fue exitoso
3. Dispara un logout automático si el refresh falla

### 4. **Verificación de Sesión al Cargar** ✅

Al cargar la aplicación, `AuthContext`:
1. Verifica si hay datos de sesión en localStorage
2. Valida la sesión con el servidor (`/api/auth/me`)
3. Hace logout local si la sesión no es válida

### 5. **Manejo de Expiración de Sesión** ✅

Si la sesión expira:
1. El `apiClient` dispara el evento `auth:session-expired`
2. El `AuthContext` escucha el evento y hace logout automático
3. El usuario es redirigido al login

---

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐         ┌──────────────────┐           │
│  │  AuthContext   │◄────────│   Components     │           │
│  │                │         │                  │           │
│  │ • login()      │         │ useAuth() hook   │           │
│  │ • logout()     │         │                  │           │
│  │ • verifySession│         └──────────────────┘           │
│  └────────┬───────┘                                         │
│           │                                                  │
│           ▼                                                  │
│  ┌────────────────┐         ┌──────────────────┐           │
│  │   api.ts       │◄────────│    apiClient     │           │
│  │                │         │                  │           │
│  │ • login()      │         │ • credentials:   │           │
│  │ • logout()     │         │   'include'      │           │
│  │ • refresh()    │         │ • Auto refresh   │           │
│  │ • me()         │         │   on 401         │           │
│  └────────┬───────┘         └──────────────────┘           │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
            │ HTTP Requests (with cookies)
            ▼
┌─────────────────────────────────────────────────────────────┐
│                          BACKEND                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /api/auth/login                                       │
│  ├─ Valida credenciales                                     │
│  ├─ Genera accessToken y refreshToken                       │
│  └─ Establece httpOnly cookies                              │
│                                                              │
│  POST /api/auth/logout                                      │
│  └─ Limpia cookies httpOnly                                 │
│                                                              │
│  POST /api/auth/refresh                                     │
│  ├─ Lee refreshToken de cookie                              │
│  ├─ Valida refreshToken                                     │
│  └─ Genera nuevo accessToken                                │
│                                                              │
│  GET /api/auth/me                                           │
│  ├─ Lee accessToken de cookie                               │
│  ├─ Valida token                                            │
│  └─ Retorna info del usuario                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Autenticación

### **Login**

```typescript
1. Usuario envía credenciales
   ↓
2. Frontend: api.login(user, pass)
   ↓
3. Backend:
   - Valida credenciales
   - Genera tokens JWT
   - Establece cookies httpOnly
   ↓
4. Frontend:
   - Recibe respuesta (sin tokens en body)
   - Guarda datos no sensibles en localStorage
   - Actualiza estado de AuthContext
```

### **Petición API con Token**

```typescript
1. Usuario hace una acción (ej: crear jugador)
   ↓
2. Frontend: api.createPlayer(data)
   ↓
3. apiClient envía request con credentials: 'include'
   ↓
4. Navegador envía cookies automáticamente
   ↓
5. Backend valida accessToken de la cookie
   ↓
6. Si válido: procesa petición
   Si 401: Frontend intenta refresh automático
```

### **Refresh Automático de Token**

```typescript
1. Petición recibe 401 (token expirado)
   ↓
2. apiClient.attemptRefreshToken()
   ↓
3. POST /api/auth/refresh (con refreshToken cookie)
   ↓
4. Backend valida refreshToken
   ↓
5. Si válido:
   - Genera nuevo accessToken
   - Actualiza cookie
   - Frontend reintenta petición original

6. Si inválido:
   - Dispara evento 'auth:session-expired'
   - AuthContext hace logout
   - Usuario redirigido a login
```

### **Logout**

```typescript
1. Usuario hace logout
   ↓
2. Frontend: api.logout()
   ↓
3. Backend: Limpia cookies httpOnly
   ↓
4. Frontend:
   - Limpia localStorage
   - Actualiza estado de AuthContext
   - Redirige a login
```

---

## 🛡️ Seguridad Implementada

### **Protección contra XSS (Cross-Site Scripting)**

**Antes**:
```typescript
// ❌ Token accesible por JavaScript
localStorage.setItem('token', 'eyJhbGc...');
const token = localStorage.getItem('token'); // Vulnerable a XSS
```

**Ahora**:
```typescript
// ✅ Token en httpOnly cookie (JavaScript no puede acceder)
// El navegador maneja todo automáticamente
// credentials: 'include' envía cookies en cada request
```

### **Protección contra CSRF (Cross-Site Request Forgery)**

Las cookies usan `SameSite` attribute (configurado en el backend) para prevenir CSRF.

### **Tokens con Expiración**

- **accessToken**: Corta duración (ej: 15 minutos)
- **refreshToken**: Larga duración (ej: 7 días)

Si el `accessToken` expira, se renueva automáticamente con el `refreshToken`.

---

## 📝 Uso en Componentes

### **Login**

```typescript
import { useAuth } from '../context/AuthContext';

function LoginComponent() {
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    const success = await login('admin', 'password');

    if (success) {
      // Login exitoso - tokens en cookies httpOnly
      navigate('/dashboard');
    } else {
      // Login fallido
      showError('Credenciales inválidas');
    }
  };

  return (
    <button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
    </button>
  );
}
```

### **Logout**

```typescript
import { useAuth } from '../context/AuthContext';

function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout(); // Limpia cookies del servidor y estado local
    navigate('/login');
  };

  return <button onClick={handleLogout}>Cerrar Sesión</button>;
}
```

### **Verificar Autenticación**

```typescript
import { useAuth } from '../context/AuthContext';

function ProtectedComponent() {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Bienvenido {userType}!</h1>
      {/* Contenido protegido */}
    </div>
  );
}
```

---

## ⚙️ Configuración del Backend

El backend ya está configurado correctamente con:

```typescript
// backend/src/controllers/auth.controller.ts
res.cookie('accessToken', result.tokens.accessToken, {
  httpOnly: true,  // No accesible por JavaScript
  secure: true,    // Solo HTTPS en producción
  sameSite: 'strict', // Protección CSRF
  maxAge: 15 * 60 * 1000 // 15 minutos
});

res.cookie('refreshToken', result.tokens.refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
});
```

---

## 🧪 Testing

### **Probar Login**

1. Iniciar backend y frontend
2. Ir a la página de login
3. Ingresar credenciales:
   - Admin: `admin` / `password`
   - SuperAdmin: `superadmin` / `superpassword`
   - Coach: documento del coach / contraseña
4. Verificar en DevTools → Application → Cookies:
   - `accessToken` presente ✅
   - `refreshToken` presente ✅
   - httpOnly: true ✅

### **Probar Refresh Automático**

1. Hacer login
2. Esperar a que expire el accessToken (15 minutos)
3. Hacer una acción (crear jugador, etc.)
4. Verificar en Network → XHR:
   - Se hace POST a `/api/auth/refresh` ✅
   - Se reintenta la petición original ✅

### **Probar Logout**

1. Hacer login
2. Hacer logout
3. Verificar en DevTools → Application → Cookies:
   - Cookies eliminadas ✅
4. Verificar en Application → localStorage:
   - Datos eliminados ✅

---

## 🚀 Próximos Pasos (Opcional)

1. **Rate Limiting**: Limitar intentos de login
2. **2FA**: Autenticación de dos factores
3. **Session Management**: Ver sesiones activas
4. **Remember Me**: Aumentar duración del refreshToken
5. **OAuth**: Login con Google, GitHub, etc.

---

## 📚 Referencias

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [httpOnly Cookies](https://owasp.org/www-community/HttpOnly)

---

## ✅ Checklist de Seguridad

- [x] Tokens en httpOnly cookies (no localStorage)
- [x] Refresh automático de accessToken
- [x] Verificación de sesión al cargar
- [x] Logout limpia cookies del servidor
- [x] credentials: 'include' en todas las peticiones
- [x] Manejo de sesión expirada
- [x] Sync de logout entre tabs
- [x] Solo datos no sensibles en localStorage
- [x] HTTPS en producción (configurar en deployment)
- [x] SameSite cookies (ya configurado en backend)

---

**Última actualización**: 2025-11-09
**Desarrollado con**: Claude Code 🤖

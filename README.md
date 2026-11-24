# ChatSell - Bocaditos By Andrea Sanchez

Base de la aplicación web de ChatSell. Usa Next.js con App Router, TypeScript y Tailwind CSS; Firebase se conserva para los datos y la autenticación previstos.

## Desarrollo local

Requiere Node.js 20.9 o posterior.

1. Instala dependencias con `npm install`.
2. Copia `.env.example` a `.env.local` y completa las credenciales de Firebase Admin y la configuración web pública del proyecto Firebase.
3. En Firebase Authentication, habilita el proveedor de correo y contraseña.
4. Para cada cuenta del panel, crea un documento `users/{uid}` en Firestore con `role` (`admin` o `editor`) y `active` (`true`).
5. Inicia el servidor con `npm run dev`.

Las cuatro variables `NEXT_PUBLIC_FIREBASE_*` se obtienen en la configuración del proyecto Firebase, en la app web. El `NEXT_PUBLIC_FIREBASE_PROJECT_ID` debe coincidir con `FIREBASE_PROJECT_ID`; en Vercel configura estos valores antes de desplegar.

El panel usa una cookie de sesión segura y valida el rol en el servidor. La consulta del documento de usuario es puntual; no se usan listeners `onSnapshot` ni actualizaciones en tiempo real.

## Panel de administración

- `/admin/products`: crear y editar productos, cambiar el orden y ocultar o activar artículos. La imagen se especifica mediante una URL.
- `/admin/leads`: revisar contactos y marcarlos como atendidos; solo Administradores.
- `/admin/users`: crear cuentas, asignar roles y activar o desactivar usuarios; solo Administradores. La contraseña temporal debe compartirse por un canal seguro.
- Los Editores solo pueden gestionar productos.
- Las imágenes se pueden pegar desde una URL o subir a Vercel Blob; las cargas requieren conectar Blob Storage y configurar `BLOB_READ_WRITE_TOKEN`.

Las operaciones usan Firebase Admin desde el servidor. La cuenta de servicio debe tener permisos IAM de Firestore en el proyecto configurado. No se debe abrir el acceso del navegador en `firestore.rules`.

El script inicial de Firestore se ejecuta con `npm run seed`. Para sobrescribir documentos existentes de productos o ajustes, usa `npm run seed:force`.

## Verificación

- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Despliegue en Vercel

Importa el repositorio en Vercel y configura `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY` en las variables de entorno del proyecto. No subas `.env.local` ni claves privadas al repositorio.

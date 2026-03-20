# Estado de Endpoints — Club de la Chamba

Referencia: `formato_servicios_club_de_la_chamba.pdf`

## Endpoints Completados

| # | Nombre | Método | URI | Estado |
|---|--------|--------|-----|--------|
| 1 | Registrar Usuario | POST | `/users/register` | ✅ Listo |
| 2 | Obtener perfil de usuario | GET | `/providers/{id}` | ✅ Listo |
| 3 | Crear Perfil de Proveedor | POST | `/providers/create` | ✅ Listo |
| 4 | Obtener perfil de proveedor | GET | `/providers/{id}` | ✅ Listo |
| 5 | Solicitar Servicio | POST | `/request/new` | ✅ Listo |
| 6 | Obtener detalles de solicitud | GET | `/request/{id}` | ✅ Listo |
| 7 | Listar solicitudes por cliente | GET | `/request/client/{client_id}` | ✅ Listo |
| 8 | Asignar Proveedor | PUT | `/request/{id}/assign` | ✅ Listo |
| 9 | Listar trabajos realizados por un proveedor | GET | `/request/provider/{provider_id}/jobs` | ✅ Listo |

## Endpoints Pendientes

| # | Nombre | Método | URI | Estado |
|---|--------|--------|-----|--------|
| 10 | Registrar Pago | POST | `/payments/process` | ❌ Pendiente |
| 11 | Consultar estado de un pago | GET | `/payments/request/{id}` | ❌ Pendiente |
| 12 | Publicar Reseña | POST | `/reviews/add` | ❌ Pendiente |
| 13 | Listar reseñas de un proveedor | GET | `/{provider_id}/reviews` | ❌ Pendiente |
| 14 | Listar proveedores por categoría | GET | `/categories/all` | ❌ Pendiente |

## Resumen

- **Total:** 14 endpoints
- **Completados:** 9
- **Pendientes:** 5

## Notas

- El endpoint #14 (Listar proveedores por categoría) usa la URI `/categories/all` en el PDF, pero en el backend ya existe `GET /categories/all` para listar categorías. Se necesita definir una URI diferente o agregar query params para filtrar proveedores por categoría.
- El endpoint #8 (Asignar Proveedor) usa `PUT /request/new` en el PDF — podría ser más adecuado usar `PUT /request/{id}/assign`.

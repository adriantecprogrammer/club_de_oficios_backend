# Estado de Endpoints — Club de la Chamba

Referencia: `formato_servicios_club_de_la_chamba.pdf`

## Endpoints Completados

| # | Nombre | Método | URI | Estado |
|---|--------|--------|-----|--------|
| 1 | Registrar Usuario | POST | `/users/register` | ✅ Listo |
| 2 | Obtener perfil de usuario | GET | `/users/{id}` | ✅ Listo |
| 3 | Crear Perfil de Proveedor | POST | `/providers/create` | ✅ Listo |
| 4 | Obtener perfil de proveedor | GET | `/providers/{id}` | ✅ Listo |
| 5 | Solicitar Servicio | POST | `/request/new` | ✅ Listo |
| 6 | Obtener detalles de solicitud | GET | `/request/{id}` | ✅ Listo |
| 7 | Listar solicitudes por cliente | GET | `/request/client/{client_id}` | ✅ Listo |
| 8 | Asignar Proveedor | PUT | `/request/{id}/assign` | ✅ Listo |
| 9 | Listar trabajos realizados por un proveedor | GET | `/request/provider/{provider_id}/jobs` | ✅ Listo |
| 10 | Registrar Pago | POST | `/payments/process` | ✅ Listo |
| 11 | Consultar estado de un pago | GET | `/payments/request/{id}` | ✅ Listo |
| 12 | Publicar Reseña | POST | `/reviews/add` | ✅ Listo |
| 13 | Listar reseñas de un proveedor | GET | `/reviews/{provider_id}` | ✅ Listo |
| 14 | Listar proveedores por categoría | GET | `/providers/by-category/{category_id}` | ✅ Listo |

## Endpoints Pendientes

_Ninguno - Todos los endpoints están implementados_

## Resumen

- **Total:** 14 endpoints
- **Completados:** 14
- **Pendientes:** 0

## Notas

- El endpoint #14 se implementó como `/providers/by-category/{category_id}` para evitar conflicto con `/categories/all` que lista categorías.
- El endpoint #8 (Asignar Proveedor) usa `PUT /request/{id}/assign`.
- Todos los endpoints están documentados con OpenAPI y disponibles en Swagger UI en `/swagger`.

-- Seed: datos de prueba
PRAGMA foreign_keys = ON;

-- 1. Usuarios
INSERT INTO "users" ("id", "first_name", "last_name", "email", "password_hash", "phone", "role", "avatar_url", "is_active", "created_at", "updated_at", "deleted_at") VALUES
('u1', 'Juan', 'Pérez', 'juan.perez@email.com', 'hash_seguro_123', '555-0101', 'client', 'https://avatar.url/juan.jpg', 1, '2023-01-10 08:00:00', '2023-01-10 08:00:00', NULL),
('u2', 'Ana', 'Gómez', 'ana.gomez@email.com', 'hash_seguro_456', '555-0102', 'client', 'https://avatar.url/ana.jpg', 1, '2023-01-11 09:00:00', '2023-01-11 09:00:00', NULL),
('u3', 'Carlos', 'Ruiz', 'carlos.ruiz@email.com', 'hash_seguro_789', '555-0103', 'provider', 'https://avatar.url/carlos.jpg', 1, '2023-01-12 10:00:00', '2023-01-12 10:00:00', NULL),
('u4', 'Lucía', 'Díaz', 'lucia.diaz@email.com', 'hash_seguro_012', '555-0104', 'provider', 'https://avatar.url/lucia.jpg', 1, '2023-01-13 11:00:00', '2023-01-13 11:00:00', NULL);

-- 2. Categorías
INSERT INTO "categories" ("id", "name", "description", "created_at") VALUES
('c1', 'Plomería', 'Reparación de tuberías y fugas.', '2023-01-01 00:00:00'),
('c2', 'Electricidad', 'Instalaciones y reparaciones eléctricas.', '2023-01-01 00:00:00'),
('c3', 'Limpieza', 'Limpieza general de hogares.', '2023-01-01 00:00:00');

-- 3. Perfiles de Proveedores
INSERT INTO "provider_profiles" ("id", "user_id", "bio", "experience_years", "verified", "rating_avg", "rating_count", "completed_jobs", "created_at", "updated_at") VALUES
('p1', 'u3', 'Experto en plomería con 10 años de experiencia.', 10, 1, 4.8, 25, 30, '2023-01-12 10:30:00', '2023-06-01 12:00:00'),
('p2', 'u4', 'Electricista certificada para hogares.', 5, 1, 4.5, 10, 15, '2023-01-13 11:30:00', '2023-05-20 15:00:00');

-- 4. Categorías por Proveedor
INSERT INTO "provider_categories" ("provider_id", "category_id") VALUES
('p1', 'c1'),
('p1', 'c3'),
('p2', 'c2');

-- 5. Solicitudes de Servicio
INSERT INTO "service_requests" ("id", "client_id", "provider_id", "category_id", "title", "description", "location_address", "location_lat", "location_lng", "status", "scheduled_at", "estimated_price", "final_price", "created_at", "updated_at", "completed_at") VALUES
('r1', 'u1', 'p1', 'c1', 'Fuga de agua en baño', 'Hay una fuga bajo el lavamanos.', 'Calle Falsa 123', 40.7128, -74.0060, 'completed', '2023-03-15 10:00:00', 50.0, 55.0, '2023-03-10 08:00:00', '2023-03-15 12:00:00', '2023-03-15 12:00:00'),
('r2', 'u2', 'p2', 'c2', 'Cambio de enchufes', 'Necesito cambiar 5 enchufes en la sala.', 'Av. Siempre Viva 742', 40.7130, -74.0065, 'completed', '2023-03-16 14:00:00', 30.0, 30.0, '2023-03-14 09:00:00', '2023-03-16 16:00:00', '2023-03-16 16:00:00');

-- 6. Conversaciones
INSERT INTO "conversations" ("id", "request_id", "client_id", "provider_id", "created_at") VALUES
('conv1', 'r1', 'u1', 'p1', '2023-03-10 08:05:00'),
('conv2', 'r2', 'u2', 'p2', '2023-03-14 09:05:00');

-- 7. Mensajes
INSERT INTO "messages" ("id", "conversation_id", "sender_id", "content", "read_at", "created_at") VALUES
('m1', 'conv1', 'u1', 'Hola, ¿podías venir el viernes?', '2023-03-10 08:10:00', '2023-03-10 08:05:00'),
('m2', 'conv1', 'u3', 'Sí, sin problema. Llego a las 10.', '2023-03-10 08:15:00', '2023-03-10 08:10:00'),
('m3', 'conv2', 'u2', '¿Traes tus propias herramientas?', '2023-03-14 09:10:00', '2023-03-14 09:05:00'),
('m4', 'conv2', 'u4', 'Sí, yo llevo todo lo necesario.', '2023-03-14 09:20:00', '2023-03-14 09:10:00');

-- 8. Pagos
INSERT INTO "payments" ("id", "request_id", "client_id", "provider_id", "amount", "platform_fee", "status", "payment_provider", "provider_reference_id", "created_at", "paid_at") VALUES
('pay1', 'r1', 'u1', 'p1', 55.0, 5.5, 'completed', 'stripe', 'ch_stripe_123', '2023-03-15 12:05:00', '2023-03-15 12:05:00'),
('pay2', 'r2', 'u2', 'p2', 30.0, 3.0, 'completed', 'paypal', 'pp_paypal_456', '2023-03-16 16:05:00', '2023-03-16 16:05:00');

-- 9. Reseñas
INSERT INTO "reviews" ("id", "request_id", "client_id", "provider_id", "rating", "comment", "created_at") VALUES
('rev1', 'r1', 'u1', 'p1', 5, 'Excelente servicio, muy rápido.', '2023-03-15 13:00:00'),
('rev2', 'r2', 'u2', 'p2', 4, 'Buen trabajo, pero llegó 10 min tarde.', '2023-03-16 17:00:00');

-- 10. Logros
INSERT INTO "achievements" ("id", "provider_id", "title", "description", "issued_at") VALUES
('ach1', 'p1', 'Experto en Agua', 'Completa 50 trabajos de plomería.', '2023-06-01 12:00:00'),
('ach2', 'p2', 'Rayo Eléctrico', 'Completa 20 trabajos sin quejas.', '2023-05-20 15:00:00');

# Proyecto Store

Plataforma multi-tenant de comercio (POS + inventario). Spring Boot 3 + React 19 + PostgreSQL.

## Arquitectura

```
┌────────────────────────────────────────────────────────┐
│                    CloudFront CDN                       │
│                    S3 (Static Site)                     │
├────────────────────────────────────────────────────────┤
│           ALB (Application Load Balancer)               │
├────────────────────────────────────────────────────────┤
│                  ECS Fargate                            │
│           Spring Boot 3 + Hibernate                     │
├────────────────────────────────────────────────────────┤
│              RDS PostgreSQL                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│   │ tenant1  │  │ tenant2  │  │ tenantN  │  schemas    │
│   └──────────┘  └──────────┘  └──────────┘            │
└────────────────────────────────────────────────────────┘
```

### Multi-tenancy

Separación por schema de PostgreSQL. Cada tenant tiene su propio schema (`tenant1`, `tenant2`, etc.) con sus tablas. Hibernate usa `MultiTenantConnectionProviderImpl` que ejecuta `SET search_path TO <tenant_id>` por conexión.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Vite, MUI 9, Redux Toolkit, Axios |
| Backend | Java 21, Spring Boot 3.4, Hibernate 6, Liquibase |
| DB | PostgreSQL 17+ |
| PWA | vite-plugin-pwa con Workbox |
| Tests | Vitest (frontend), JUnit 5 (backend) |

## Requisitos

- Node.js 20+
- Java 21+ con Maven
- PostgreSQL 17+
- Docker (opcional, para deploy)

## Setup Local

### 1. Base de datos

```sql
CREATE DATABASE store;
```

### 2. Backend

```bash
cd backend
mvn clean install -DskipTests
```

Configurar env vars (o usar defaults de `application.properties`):

```bash
# Opcional: cambiar defaults
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/store
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
export APP_CORS_ALLOWED_ORIGINS=http://localhost:5173
export SPRING_LIQUIBASE_ENABLED=true
```

Desde IntelliJ: Run `ProyectoStoreApplication`. El puerto default es 8080.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Crea `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

El frontend corre en `http://localhost:5173` con proxy automático al backend.

### 4. Verificar

- Frontend: http://localhost:5173
- Backend health: http://localhost:8080/actuator/health

## Deploy en AWS

### Backend (ECS Fargate)

```bash
cd backend

# Build imagen
docker build -t proyecto-store-backend .

# Taggear y pushear a ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag proyecto-store-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/proyecto-store-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/proyecto-store-backend:latest

# Crear task definition y servicio en ECS (via AWS Console o CDK)
```

### Frontend (S3 + CloudFront)

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://<bucket-name>/ --delete
```

### RDS PostgreSQL

Crear instancia RDS PostgreSQL 17 (t4g.small, 20GB gp3). Pasar endpoint por env var al backend.

### Variables de entorno en AWS

| Variable | Valor |
|----------|-------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<rds-endpoint>:5432/store` |
| `SPRING_DATASOURCE_USERNAME` | según configuración |
| `SPRING_DATASOURCE_PASSWORD` | según configuración (usar Secrets Manager) |
| `APP_CORS_ALLOWED_ORIGINS` | `https://<cloudfront-domain>` |

## Costos estimados AWS (~$60-70/mes)

| Recurso | Detalle | Costo/mes |
|---------|---------|-----------|
| RDS PostgreSQL | t4g.small, 20GB | ~$30 |
| ECS Fargate | 0.5 vCPU, 1GB RAM | ~$15 |
| ALB | Application Load Balancer | ~$18 |
| S3 + CloudFront | Frontend + CDN | ~$2 |
| Route53 | Dominio + zona | ~$1 |
| **Total** | | **~$66** |

## Estructura del proyecto

```
├── backend/
│   ├── src/main/java/com/store/
│   │   ├── application/          # Casos de uso (productos)
│   │   ├── domain/               # Modelo de dominio
│   │   ├── infrastructure/
│   │   │   ├── config/           # Liquibase, CORS, Persistencia
│   │   │   ├── db/               # Multi-tenancy, repositorios JPA
│   │   │   └── web/              # Controladores REST
│   │   └── ProyectoStoreApplication.java
│   ├── src/main/resources/
│   │   ├── db/changelog/         # Migrations (Liquibase XML)
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios + endpoints
│   │   ├── features/             # Redux slices + components
│   │   │   ├── inventory/        # CRUD productos + categorías
│   │   │   └── pos/              # Punto de venta + scanner
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── sdd/                          # SDD artifacts
└── README.md
```

## Licencia

Uso interno.

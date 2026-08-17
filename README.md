# CRM Frontend

Frontend de un CRM multi-tenant para gestión de leads, hecho con React + TypeScript. Pensado para equipos de venta con distintos roles (vendedor, supervisor, gerente y superadmin), cada uno con su propia vista sobre los datos.

Este repositorio es **solo el frontend**. Consume una API REST (Spring Boot) que se desarrolla por separado.

## Stack

- **React 19** + **TypeScript**
- **Vite 8** como bundler
- **React Router 7** para el ruteo
- **Tailwind CSS 4** para estilos
- **Axios** para las llamadas a la API
- **Recharts** para los gráficos de métricas

## Funcionalidades

**Leads**
- Alta, edición y ficha de detalle (drawer) de cada lead
- Cambio de estado con historial de cambios e interacciones registradas
- Estados: nuevo, en seguimiento, apto, no apto (con razón), en trámite, pendiente de confirmación, ganado, no interesado, otro
- Filtros por búsqueda, período, estado, origen y razón de no apto; orden por fecha, próximo contacto, costo o ganancia
- Vistas rápidas: leads de hoy, vencidos, y pendientes de confirmación
- Tabla en desktop / cards apiladas en mobile

**Pendientes de confirmación**
- Pantalla dedicada para leads en estado "pendiente" (ventas pendientes de pago), con fecha de confirmación y próximo recordatorio

**Equipo**
- Vista jerárquica y expandible del equipo a cargo (supervisor/gerente), con los leads y métricas de cada subordinado, asi como la de su equipo en caso
  de tenerlo.

**Métricas**
- Dashboard propio y de equipo, con selector de período (semana, mes, cuatrimestre, histórico) y mes/año de referencia, todo
  renderizado en tiempo real para la fiabilidad de la metrica consultada de forma retroactiva.
  
- Gráficos de torta por estado y por origen, tasas de conversión

**Balance**
- Ganancia y costo total del período, ganancia promedio por lead, cobertura de datos

**Administración** (superadmin)
- Gestión de tenants y usuarios, reseteo de contraseña y cambio de email

**Generales**
- Tema claro/oscuro
- Diseño responsive (sidebar tipo drawer en mobile)

## Estructura

```
src/
├── components/       # Sidebar, Layout, Drawer y modales de lead, Spinner
├── context/          # Auth y Theme
├── pages/            # Una página por ruta principal
├── services/         # Llamadas a la API (axios), un archivo por dominio
├── types/            # Tipos e interfaces compartidos
└── utils/            # Helpers de formateo
```

## Cómo correrlo

```bash
npm install
npm run dev
```

Necesita un backend corriendo (no incluido en este repo). Por defecto apunta a `http://localhost:8080`; para usar otra URL, crear un `.env` en la raíz:

```
VITE_API_URL=http://tu-backend:puerto
```

### Scripts

| Comando           | Qué hace                          |
|--------------------|------------------------------------|
| `npm run dev`      | Servidor de desarrollo             |
| `npm run build`    | Chequeo de tipos + build de producción |
| `npm run lint`     | Linter (ESLint)                    |
| `npm run preview`  | Sirve el build de producción localmente |

---

**Lucas Lettieri**

# Sistema de permisos y visibilidad

## Objetivo

Permitir diferentes niveles de acceso a usuarios para ver, editar, compartir y administrar contenido.

## Tipos de contenido

La app tendra dos grandes familias de datos:

1. Datos de usuario:
    - personajes.
    - notas privadas.
    - inventario personalizado.

2. Datos de reglas/contenido:
    - razas/especies.
    - clases.
    - subclases.
    - conjuros.
    - equipo.
    - trasfondos.
    - monstruos.

## Roles globales recomendados

```ts
type GlobalRole = 'user' | 'content_editor' | 'admin';
```

- `user`: puede crear sus personajes y contenido privado.
- `content_editor`: puede proponer o editar contenido compartido, segun permisos.
- `admin`: puede gestionar contenido global, usuarios y permisos.

## Roles de campana futuros

```ts
type CampaignRole = 'owner' | 'dm' | 'player' | 'viewer';
```

- `owner`: controla la campana.
- `dm`: puede editar notas, NPCs, sesiones y contenido de campana.
- `player`: ve informacion compartida y sus personajes.
- `viewer`: solo lectura.

## Visibilidad de contenido

```ts
type ContentVisibility = 'private' | 'campaign' | 'shared' | 'public';
```

- `private`: solo propietario.
- `campaign`: visible para miembros de una campana concreta.
- `shared`: visible para usuarios autorizados o grupo.
- `public`: visible para todos los usuarios de la app.

## Permisos por accion

```ts
type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'share' | 'admin';
```

## Tablas recomendadas

### profiles

- id.
- display_name.
- global_role.
- created_at.
- updated_at.

### content_sources

- id.
- code: `srd-5-1`, `user-private`, etc.
- name.
- license.
- attribution.
- is_system_source.

### content_items

Tabla generica opcional si se quiere unificar visibilidad.

- id.
- owner_user_id.
- content_type.
- source_id.
- visibility.
- created_at.
- updated_at.

### content_permissions

Para compartir elementos concretos.

- id.
- content_item_id.
- user_id nullable.
- campaign_id nullable.
- role.
- can_view.
- can_edit.
- can_delete.
- can_share.

## Reglas RLS recomendadas

### Contenido SRD

- Lectura para usuarios autenticados.
- Escritura solo admin o migraciones/seeds.

### Contenido privado

- Lectura solo owner.
- Escritura solo owner.

### Contenido de campana

- Lectura para miembros de campana.
- Escritura para owner/dm segun entidad.

### Contenido compartido

- Lectura si existe permiso explicito.
- Edicion si existe permiso explicito `can_edit`.

## Politica conceptual

Un usuario puede ver un contenido si:

1. Es contenido publico/SRD.
2. Es propietario.
3. Tiene permiso directo.
4. Pertenece a la campana asociada y la visibilidad es `campaign`.
5. Es admin.

Un usuario puede editar un contenido si:

1. Es propietario y el contenido no es de sistema.
2. Tiene permiso `can_edit`.
3. Es admin.

## Recomendacion para MVP

Implementar primero:

- `profiles.global_role`.
- `content_source` en cada tabla de contenido.
- `owner_user_id` en contenido manual.
- `visibility` en contenido manual.

Dejar para despues:

- Permisos por usuario.
- Permisos por campana.
- Roles de campana.

## MVP de permisos

```txt
SRD:
  todos los usuarios autenticados pueden ver
  nadie lo edita desde UI

Privado:
  solo propietario ve/edita

Admin:
  puede ver/editar todo
```

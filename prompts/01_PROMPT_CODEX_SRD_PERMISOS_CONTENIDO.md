Actua como desarrollador senior fullstack especializado en SvelteKit, TypeScript, Supabase, PostgreSQL, RLS, arquitectura frontend escalable, Zod, Vitest y Playwright.

Proyecto local:

G:\dev\projects\app-dnd

Objetivo:

Ampliar el proyecto App DnD para soportar contenido SRD 5.1 reutilizable, contenido manual privado, permisos de acceso y carga/importacion de contenido desde archivos estructurados.

Contexto:

- El proyecto ya existe.
- No recrees el proyecto desde cero.
- Usa SvelteKit + TypeScript + pnpm.
- Mantener `pnpm check`, `pnpm lint`, `pnpm test` y `pnpm build` funcionando.
- No instales dependencias sin justificar.
- No implementes todo de golpe.
- Trabaja por iteraciones pequenas.

Documentacion que debes leer primero:

- docs/rules/00_LEEME.md
- docs/rules/01_SRD_5_1_CONTENIDO_IMPLEMENTABLE.md
- docs/rules/02_COMPARATIVA_SRD_5_1_MANUAL_JUGADOR.md
- docs/rules/03_MODELO_CONTENIDO_MANUAL.md
- docs/rules/04_SISTEMA_PERMISOS_Y_VISIBILIDAD.md
- docs/rules/05_GUIA_CARGA_CONTENIDO_DESDE_ARCHIVOS.md
- docs/rules/06_MODELO_DATOS_CONTENIDO_Y_PERMISOS.md
- docs/rules/07_ROADMAP_SRD_CONTENIDO_PERMISOS.md

Instrucciones principales:

1. Analiza el repo actual antes de modificar nada.
2. Comprueba estructura de carpetas, package.json, scripts y tests.
3. Propón un plan breve para la siguiente iteracion.
4. Implementa solo la iteracion acordada.
5. No avances a Supabase/Auth si la iteracion actual es solo documentacion/tipos.
6. No copies contenido protegido del Manual del Jugador.
7. Usa contenido SRD 5.1 solo con atribucion y separacion de fuente.
8. Implementa capacidad para contenido manual privado.
9. Disena permisos desde el principio, pero implementa primero MVP simple.
10. Usa Zod para validar datos importados.
11. Mantén la logica de dominio separada de componentes Svelte.
12. Anade o ajusta tests cuando crees logica nueva.

Modelo conceptual clave:

```ts
type ContentSource = 'srd-5-1' | 'srd-5-2' | 'user-private' | 'homebrew';
type ContentVisibility = 'private' | 'campaign' | 'shared' | 'public';
type GlobalRole = 'user' | 'content_editor' | 'admin';
type CampaignRole = 'owner' | 'dm' | 'player' | 'viewer';
```

Sistema de contenido:

- El contenido SRD es contenido de sistema.
- El contenido SRD debe ser de solo lectura desde UI normal.
- El usuario puede duplicar contenido SRD para crear una copia privada/homebrew.
- El contenido privado pertenece a un usuario.
- El contenido privado puede tener visibilidad privada, de campana o compartida en el futuro.

Primera tarea recomendada:

Implementar Iteracion 0 o 1, segun el estado actual del repo.

Iteracion 0:

- Copiar documentos a `docs/`.
- Crear carpetas:
    - data/srd-5-1
    - data/private-content-templates
- Crear plantillas JSON.
- No instalar dependencias.
- No tocar base de datos todavia.
- Ejecutar validaciones.

Iteracion 1:

- Crear tipos TypeScript para contenido y permisos.
- Crear schemas Zod si Zod ya esta instalado; si no, proponer instalacion antes.
- Crear tests unitarios para validacion.
- No implementar UI todavia.

Resultado esperado:

Al finalizar, informa:

- Archivos creados/modificados.
- Decisiones tomadas.
- Comandos ejecutados o que debo ejecutar.
- Resultado esperado de `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`.
- Siguiente paso recomendado.

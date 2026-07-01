# Guia para cargar contenido desde archivos del proyecto

## Objetivo

Permitir incluir contenido estructurado en carpetas del proyecto y cargarlo en la aplicacion o en la base de datos.

## Enfoque recomendado

Usar archivos JSON versionados para contenido SRD y plantillas privadas.

Estructura recomendada:

```txt
data/
  srd-5-1/
    species.json
    classes.json
    subclasses.json
    backgrounds.json
    spells.json
    equipment.json
    feats.json
    conditions.json

  private-content-templates/
    species.template.json
    subclass.template.json
    background.template.json
    spell.template.json
    feat.template.json
    equipment.template.json
```

## Regla importante

No subir al repositorio publico contenido privado protegido que no tengas derecho a compartir. Si el repositorio es privado y el contenido es de uso personal, aun asi conviene mantenerlo separado y marcado como `user-private`.

## Formato base recomendado

```json
{
	"schemaVersion": 1,
	"source": "user-private",
	"contentType": "spell",
	"items": [
		{
			"slug": "ejemplo-conjuro-privado",
			"name": "Ejemplo de conjuro privado",
			"level": 1,
			"school": "evocation",
			"summary": "Resumen breve para la app.",
			"description": "Descripcion privada opcional.",
			"mechanics": [{ "type": "note", "text": "Mecanica no automatizada aun." }],
			"visibility": "private"
		}
	]
}
```

## Flujo de carga manual recomendado

### Opcion A - Importar desde UI

1. Usuario abre `/app/content/import`.
2. Selecciona archivo JSON.
3. La app valida con Zod.
4. Muestra previsualizacion.
5. Usuario confirma.
6. Se insertan datos como `user-private`.

Ventajas:

- Seguro.
- No necesita scripts.
- Ideal para usuario final.

### Opcion B - Script local de seed

1. Guardar archivos JSON en `data/`.
2. Crear script `scripts/import-content.ts`.
3. Leer JSON.
4. Validar con Zod.
5. Insertar en Supabase usando credenciales seguras.

Ventajas:

- Bueno para contenido inicial.
- Rapido para desarrollo.

Precaucion:

- No usar service_role en frontend.
- Si se usa service_role en script local, no subir la key.

## Validacion con Zod

Crear schemas por tipo:

```txt
src/lib/schemas/content/
  common-content.schema.ts
  species.schema.ts
  class.schema.ts
  spell.schema.ts
  background.schema.ts
  feat.schema.ts
  equipment.schema.ts
```

## Reglas para importar contenido faltante del Manual

1. Crear un archivo por categoria.
2. Marcar `source = "user-private"`.
3. Marcar `visibility = "private"`.
4. Incluir solo lo necesario para tu uso privado.
5. No mezclar contenido privado con SRD.
6. No publicarlo en un repositorio publico.
7. Si una regla no esta modelada, usar `mechanics: [{ type: "note", text: "..." }]`.

## Ejemplo de plantilla de subclase privada

```json
{
	"schemaVersion": 1,
	"source": "user-private",
	"contentType": "subclass",
	"items": [
		{
			"slug": "subclase-privada-ejemplo",
			"name": "Subclase privada ejemplo",
			"classSlug": "fighter",
			"summary": "Resumen breve.",
			"features": [
				{
					"level": 3,
					"name": "Rasgo de ejemplo",
					"summary": "Resumen del rasgo.",
					"mechanics": [{ "type": "note", "text": "Pendiente de automatizar." }]
				}
			],
			"visibility": "private"
		}
	]
}
```

## Recomendacion para Codex

Pedir a Codex que implemente primero:

1. Tipos TypeScript.
2. Zod schemas.
3. Carpetas `data/`.
4. Plantillas JSON vacias.
5. Tests de validacion.

Despues:

1. Importador desde UI.
2. Seed local.
3. Insercion en Supabase.

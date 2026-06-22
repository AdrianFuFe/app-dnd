# Sistema para anadir contenido manual

## Objetivo

Permitir que el usuario anada contenido que no venga precargado desde SRD:

- Razas/especies.
- Subrazas.
- Clases.
- Subclases.
- Trasfondos.
- Dotes.
- Conjuros.
- Equipo.
- Rasgos.
- Monstruos.
- Objetos magicos.

## Principios

1. Todo contenido debe tener propietario.
2. Todo contenido debe tener fuente.
3. Todo contenido debe tener visibilidad.
4. El motor de reglas debe leer mecanicas estructuradas, no texto largo.
5. El texto descriptivo sirve para consulta, no para calculo automatico.

## Campos comunes

Todas las entidades de contenido deberian compartir:

```ts
type ContentBase = {
	id: string;
	ownerUserId: string | null;
	source: 'srd-5-1' | 'srd-5-2' | 'user-private' | 'homebrew';
	visibility: 'private' | 'campaign' | 'shared' | 'public';
	name: string;
	slug: string;
	summary: string | null;
	description: string | null;
	mechanics: GameMechanic[];
	createdAt: string;
	updatedAt: string;
};
```

## Recomendacion de UI

Crear una seccion futura:

```txt
/app/content
  /species
  /classes
  /subclasses
  /backgrounds
  /spells
  /feats
  /equipment
  /monsters
```

Cada pantalla debe permitir:

- Ver contenido disponible.
- Filtrar por fuente.
- Filtrar por visibilidad.
- Crear contenido manual.
- Editar contenido propio.
- Duplicar contenido SRD como copia privada modificable.
- Desactivar contenido.

## Duplicar en vez de editar SRD

El contenido SRD precargado deberia ser de solo lectura para usuarios normales.

Si el usuario quiere modificar algo SRD:

1. Pulsar "Duplicar".
2. Crear copia con `source = 'homebrew'` o `source = 'user-private'`.
3. Editar la copia.

## Estructura de mecanicas

Ejemplo generico:

```ts
type Ability = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

type GameMechanic =
	| { type: 'ability_bonus'; ability: Ability; value: number }
	| { type: 'choose_ability_bonus'; count: number; value: number; allowed?: Ability[] }
	| { type: 'speed'; value: number }
	| { type: 'darkvision'; range: number }
	| { type: 'language'; mode: 'fixed'; language: string }
	| { type: 'choose_language'; count: number }
	| {
			type: 'proficiency';
			proficiencyType: 'skill' | 'weapon' | 'armor' | 'tool' | 'saving_throw';
			value: string;
	  }
	| {
			type: 'choose_proficiency';
			proficiencyType: 'skill' | 'tool';
			count: number;
			options: string[];
	  }
	| { type: 'resistance'; damageType: string }
	| { type: 'spell_grant'; spellId: string; ability?: Ability }
	| { type: 'resource'; name: string; maxFormula: string; resetOn: 'short_rest' | 'long_rest' }
	| { type: 'note'; text: string };
```

## Flujo para crear contenido manual

1. Elegir tipo de contenido.
2. Rellenar datos basicos.
3. Anadir mecanicas estructuradas.
4. Anadir descripcion privada opcional.
5. Elegir visibilidad.
6. Guardar.
7. Usar en creacion/edicion de personaje.

## Validaciones recomendadas

- `name` obligatorio.
- `slug` unico por owner + tipo + source.
- `source` obligatorio.
- `visibility` obligatoria.
- `mechanics` debe validar con Zod.
- El usuario solo puede editar contenido propio salvo rol admin.

## Importante

El sistema debe permitir crear contenido manual sin romper el motor. Si una mecanica no esta estructurada todavia, guardarla como `note` o texto descriptivo y no automatizarla hasta mas adelante.

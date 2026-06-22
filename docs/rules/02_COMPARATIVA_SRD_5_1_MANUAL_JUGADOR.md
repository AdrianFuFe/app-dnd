# Comparativa resumida - SRD 5.1 vs Manual del Jugador 5e

## Objetivo

Saber que puede incluirse como contenido base reutilizable y que contenido faltaria si se usa solo SRD 5.1.

## Resumen ejecutivo

El SRD 5.1 es suficiente para construir el sistema de reglas y una aplicacion funcional de personajes DnD 5e. Sin embargo, no contiene todo el contenido editorial del Manual del Jugador.

La principal diferencia no esta en la estructura del juego, sino en la cantidad de opciones de catalogo:

- Mas subclases en el Manual.
- Mas trasfondos en el Manual.
- Mas conjuros en el Manual.
- Mas textos explicativos y descriptivos en el Manual.
- Mas tablas de apoyo, ejemplos y contenido narrativo en el Manual.

## Coincidencias principales

### Sistema central

Coinciden o son compatibles:

- Seis caracteristicas.
- Modificadores.
- Competencia.
- Habilidades.
- Tiradas de salvacion.
- Niveles.
- Clases base.
- Razas/especies base.
- Combate central.
- Acciones.
- Dano y curacion.
- Descansos.
- Lanzamiento de conjuros.
- Equipo basico.
- Condiciones.

### Utilidad para la app

Esto permite implementar:

- Creador de personaje.
- Ficha editable.
- Calculos automaticos.
- Gestion de rasgos.
- Gestion de inventario.
- Gestion de conjuros.
- Motor de reglas progresivo.

## Diferencias por categoria

| Categoria        | SRD 5.1                   | Manual del Jugador 5e                  | Impacto en la app |
| ---------------- | ------------------------- | -------------------------------------- | ----------------- |
| Reglas base      | Incluidas                 | Incluidas con mas explicacion          | Bajo              |
| Razas/especies   | Incluye base suficiente   | Incluye textos y presentacion completa | Medio             |
| Subrazas         | Incluye varias            | Incluye presentacion completa          | Medio             |
| Clases           | Incluye las clases base   | Incluye clases base completas          | Bajo              |
| Subclases        | Normalmente una por clase | Varias por clase                       | Alto              |
| Trasfondos       | Muy limitado              | Mas variedad                           | Alto              |
| Dotes            | Muy limitado              | Mas contenido opcional                 | Medio/alto        |
| Conjuros         | Seleccion SRD             | Lista mas amplia                       | Alto              |
| Equipo           | Base suficiente           | Mas tablas/contexto                    | Medio             |
| Lore y ejemplos  | Limitado                  | Amplio                                 | Bajo para MVP     |
| Arte y narrativa | No relevante para app     | Amplio                                 | No implementar    |

## Contenido que probablemente faltara si solo usas SRD 5.1

### 1. Subclases adicionales

El SRD permite modelar subclases, pero no trae todas las opciones del Manual. La app debe soportar multiples subclases por clase aunque inicialmente solo se precargue una por clase.

Accion recomendada:

- Crear tabla `subclasses`.
- Precargar subclases SRD.
- Permitir subclases privadas/manuales.

### 2. Trasfondos adicionales

El SRD tiene cobertura limitada. Para replicar tu experiencia con el Manual, necesitaras crear trasfondos privados manualmente.

Accion recomendada:

- Crear `backgrounds`.
- Crear `background_traits` o campo JSON `personality_tables`.
- Permitir entrada manual desde UI o archivos.

### 3. Hechizos no SRD

Muchos conjuros del Manual pueden no estar en SRD. La app debe distinguir conjuros SRD de conjuros introducidos manualmente.

Accion recomendada:

- Crear `spells` con campo `source`.
- Permitir importacion desde JSON/CSV local.
- Permitir descripcion privada visible solo para el propietario o grupo autorizado.

### 4. Dotes no SRD

El sistema debe soportar dotes, aunque el contenido base sea reducido.

Accion recomendada:

- Crear `feats`.
- Crear `character_feats`.
- Implementar dotes despues del MVP.

### 5. Texto descriptivo completo

No es necesario para el motor de reglas. La app puede funcionar con resumen, etiquetas y mecanicas estructuradas.

Accion recomendada:

- Separar `summary` de `private_notes`.
- No depender de texto largo para calcular reglas.

## Estrategia recomendada

1. Implementar entidades y reglas genericas.
2. Precargar contenido SRD como base.
3. Marcar todo contenido con `source`.
4. Permitir crear contenido privado.
5. Permitir importar archivos locales.
6. No bloquear el desarrollo esperando completar todo el catalogo.

## Niveles de contenido

```ts
type ContentSource = 'srd-5-1' | 'srd-5-2' | 'user-private' | 'homebrew';

type ContentVisibility = 'private' | 'campaign' | 'shared' | 'public';
```

- `srd-5-1`: contenido base reutilizable.
- `user-private`: contenido introducido por el usuario para uso privado.
- `homebrew`: contenido personalizado propio.
- `public`: solo si en el futuro decides publicar contenido propio o SRD con atribucion.

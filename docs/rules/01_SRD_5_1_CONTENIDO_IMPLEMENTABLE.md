# SRD 5.1 - Contenido implementable en la aplicacion

## Objetivo

Definir que contenido del SRD 5.1 se puede utilizar como base de datos inicial y como sistema de reglas para la aplicacion.

## Fuente principal

SRD 5.1 en espanol, publicado por Wizards of the Coast bajo Creative Commons Atribucion 4.0.

## Categorias de contenido utiles para la app

### 1. Reglas base de personaje

Usar como motor de dominio:

- Caracteristicas: fuerza, destreza, constitucion, inteligencia, sabiduria y carisma.
- Modificador de caracteristica.
- Bonificador de competencia por nivel.
- Tiradas de salvacion.
- Habilidades.
- Competencias.
- Ventaja y desventaja.
- Inspiracion.
- Niveles 1 a 20.
- Experiencia, si se quiere soportar progresion por XP.
- Descansos corto/largo.

### 2. Flujo de creacion de personaje

La aplicacion debe soportar estos pasos:

1. Elegir origen/especie/raza disponible.
2. Elegir clase.
3. Elegir trasfondo.
4. Determinar puntuaciones de caracteristica.
5. Calcular modificadores.
6. Elegir competencias permitidas.
7. Elegir equipo inicial o equipo manual.
8. Elegir conjuros si la clase lo permite.
9. Revisar ficha final.

### 3. Razas/especies SRD 5.1

Modelo a soportar:

- Raza/especie.
- Subraza/subtipo opcional.
- Aumentos de caracteristica.
- Edad, tamano, velocidad.
- Idiomas.
- Rasgos raciales.
- Competencias otorgadas.
- Sentidos especiales.
- Resistencias.
- Rasgos activos/pasivos.

Contenido SRD base a incluir como datos estructurados:

- Enano.
- Elfo.
- Mediano.
- Humano.
- Dragonborn.
- Gnomo.
- Semielfo.
- Semiorco.
- Tiefling.

Subopciones habituales en SRD 5.1 a modelar:

- Enano de las colinas.
- Enano de las montanas.
- Alto elfo.
- Elfo de los bosques.
- Elfo oscuro.
- Mediano piesligeros.
- Mediano robusto.
- Gnomo de los bosques.
- Gnomo de las rocas.

Nota: Codex debe verificar los nombres exactos en la fuente SRD usada antes de crear seeds definitivos.

### 4. Clases SRD 5.1

Modelo a soportar:

- Clase.
- Dado de golpe.
- Caracteristica principal.
- Competencias con armaduras.
- Competencias con armas.
- Competencias con herramientas.
- Tiradas de salvacion competentes.
- Seleccion de habilidades.
- Equipo inicial.
- Tabla de progresion por nivel.
- Rasgos de clase por nivel.
- Reglas de lanzamiento de conjuros si aplica.
- Subclase/arquetipo.

Clases base SRD 5.1:

- Barbaro.
- Bardo.
- Clerigo.
- Druida.
- Guerrero.
- Monje.
- Paladin.
- Explorador.
- Picaro.
- Hechicero.
- Brujo.
- Mago.

Subclases/arquetipos SRD 5.1 a soportar como contenido base:

- Barbaro: senda del berserker.
- Bardo: colegio del saber.
- Clerigo: dominio de la vida.
- Druida: circulo de la tierra.
- Guerrero: campeon.
- Monje: camino de la mano abierta.
- Paladin: juramento de devocion.
- Explorador: cazador.
- Picaro: ladron.
- Hechicero: linaje draconico.
- Brujo: patron infernal.
- Mago: escuela de evocacion.

### 5. Trasfondos

SRD 5.1 contiene una base limitada de trasfondos y reglas para personalizarlos.

Modelo a soportar:

- Nombre.
- Competencias en habilidades.
- Competencias con herramientas.
- Idiomas.
- Equipo.
- Rasgo de trasfondo.
- Rasgos de personalidad.
- Ideales.
- Vinculos.
- Defectos.
- Fuente.
- Visibilidad.

Contenido inicial recomendado:

- Precargar solo trasfondos SRD disponibles.
- Permitir crear trasfondos manuales privados.
- Permitir plantillas de trasfondo homebrew.

### 6. Equipo

Modelo a soportar:

- Armas.
- Armaduras.
- Escudos.
- Equipo aventurero.
- Herramientas.
- Monturas y vehiculos, si se implementa mas adelante.
- Monedas.

Propiedades necesarias:

- Nombre.
- Categoria.
- Coste.
- Peso.
- Propiedades.
- Dano.
- Tipo de dano.
- Alcance.
- CA base o bonus, si aplica.
- Requisitos, si aplica.
- Fuente.

### 7. Conjuros

Modelo a soportar:

- Nombre.
- Nivel.
- Escuela.
- Tiempo de lanzamiento.
- Alcance.
- Componentes.
- Materiales.
- Duracion.
- Concentracion.
- Ritual.
- Clases que pueden lanzarlo.
- Descripcion/resumen.
- Efectos mecanicos estructurados, cuando sea posible.
- Fuente.

Para MVP, basta con permitir guardar conjuros manualmente y asociarlos a personajes. Despues se pueden precargar conjuros SRD.

### 8. Condiciones

Modelo a soportar:

- Nombre.
- Resumen.
- Efectos mecanicos.
- Fuente.

Usar condiciones como datos de referencia para futuras pantallas de combate y estados temporales de personaje.

### 9. Monstruos

No prioritario para MVP de jugador, pero util para modo master futuro.

Modelo a soportar:

- Nombre.
- Tipo.
- Tamano.
- Alineamiento.
- CA.
- PG.
- Velocidad.
- Caracteristicas.
- Salvaciones.
- Habilidades.
- Resistencias.
- Inmunidades.
- Sentidos.
- Idiomas.
- Desafio.
- Acciones.
- Rasgos.
- Fuente.

## Recomendacion de implementacion

No guardar el contenido SRD como strings sueltos dispersos. Usar tablas normalizadas y/o JSON estructurado para mecanicas.

Ejemplo conceptual:

```ts
type GameMechanic =
	| { type: 'ability_bonus'; ability: Ability; value: number }
	| { type: 'speed'; value: number }
	| { type: 'proficiency'; proficiencyType: string; options?: string[] }
	| { type: 'resistance'; damageType: string }
	| { type: 'language'; mode: 'fixed' | 'choose'; values?: string[]; count?: number }
	| { type: 'spellcasting'; ability: Ability }
	| { type: 'feature'; featureId: string };
```

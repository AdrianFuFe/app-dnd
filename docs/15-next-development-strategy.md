# Siguiente estrategia de desarrollo

## Objetivo

Este documento redefine la siguiente fase de `app-dnd` a partir de tres entradas:

- lo que ya existe en el proyecto
- la estrategia anterior
- el nuevo alcance funcional deseado para producto

La idea principal es simple: construir una base solida, priorizando primero las funcionalidades nucleares y dejando preparadas las decisiones que afectaran a futuras ampliaciones.

## Punto de partida

Actualmente el proyecto ya cuenta con una base valida sobre la que seguir creciendo:

- autenticacion y sesion con Supabase
- CRUD principal de personajes
- modelo inicial de roles
- contenido estructurado SRD inicial
- contenido privado y compartido
- RLS y permisos base
- validacion y pruebas utiles para iterar

Esto significa que el siguiente paso no es "anadir cosas sin mas", sino ordenar bien el producto para evitar retrabajo.

## Nuevo norte de producto

La aplicacion debe evolucionar hacia estos bloques funcionales:

1. creacion de personajes
2. galeria de personajes
3. creacion y gestion de entidades de juego
4. registro, login y configuracion de usuario
5. gestion de contenidos, usuarios, roles y revisiones

El criterio de priorizacion no debe ser solo complejidad tecnica, sino valor de producto y dependencia entre bloques.

## Vision funcional consolidada

### 1. Creacion de personajes

Es la funcionalidad central del producto y debe ser el foco principal de la siguiente gran fase.

La aplicacion debe acabar ofreciendo dos modos:

- `guided`
- `custom`

#### Modo guiado

Debe ser la primera implementacion real de referencia.

Objetivo:

- crear personajes siguiendo las reglas de DND 2014 SRD
- automatizar al maximo lo derivado de raza, subraza, clase, subclase, nivel, caracteristicas y rasgos
- reducir errores manuales
- ofrecer un flujo comprensible paso a paso

Condiciones importantes:

- en la primera version solo se soporta `dnd-2014-srd`
- mas adelante podran existir otros sistemas o versiones
- aunque al principio solo haya un sistema, el diseno debe dejar preparado un futuro selector de sistema

#### Modo custom

Debe existir como objetivo de arquitectura, pero no como prioridad de implementacion inmediata.

Objetivo:

- partir del flujo guiado
- permitir valores fuera de las normas automatizadas
- convivir con contenido homebrew
- permitir seleccionar o crear sobre la marcha entidades propias del usuario

Ejemplos:

- razas custom
- subrazas custom
- clases y subclases custom
- hechizos, habilidades, trasfondos u objetos custom

Principio clave:

- el modo guiado se implementa primero
- el modo custom se deja para una fase posterior
- pero el modo guiado no debe cerrarnos puertas de cara al modo custom

En otras palabras: la arquitectura del creador debe separar bien:

- reglas automatizadas
- datos base del sistema
- overrides manuales
- contenido canon frente a contenido custom

### 2. Galeria de personajes

Debe consolidarse como la vista principal del usuario autenticado.

Capacidades esperadas:

- ver lista de personajes
- acceder al detalle
- editar
- borrar

Decision de UX obligatoria:

- cualquier eliminacion debe usar doble confirmacion

Esta parte ya tiene base, pero debe revisarse para asegurar que encaja con el flujo futuro del creador de personajes.

### 3. Creacion de entidades

La aplicacion debe permitir crear entidades de juego como:

- raza
- subraza
- clase
- subclase
- hechizo
- habilidad
- objeto
- trasfondo
- otras entidades que se incorporen despues

Este bloque no debe ir antes del creador guiado, pero si debe quedar contemplado desde ya porque afecta al modelo de datos y a la estrategia de contenidos.

Cada entidad deberia poder asociarse a una version o sistema, por ejemplo:

- `srd5.1-2014`
- `dnd-5e-2014`
- `custom`

Esto permitira en el futuro:

- soportar multiples reglas o ediciones
- distinguir contenido canon y contenido libre
- alimentar correctamente el creador guiado segun el sistema activo

### 4. Contenidos canon y custom

El producto necesita una distincion clara entre tipos de contenido.

#### Contenido canon

Caracteristicas:

- compartido
- estructurado
- asociado a una version o sistema
- apto para alimentar automatizaciones del creador guiado

#### Contenido custom

Caracteristicas:

- creado por usuarios
- puede ser privado o publico
- puede basarse en contenido canon o ser libre

#### Flujo de revision

Tambien hace falta un estado intermedio para propuestas de canon.

Escenario recomendado:

- un usuario normal crea contenido
- si ese contenido es personal, se guarda como `custom`
- si se propone como contenido compartido tipo canon, pasa a estado `in_review`
- un usuario con privilegios suficientes lo revisa
- tras la revision, ese contenido puede:
  - aprobarse como contenido compartido
  - corregirse
  - rechazarse como canon y quedarse como custom

Este flujo encaja bien con los roles actuales:

- `user`
- `content_editor`
- `admin`

### 5. Gestion y administracion

La aplicacion tambien debe tener superficies de gestion para monitorizar y mantener el sistema.

Vistas objetivo:

- vista de permisos y roles
- vista de usuarios registrados
- vistas de gestion para cada tipo de contenido
- vista de revision de contenidos enviados por usuarios

Esto no debe ser la siguiente prioridad de implementacion, pero si debe entrar ya en la estrategia porque condiciona:

- el modelo de estados del contenido
- la visibilidad por rol
- las acciones permitidas por vista

## Relectura de roles

La propuesta funcional nueva encaja razonablemente bien con los roles actuales del proyecto:

- `user`
- `content_editor`
- `admin`

La interpretacion recomendada ahora es esta.

### `user`

Acceso a:

- registro y login
- configuracion de usuario
- creacion de personajes
- gestion de sus personajes
- consulta de contenido permitido
- contenido custom propio

No deberia tener acceso a:

- vistas administrativas
- aprobacion de contenido canon
- gestion global de usuarios o permisos

### `content_editor`

Acceso a todo lo de `user`, mas:

- creacion de contenido estructurado necesario para nutrir la aplicacion
- acceso a zonas restringidas de contenido
- revision basica o mantenimiento de contenidos segun el alcance final que se decida

Punto que hay que cerrar:

- si `content_editor` puede aprobar canon
- o si solo puede preparar, editar y revisar sin publicacion final

### `admin`

Acceso total:

- gestion de usuarios
- gestion de roles y permisos
- gestion global de contenidos
- revision y aprobacion final
- operaciones sensibles

### Decision de arquitectura recomendada

Mantener de momento estos tres roles como contrato funcional base, pero dejando el sistema preparado para crecer con permisos mas finos o roles nuevos en el futuro.

## Cambio de prioridad respecto a la estrategia anterior

La estrategia anterior iba bien encaminada, pero con el nuevo alcance conviene ajustarla.

### Lo que se mantiene

Sigue teniendo sentido:

- no mezclar demasiadas capas a la vez
- preparar una buena base de UX
- pensar en responsive, temas e i18n antes de crecer demasiado
- separar automatizacion y libertad manual en el creador

### Lo que cambia

La prioridad funcional ahora debe quedar mas centrada en producto:

1. cerrar contrato funcional de roles, contenidos y estados
2. consolidar la experiencia base del area de personajes
3. disenar e implementar el creador guiado de personajes v1
4. dejar preparado el camino para contenido custom y entidades editables
5. despues ampliar gestion administrativa, i18n, tema y mejoras avanzadas

La diferencia importante es que ahora el creador guiado pasa a ser el corazon del roadmap cercano, no solo una fase posterior de diseno.

## Orden recomendado de desarrollo

## Fase A - Revision funcional del modelo actual

Objetivo:

- revisar lo ya implementado
- compararlo con el nuevo alcance
- detectar huecos, conflictos y oportunidades de reutilizacion

Entregables:

- mapa de lo ya construido
- diferencias entre plan inicial, estado actual y nuevo objetivo
- decisiones de continuidad o correccion

Esta fase es importante porque el proyecto ya tiene bastante trabajo hecho y no conviene rehacer por intuicion.

## Fase B - Contrato de roles, contenido y estados

Objetivo:

- definir con claridad que puede hacer cada rol
- definir tipos de contenido
- definir estados del contenido
- definir visibilidad y flujos de revision

Entregables:

- matriz de roles
- matriz de acciones
- estados de contenido como minimo:
  - `private`
  - `public_custom`
  - `shared_canon`
  - `in_review`
- decisiones abiertas documentadas

Sin esta fase, el sistema de entidades y revision quedara ambiguo.

## Fase C - UX base del area de personajes

Objetivo:

- consolidar la zona autenticada del usuario
- revisar shell, navegacion y vistas de personajes
- asegurar que la galeria de personajes es una base buena para crecer

Entregables:

- flujo claro de entrada del usuario autenticado
- galeria revisada
- detalle y edicion alineados con el futuro creador
- patron de doble confirmacion para borrado

## Fase D - Character Creation V1 Guided

Objetivo:

- implementar el primer creador guiado realmente util
- centrado en `dnd-2014-srd`

Capacidades objetivo:

- paso a paso
- seleccion de opciones del sistema
- automatizacion de datos derivados
- validaciones comprensibles
- estructura preparada para futuras extensiones

Decisiones de diseno necesarias:

- que campos son calculados y bloqueados
- que campos son sugeridos pero editables
- que campos seguiran siendo manuales
- como se desacopla la logica de reglas del formulario

Esta es la siguiente gran funcionalidad de producto.

## Fase E - Fundacion para custom y entidades editables

Objetivo:

- preparar la evolucion desde el creador guiado a un sistema mas abierto

Incluye:

- formularios por tipo de entidad
- relacion de entidades con sistema o version
- estrategia para creacion sobre la marcha
- soporte para homebrew privado y publico

Importante:

- esta fase puede empezar con diseno y modelo de datos antes que con UI completa

## Fase F - Gestion de revisiones y administracion

Objetivo:

- activar el circuito de moderacion y gobierno del contenido

Incluye:

- vistas de revision
- vistas de usuarios
- vistas de permisos
- vistas de gestion por entidad

## Fase G - Capas transversales

Estas capas siguen siendo importantes, pero ahora deben acompanar el roadmap, no frenarlo si bloquean el creador guiado:

- responsive
- temas claro/oscuro
- i18n ES/EN

Recomendacion:

- introducirlas de forma progresiva mientras se construyen las fases C y D
- evitar una gran fase aislada de infraestructura visual si retrasa demasiado el valor principal

## Recomendacion practica inmediata

El siguiente paso con mas valor ahora mismo es:

`A1 - Revision funcional del estado actual frente al nuevo alcance`

Ese trabajo deberia responder:

- que partes actuales ya encajan
- que partes hay que corregir
- que partes se pueden reaprovechar para el creador guiado
- que cambios de modelo de datos seran necesarios para contenidos y revisiones

Despues, el orden recomendado seria:

`A2 - Contrato de roles, contenidos y estados`

`A3 - UX base de personajes`

`A4 - Character Creation V1 Guided`

## Riesgos a evitar

- intentar construir a la vez el modo guiado y el modo custom
- mezclar revision de contenidos, admin completo y creador guiado en una sola fase
- automatizar reglas sin separar bien datos canon, datos custom y overrides
- disenar formularios de entidades sin cerrar antes estados y permisos
- rehacer demasiada UI antes de decidir el flujo central del usuario autenticado

## Conclusiones

La nueva direccion es bastante clara:

- el centro del producto debe ser la creacion guiada de personajes
- el modo custom debe influir en la arquitectura, pero no bloquear la primera entrega
- el sistema de contenidos debe distinguir canon, custom y revision
- los roles actuales encajan, siempre que concretemos mejor sus acciones reales

La mejor estrategia no es abrir todos los frentes, sino avanzar en este orden:

1. revisar lo ya construido frente al nuevo alcance
2. cerrar roles, estados y modelo funcional
3. consolidar area de personajes
4. entregar creador guiado v1
5. ampliar a entidades editables, custom y revision avanzada

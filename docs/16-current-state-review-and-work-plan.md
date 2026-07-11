# Revision del estado actual y plan de trabajo propuesto

## Objetivo

Este documento revisa el estado real del proyecto, lo compara con la direccion funcional actual y deja cerrado el bloque `B1` a nivel documental.

Su funcion es doble:

- registrar que partes del proyecto ya estan bien encaminadas
- dejar claro que decisiones de producto ya han quedado fijadas para las siguientes fases

## Resumen ejecutivo

El proyecto ya tiene una base tecnica fuerte:

- auth y shell autenticado funcionando
- CRUD de personajes bastante completo
- catalogo estructurado reutilizable conectado al formulario de personajes
- permisos globales `user`, `content_editor`, `admin`
- primeros flujos reales de contenido privado, compartido y de sistema para `feats` y `spells`
- cobertura automatica util para personajes y contenido

La principal conclusion de esta revision sigue siendo la misma:

- el repo esta mas avanzado en base tecnica y contenido estructurado que en experiencia de producto
- el siguiente gran salto ya no deberia ser "mas CRUD", sino `Character Creation V1 Guided`

## Estado actual del proyecto

## 1. Autenticacion y shell

Estado:

- implementado
- funcional
- bien separado entre publico y autenticado

La base actual encaja con el producto futuro y no necesita un rediseño estructural inmediato.

## 2. Roles y permisos

Estado:

- implementados a nivel de modelo, servidor y RLS

Roles actuales:

- `user`
- `content_editor`
- `admin`

La base de permisos actual es reutilizable, pero hasta ahora la interpretacion funcional no estaba completamente cerrada.

## 3. Personajes

Estado:

- galeria, detalle, edicion y borrado existen
- el formulario de personajes es rico y estructurado

Gap principal:

- aun no existe un creador guiado real por reglas
- el flujo actual es un formulario estructurado con apoyo de catalogo, no una experiencia guiada por sistema

## 4. Contenido estructurado

Estado:

- muy avanzado para la fase actual

Ya existen:

- tablas y tipos para especies, subespecies, clases, subclases, trasfondos, hechizos, feats y equipo
- semillas SRD
- catalogo expandido reutilizable
- primeros flujos privados y compartidos para contenido editable

Esto significa que la base para el futuro creador guiado ya existe en buena parte.

## 5. Gestion editorial

Estado:

- parcial, pero ya util

Ya existe:

- gestion privada para `feats` y `spells`
- publicacion compartida por roles privilegiados
- mantenimiento de contenido compartido

Todavia no existe de forma general:

- modelo editorial formal de revision
- flujo transversal por entidades
- paneles completos de administracion

## Decisiones cerradas en B1

Estas decisiones ya deben considerarse el contrato de producto de referencia.

## Decision 1. Todas las entidades y personajes tendran `ruleset` y `content_mode`

Decision final:

- si, los personajes tambien deben tener estas propiedades
- si, todas las entidades definidas deben tener estas propiedades

Motivo:

- varias entidades pueden parecerse mucho pero pertenecer a versiones de reglas distintas
- incluso con el mismo nombre pueden existir diferencias semanticas, mecanicas o editoriales segun la version

Interpretacion acordada:

- `ruleset`: indica que sistema o version de reglas sigue el item
- `content_mode`: indica si el item sigue ese ruleset de forma canonica o como variacion custom

Ejemplos acordados:

- `ruleset = dnd-2014-srd` + `content_mode = canon`
- `ruleset = dnd-2014-srd` + `content_mode = custom`
- futuro: `ruleset = custom` + `content_mode = custom`

Direccion semantica recomendada:

- mantener nombres cercanos a `ruleset` y `content_mode` salvo que aparezca un termino aun mejor durante el diseño tecnico

## Decision 2. `canon` no es lo mismo que `shared`

Decision final:

- `canon` significa que el contenido sigue fielmente una version concreta de reglas
- `shared` solo indica alcance de reutilizacion o visibilidad compartida

Consecuencia:

- `shared` y `canon` no deben tratarse como sinonimos
- el contenido en revision no deberia resolverse solo con `content_mode`
- el estado editorial de revision debe existir como una capa separada cuando se formalice el modelo de datos

## Decision 3. `content_editor` tendra autoridad editorial real

Decision final:

- `content_editor` podra crear, editar, revisar y mantener contenido compartido
- `content_editor` podra gestionar contenido canon
- `content_editor` podra convertir contenido en revision a canon final

Interpretacion de producto:

- este rol sera el responsable editorial principal cuando el usuario normal pueda proponer contenido compartido

Resumen funcional:

- `user`: personajes, contenido privado, propuestas y consumo de contenido visible
- `content_editor`: gestion editorial de contenido compartido y canon
- `admin`: control global, usuarios, permisos y operaciones sensibles

## Decision 4. `Character Creation V1 Guided` sera la siguiente entrega central

Decision final:

- el siguiente gran bloque de producto debe ser el creador guiado
- la primera version se centra en `ruleset = dnd-2014-srd`

Objetivo:

- automatizar al maximo el proceso de creacion siguiendo las reglas de la version elegida
- reducir la necesidad de que el usuario conozca o recuerde manualmente las normas

Comportamiento esperado:

- flujo paso a paso
- las elecciones de especie, subespecie, clase, subclase, nivel y otras opciones aplican automaticamente sus reglas
- se añaden por defecto caracteristicas, rasgos, progresion, mejoras y opciones definidas para esa version cuando el sistema ya disponga de esos datos

Direccion de contenido del personaje:

- si el personaje sigue fielmente el ruleset elegido, permanece como `content_mode = canon`
- si el usuario altera esa progresion o introduce una variacion fuera de la version, pasa a `content_mode = custom`

## Decision 5. El modo custom completo se aplaza

Decision final:

- el modelo custom puede esperar a una segunda fase

Pero debe influir ya en la arquitectura:

- separar reglas automaticas del formulario
- preparar soporte futuro para overrides
- evitar que el creador guiado cierre el camino a la flexibilidad posterior

## Decision 6. El contenido debe avanzar hacia ES/EN

Decision final:

- empezar creando traducciones para el contenido existente
- seguir el desarrollo creando versiones en ingles y español para el contenido nuevo

Direccion tecnica:

- no hace falta rehacer toda la UI actual de golpe
- pero las nuevas superficies deben construirse ya con textos desacoplados

## Cambios de direccion confirmados

## Cambio 1. Menos expansion horizontal inmediata

El proyecto no deberia abrir ahora muchas mas superficies CRUD generales si no desbloquean:

- el modelo editorial
- o el creador guiado

## Cambio 2. El contenido ya modelado debe pasar a servir al creador

La base de catalogo ya construida debe aprovecharse para:

- aplicar reglas
- poblar opciones
- conducir progresion y automatizacion

## Cambio 3. Hace falta un modelo editorial mas explicito

El siguiente paso ya no es debatir si existe revision, sino diseñar como se representa.

La direccion acordada es que deberia existir alguna combinacion de:

- `ruleset`
- `content_mode`
- estado editorial o de revision

sin mezclar todos esos conceptos en un solo campo.

## Estado del bloque B1

`B1 - Actualizacion del contrato funcional del producto` puede darse por completado a nivel documental inicial.

Resultado fijado:

- requisitos funcionales reorientados al creador guiado
- `ruleset` y `content_mode` definidos como conceptos base
- personajes y entidades alineados con ese modelo
- `content_editor` definido con autoridad editorial real
- alcance de `Character Creation V1 Guided` aclarado
- aplazamiento formal del modo custom completo

## Estado del bloque B2

`B2 - Editorial Model And Content States` ya queda cerrado a nivel documental inicial.

Resultado fijado:

- separacion entre `ruleset`, `content_mode` y `editorial_status`
- personajes alineados con `ruleset` y `content_mode`
- entidades reutilizables alineadas con `ruleset`, `content_mode` y `editorial_status`
- distincion formal entre contenido compartido y contenido canonico
- propuesta de nombres de campos orientada a implementacion

Documento de referencia:

- `docs/17-editorial-model-and-content-states.md`

## Proximo trabajo recomendado

El siguiente bloque con mas sentido ahora es:

- `B3 - Character Area UX Consolidation`

Y en paralelo o inmediatamente despues:

- traducir el contrato documental a SQL y tipos cuando decidamos abrir el bloque tecnico de modelo de datos
- `B4 - Character Creation V1 Guided Design`

## Recomendacion practica

La mejor continuidad ahora mismo es:

1. cerrar el modelo editorial y los estados de contenido
2. traducir ese contrato a modelo de datos objetivo
3. despues limpiar UX de personajes
4. y solo entonces diseñar el creador guiado con una base ya estable

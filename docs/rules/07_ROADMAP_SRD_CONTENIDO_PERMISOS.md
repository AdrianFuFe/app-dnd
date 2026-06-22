# Roadmap para SRD, contenido manual y permisos

## Iteracion 0 - Documentacion y estructura

- Anadir documentos de arquitectura.
- Anadir guia SRD.
- Anadir guia de contenido manual.
- Anadir guia de permisos.
- Crear carpetas `data/srd-5-1` y `data/private-content-templates`.
- Crear plantillas JSON.
- Mantener tests en verde.

## Iteracion 1 - Tipos y validaciones

- Crear tipos TypeScript para contenido.
- Crear tipos para permisos.
- Crear schemas Zod:
    - common content.
    - species.
    - class.
    - subclass.
    - background.
    - spell.
- Crear tests unitarios de validacion.

## Iteracion 2 - Base de datos de contenido

- Crear SQL de `content_sources`.
- Crear SQL de contenido base.
- Crear SQL de permisos MVP.
- Crear RLS para contenido SRD y privado.
- Crear seeds minimos.

## Iteracion 3 - Importacion desde archivos

- Crear script local de validacion.
- Crear script local de importacion.
- Importar contenido SRD permitido.
- Importar contenido privado solo en entorno local/privado.

## Iteracion 4 - UI de contenido manual

- Listado de contenido.
- Crear contenido manual.
- Editar contenido propio.
- Duplicar contenido SRD como privado/homebrew.
- Filtrar por fuente.

## Iteracion 5 - Integracion con creador de personajes

- Elegir especie desde catalogo.
- Elegir clase desde catalogo.
- Elegir trasfondo desde catalogo.
- Aplicar mecanicas estructuradas.
- Mostrar advertencias si hay mecanicas no automatizadas.

## Iteracion 6 - Permisos avanzados

- Compartir contenido con usuarios concretos.
- Compartir contenido con campana.
- Roles de campana.
- Contenido visible solo para DM.

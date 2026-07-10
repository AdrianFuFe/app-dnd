# Siguiente estrategia de desarrollo

## Objetivo

Este documento define el orden recomendado para continuar el desarrollo de `app-dnd` ahora que:

- Supabase real ya está conectado
- autenticación y sesión básica funcionan
- CRUD principal de personajes funciona
- la base de contenido estructurado y contenido privado funciona

La idea no es hacer todo a la vez. La idea es fijar primero la dirección correcta para que las próximas mejoras crezcan sobre una base coherente.

## Situación actual resumida

El proyecto ya tiene una base bastante buena:

- autenticación con Supabase
- RLS y modelo inicial de roles
- gestión de personajes
- catálogo SRD inicial
- contenido privado y compartido con permisos base
- pruebas automáticas y validación local útiles

Lo que falta ya no es tanto "conectar piezas", sino definir mejor el producto:

- qué puede hacer cada rol
- cómo debe sentirse la app en móvil y escritorio
- cómo convivirán español e inglés
- cómo evolucionará la creación de personajes
- qué partes deben ser automáticas y cuáles deben seguir siendo manuales

## Decisión estratégica recomendada

El orden más lógico ahora es este:

1. definir bien roles, capacidades y límites
2. preparar la base transversal de UX, responsive, tema claro/oscuro e i18n
3. rediseñar la estrategia de creación de personajes sobre esa base
4. después ampliar automatización, contenido y vistas avanzadas

Este orden reduce retrabajo. Si primero se añaden pantallas y automatismos sin cerrar roles, UX base e idioma, luego tocará rehacer mucho.

## Prioridad 1: roles y capacidades

### Por qué va primero

Ahora mismo el proyecto ya tiene una base técnica de permisos, pero todavía falta convertirla en producto claro:

- qué ve un `user`
- qué ve y mantiene un `content_editor`
- qué hace un `admin`
- qué acciones estarán fuera de la UI normal

Sin esta definición, cualquier trabajo en navegación, paneles o formularios corre el riesgo de quedarse corto o de exponer opciones que luego habrá que mover.

### Resultado que conviene conseguir

Definir una matriz simple y estable:

- `guest`
  - solo acceso público, landing y auth
- `user`
  - gestionar sus personajes
  - gestionar su contenido privado
  - consultar contenido SRD y compartido permitido
- `content_editor`
  - todo lo anterior
  - mantener contenido compartido no sistema dentro de ámbitos permitidos
- `admin`
  - todo lo anterior
  - supervisión global
  - operaciones sensibles y soporte

### Decisiones que conviene dejar cerradas

- si habrá o no panel admin dentro de la app en esta fase
- si `content_editor` podrá editar cualquier contenido compartido o solo el suyo
- si un `user` podrá duplicar más tipos de contenido SRD a privado además de feats y spells
- si el futuro modelo de campañas añadirá nuevos roles o se apoyará en roles de campaña separados del `global_role`

### Entregable recomendado

Crear o actualizar documentación que deje explícito:

- responsabilidades por rol
- vistas permitidas por rol
- acciones permitidas por rol
- acciones prohibidas aunque el dato exista en base de datos
- decisiones aplazadas

## Prioridad 2: base UX, responsive, temas e idiomas

### Por qué va antes que nuevas features grandes

La aplicación ya tiene suficiente superficie para que el diseño base empiece a condicionar todo lo que venga después. Si esperamos demasiado:

- los formularios crecerán con patrones inconsistentes
- el responsive será más caro de corregir
- el modo claro/oscuro obligará a rehacer estilos
- las traducciones acabarán mezcladas con la lógica

### Objetivos de esta fase

- establecer layout base móvil + escritorio
- definir sistema visual base
- introducir tokens de color y espaciado
- preparar tema claro y oscuro
- introducir infraestructura de traducción
- separar textos UI del código de negocio

### Decisiones recomendadas

- idioma base de la UI: español primero, con soporte real para inglés desde el inicio
- estrategia de traducción:
  - textos UI en diccionarios
  - contenido SRD/localizable separado de etiquetas de interfaz
- modo de tema:
  - `system`
  - `light`
  - `dark`
- prioridad responsive:
  - móvil primero en formularios
  - escritorio optimizado para lectura, paneles y edición avanzada

### Resultado que conviene conseguir

Una base reusable para el resto del proyecto:

- shell de aplicación más clara
- navegación más sólida
- paneles y formularios consistentes
- base visual preparada para crecer
- infraestructura i18n lista para extender

## Prioridad 3: creación de personajes v2

### Idea principal

La creación de personaje debería dividirse en dos modos claros:

- modo guiado
- modo manual o custom

### Modo guiado

Pensado para usuarios que quieren apoyo del sistema.

Debe priorizar:

- flujo paso a paso
- dependencias entre especie/subespecie y clase/subclase
- ayudas de reglas
- autocompletado de campos derivados
- validaciones comprensibles

### Modo manual o custom

Pensado para usuarios que quieren libertad o adaptar material propio.

Debe permitir:

- edición directa
- sobrescribir selecciones estructuradas cuando tenga sentido
- introducir combinaciones no cubiertas todavía por automatización
- convivir con contenido privado y homebrew

### Principio importante

La automatización no debe bloquear el modo manual. La app debe ayudar, no encerrar.

### Decisiones que conviene tomar antes de implementar mucho más

- qué campos serán siempre automáticos
- qué campos serán sugeridos pero editables
- qué campos seguirán siendo manuales bastante tiempo
- cómo se mostrarán conflictos entre datos estructurados y texto libre heredado
- qué partes del cálculo se harán ahora y cuáles más adelante

## Lo que dejaría para después

No parece el mejor momento para priorizar todavía:

- hosting final
- despliegue público estable
- campañas completas
- permisos avanzados por campaña
- automatización profunda de todas las reglas
- expansión masiva de todo el contenido si la UX base aún no está consolidada

Eso no significa abandonarlo. Significa no mezclar ahora un bloque de plataforma con un bloque de producto que todavía está madurando.

## Orden recomendado de próximas sesiones

### Bloque A

`A1 - Role And Capability Review`

Objetivo:

- convertir el modelo actual de roles en contrato funcional de producto

Cierre esperado:

- matriz de roles
- mapa de vistas
- mapa de acciones
- lista de decisiones aplazadas

### Bloque B

`A2 - App UX Foundation`

Objetivo:

- revisar shell, navegación, paneles, densidad de información y patrones de formularios

Cierre esperado:

- documento de estrategia UX
- lista de mejoras base antes de rediseñar pantallas concretas

### Bloque C

`A3 - Theme And Responsive Foundation`

Objetivo:

- preparar la base técnica para móvil/escritorio y claro/oscuro

Cierre esperado:

- tokens visuales
- layout base revisado
- estrategia responsive definida

### Bloque D

`A4 - I18n Foundation`

Objetivo:

- introducir traducciones reales de UI sin mezclar texto y lógica

Cierre esperado:

- estructura de diccionarios
- selector o estrategia de idioma
- primera superficie UI traducible

### Bloque E

`A5 - Character Creation V2 Design`

Objetivo:

- diseñar bien el flujo guiado y el flujo manual antes de ampliar automatización

Cierre esperado:

- mapa de pasos
- campos automáticos vs editables
- dependencias de catálogo
- backlog técnico por fases

### Bloque F

`A6 - Character Creation V2 Implementation`

Objetivo:

- implementar el primer tramo real del nuevo flujo

Cierre esperado:

- una versión mejorada y usable del flujo de creación
- validación manual y automática suficiente

## Recomendación práctica inmediata

Si seguimos una línea limpia, el siguiente paso más valioso ahora mismo es:

`A1 - Role And Capability Review`

Después:

`A2 - App UX Foundation`

Y después:

`A3/A4 - Theme, Responsive And I18n Foundation`

Solo entonces pasaría a:

`A5 - Character Creation V2 Design`

## Riesgos a evitar

- mezclar rediseño visual, permisos, i18n y automatización en una sola sesión
- rehacer formularios antes de definir la estructura responsive y de temas
- automatizar reglas que todavía no tienen un contrato UX claro
- introducir traducciones directamente dentro de componentes sin capa intermedia
- crear UI admin demasiado pronto sin cerrar antes el modelo operativo real

## Cómo usar este documento en una sesión nueva

Puedes abrir un chat nuevo y pedir exactamente uno de estos bloques.

Ejemplos:

- `Quiero trabajar el bloque A1 - Role And Capability Review. Revisa el proyecto actual y propón una matriz final de roles, vistas y acciones.`
- `Quiero trabajar el bloque A2 - App UX Foundation. Analiza la UI actual y crea una estrategia base para móvil, escritorio, paneles y formularios.`
- `Quiero trabajar el bloque A4 - I18n Foundation. Propón la estructura técnica para soportar español e inglés en la UI actual.`
- `Quiero trabajar el bloque A5 - Character Creation V2 Design. Diseña el flujo guiado y el flujo manual con prioridades realistas.`

## Conclusión

La base técnica actual ya permite dejar de pensar solo en "que funcione" y pasar a "qué producto queremos construir". El mejor movimiento ahora es consolidar dirección:

- primero permisos y alcance funcional
- luego base UX e idioma
- después creación de personaje v2

Ese orden debería permitir avanzar con mucha menos fricción y con menos retrabajo en las siguientes iteraciones.

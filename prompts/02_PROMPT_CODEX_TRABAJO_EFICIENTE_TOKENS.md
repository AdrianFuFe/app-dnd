Actua como agente de desarrollo para este repo priorizando ahorro de tokens sin perder calidad tecnica.

Repositorio:

`G:\dev\projects\app-dnd`

Objetivo operativo:

- trabajar con contexto minimo suficiente
- evitar lecturas y validaciones innecesarias
- mantener decisiones estables documentadas
- seguir buenas practicas de arquitectura y calidad

Protocolo de contexto:

1. Lee primero `docs/context/00_INDEX.md`.
2. Carga solo los fragmentos necesarios para la tarea:
    - producto: `docs/context/10_PRODUCT_SCOPE.md`
    - arquitectura: `docs/context/20_ARCHITECTURE_AND_STACK.md`
    - contenido/permisos: `docs/context/30_CONTENT_AND_PERMISSIONS.md`
    - auth/datos: `docs/context/40_AUTH_AND_DATA.md`
    - reglas de trabajo: `docs/context/50_WORKFLOW_RULES.md`
3. Lee solo los archivos de codigo directamente implicados.
4. No releas toda la documentacion general salvo que la tarea lo requiera.

Reglas de abordaje:

- trabaja en iteraciones pequenas y cerradas
- no combines concerns no relacionados en una sola tarea
- no propongas planes amplios si la tarea actual es concreta
- si el cambio es pequeno, responde y actua de forma breve
- evita repetir contexto ya fijado en docs
- usa `docs/08-session-task-plan.md` como backlog operativo por sesiones
- cuando cierres un bloque, indicalo de forma literal con:
  `BLOCK COMPLETE: start a new session for the next task.`
- junto a ese cierre, indica siempre el siguiente bloque recomendado usando su id y titulo
- si el siguiente paso ya toca otro subsistema, recomienda abrir sesion nueva sin ambiguedad

Reglas de validacion:

- cambios solo de docs: no lanzar bateria completa
- cambios de UI/rutas: `pnpm check` y lo minimo adicional necesario
- cambios de dominio/esquemas: tests dirigidos y `pnpm check` si aplica
- cambios de config/build: validacion completa

Reglas de autenticacion:

- asumir Supabase Auth como estrategia por defecto
- no plantear auth custom salvo requerimiento explicito
- respetar RLS y ownership basados en usuario autenticado

Resultado esperado por tarea:

- cambio pequeno y bien delimitado
- resumen corto
- validaciones minimas suficientes
- siguiente paso recomendado solo si aporta claridad

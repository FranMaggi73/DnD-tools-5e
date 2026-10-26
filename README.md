# D&D Tools 5e — Firebase Spark

Aplicación estática SvelteKit para campañas de D&D 5e. Usa Firebase Authentication
(Google), Cloud Firestore y Firebase Hosting. No necesita ejecutar el backend Go,
Redis, Cloud Functions, Cloud Run ni habilitar Blaze. Open5e sigue siendo la fuente
externa de criaturas, condiciones y objetos.

## Proyecto configurado

Esta copia usa **dnd5etools-73** (DnD5eTools), con el alias `default` en
`.firebaserc`. La configuración web está en `frontend/.env.local`, que Git ignora.
La publicación web es https://dnd5etools-73.web.app.

## Configuración para otro proyecto

1. Creá un proyecto en la [consola de Firebase](https://console.firebase.google.com/)
   y mantenelo en el plan **Spark**. No enlaces una cuenta de facturación.
2. Registrá una aplicación web y copiá su configuración a `frontend/.env.local`,
   usando `frontend/.env.example` como base. Estos valores identifican la app web;
   no uses una clave privada de cuenta de servicio.
3. Habilitá **Authentication → Sign-in method → Google**. Configurá el correo de
   soporte y revisá los dominios autorizados: el dominio de Hosting y `localhost`
   para desarrollo. Las invitaciones por correo requieren un email verificado.
4. Creá una base **Cloud Firestore Standard, Native mode**. Elegí la región antes
   de crearla; la aplicación funciona con una base `(default)`. No actives acceso
   público ni uses las reglas de prueba.
5. Instalá Node.js 22 y pnpm 11.25.0. Desde la raíz del repositorio:

```sh
pnpm install --frozen-lockfile
pnpm exec firebase login
pnpm exec firebase use --add
```

Elegí el proyecto deseado y asignale el alias `default` para reemplazar la selección
actual. El `projectId` del archivo `.env.local` debe
coincidir con el proyecto elegido en la CLI.

## Desarrollo y publicación

```sh
pnpm dev
pnpm build
pnpm deploy
```

El comando de publicación despliega reglas, índices y Hosting; su hook compila
el frontend automáticamente. También se puede indicar el proyecto explícitamente:

```sh
pnpm exec firebase deploy --project TU_PROJECT_ID --only "firestore,hosting"
```

Esperá a que los índices terminen de crearse antes de probar las consultas. El
directorio publicado es `frontend/build`; las rutas de campañas y `/join/CODIGO`
usan el fallback estático de Hosting. Toda la aplicación se publica como archivos
estáticos; los permisos y la validación de datos se despliegan como reglas de Firestore.
El proyecto Android de Capacitor usa el frontend empaquetado en `frontend/build`,
con la misma configuración de Firebase que la versión web.

## Reglas base 2024

La ficha conserva competencia y pericia (★) en habilidades; las salvaciones tienen
competencia, sin pericia. Los cálculos incluyen iniciativa desde Destreza,
Percepción pasiva, media competencia del bardo en habilidades no entrenadas y
penalizaciones de agotamiento.

Los controles de vida gestionan daño por tipo, resistencias, vulnerabilidades,
inmunidades, HP temporales, muerte por daño masivo, estabilidad y salvaciones de
muerte (1 y 20 naturales). También permiten registrar inspiración heroica,
agotamiento y concentración con salvación pendiente al recibir daño.

En combate, las condiciones admiten hasta diez efectos con origen y duración,
medida en turnos propios al inicio o final. Los cambios se sincronizan con el
personaje. Los encuentros finalizados conservan su registro y no pueden modificar
la ficha actual; recrear un personaje tampoco lo enlaza a combatientes anteriores.

Fuera del combate, los descansos cortos gastan dados de golpe y los largos
recuperan vida y dados, eliminan HP temporales y reducen un nivel de agotamiento.
Ambos requieren al menos 1 HP al iniciarse. El DM confirma el tiempo transcurrido,
las interrupciones y los requisitos narrativos; no se controla el calendario de la
campaña ni se automatizan recursos específicos de clase, conjuros o multiclase.
Un descanso no elimina condiciones indefinidas.

Las fichas anteriores se leen con valores iniciales y se actualizan al guardarlas,
sin borrar datos. Las habilidades se almacenan como rangos validados y los efectos
con un formato compacto para respetar los límites de evaluación de Firestore.

Referencia: [glosario oficial de reglas 2024](https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary/).

## Catálogo propio de monstruos y objetos

El catálogo base se distribuye en `frontend/static/catalog/`, mediante Firebase
Hosting. Las búsquedas descargan solo un índice y cada ficha carga un bloque de
hasta 50 registros; el cliente conserva una caché acotada de bloques. Los datos no
se consultan en Open5e durante el uso de la aplicación y no consumen lecturas de
Firestore. Los inventarios, personajes, encuentros y sus personalizaciones siguen
guardándose en Firestore.

La importación usa Open5e V2 y conserva equivalencias de V1 para las referencias
ya guardadas. Las variantes de distintas publicaciones o ediciones conservan IDs
separados y muestran su fuente. Los índices priorizan coincidencias exactas y,
entre resultados equivalentes, contenido de 2024. Los datos no se traducen ni se
convierten automáticamente de una edición a otra. No se descargan ilustraciones.

```sh
pnpm catalog:import   # Generar desde las descargas en caché, si existen
pnpm catalog:refresh  # Actualizar desde la API pública
pnpm catalog:check    # Validar archivos, hashes, fuentes y referencias
pnpm build
```

Las descargas originales y el informe quedan en `.tools/catalog-raw/` (ignorado
por Git). Los archivos publicados y sus textos de licencia sí pertenecen al
proyecto. La importación verifica la paginación completa, usa dos descargas
concurrentes como máximo, conserva copyright y atribuciones y reporta fuentes no
reconocidas en vez de incluirlas silenciosamente.

Cada importación genera una carpeta identificada por su contenido; el manifiesto
se escribe al final. Los bloques se cachean como inmutables y el manifiesto se
revalida. Las versiones previas se conservan para que las pestañas abiertas sigan
resolviendo sus fichas. No se deben editar los JSON generados directamente: hay
que regenerarlos para actualizar sus hashes. El build comprueba la integridad
antes de producir una versión publicable.

La ruta pública `/sources` contiene las fuentes, ediciones, atribuciones y textos
de licencia, junto con un archivo `NOTICE.txt` descargable. La aplicación no
reclama propiedad sobre el contenido de sus autores ni aplica su licencia de
código al catálogo. Referencias: [API de Open5e](https://open5e.com/api-docs/),
[datos originales](https://github.com/open5e/open5e-api),
[licencia del repositorio](https://github.com/open5e/open5e-api/blob/staging/LICENSE.md).

## Creador y ficha ampliada

El creador tiene seis pasos: origen, características, combate, competencias,
rasgos y hechizos. El catálogo local incluye especies y subespecies, clases y
subclases, trasfondos, dotes y hechizos, filtrados por edición. Solo incluye el
contenido abierto publicado por Open5e; no replica manuales comerciales completos.
Las variantes incluidas como texto dentro de una especie se registran en Linaje.

Elegir una clase aplica su nombre, dado de golpe, competencias de salvación y
característica de lanzamiento conocida. Las habilidades de clase se eligen a
partir de su texto; el trasfondo puede añadir competencias fijas. Las referencias
muestran los rasgos y la tabla del nivel actual. Se pueden agregar dotes y rasgos
personalizados, entrenamiento, idiomas y notas de elecciones. Cambiar una clase
no elimina habilidades ya elegidas: deben revisarse en el paso Competencias.

Las características aceptan matriz estándar, compra por puntos o entrada manual;
el asistente separa base y aumentos y verifica los aumentos del trasfondo 2024.
El cálculo opcional de vida usa el dado máximo al primer nivel y el promedio
posterior, con mínimo 1 por nivel. Los bonos de rasgos se ingresan explícitamente.
No es un motor que resuelva automáticamente todas las interacciones de rasgos,
requisitos de dotes, equipo inicial o multiclase.

El libro permite buscar por clase y nivel, consultar componentes, ritual,
concentración, duración, alcance y escalado; guarda hechizos, trucos y preparados
junto con hechizos personalizados. CD y ataque mágico se calculan a partir de
la característica elegida. Los espacios máximos pueden cargarse desde la tabla
de clase; pacto usa campos separados. No se gastan espacios al pulsar un hechizo.
Las elecciones que conceden magia adicional deben registrarse explícitamente.

La ficha ampliada se guarda como texto JSON acotado en `characters.buildJson`.
No contiene permisos ni sustituye los campos de combate validados. Se normaliza
al leer y antes de escribir, admite documentos anteriores y limita listas y
textos personalizados. Los textos se presentan escapados, sin ejecutar HTML.
Los límites de tamaño y el acceso siguen protegidos por las reglas de Firestore.

## Referencias mecánicas adicionales y control de calidad

El catálogo incorpora referencias mecánicas de la publicación pública de 5etools
`v2.39.0`, fijada al commit `8790755429c346d20020eed7826d312d484c393f`.
`reference.mjs` conserva solo nombres, identificadores, competencias estructuradas,
valores numéricos, tablas por nivel y relaciones entre clases y hechizos. Descarta
los textos de rasgos, efectos, capítulos e ilustraciones. Su caché es un archivo
de hechos normalizados, no una copia íntegra de los libros. Estas fichas indican
«Datos mecánicos» o «Referencia», enlazan la publicación y no se etiquetan como
CC/OGL. Los textos abiertos y sus licencias siguen procediendo de Open5e.

Las fuentes distinguen Oficial, Pruebas, Terceros y Homebrew. La búsqueda del
creador usa Oficial por defecto; cambiar el filtro conserva las selecciones de
la ficha. Las publicaciones sin clasificación conocida se apartan. Las ediciones
2014 y 2024, y las relaciones padre de subclases, conservan IDs independientes.
Las entradas entre ediciones no se convierten automáticamente. Sidekicks sin
dado de golpe fijo se excluyen del selector de clases de jugador.

Artificer de Tasha's (2014) y Artificer de Eberron: Forge of the Artificer
(reglas 2024, publicado en 2025) son opciones distintas. «Artificiero» funciona
como alias de búsqueda. Dados, salvaciones, competencias y espacios se conservan;
las descripciones editoriales se consultan mediante las referencias enlazadas.

La importación compara dados, columnas de progresión y niveles de hechizos con
las referencias y se detiene ante discrepancias. No verifica todas las reglas
ni interacciones. `corrections.mjs` documenta la corrección de cinco tablas de
2014 donde Open5e duplicaba el nivel 4 y omitía el nivel 3 para espacios de nivel
2. También se eliminan filas completamente idénticas. Una corrección rechaza
cambios inesperados de la entrada para no esconder errores nuevos.

El manifiesto y `/sources` muestran los controles y correcciones. Los informes
locales están en `.tools/catalog-raw/reference-report.json` e `import-report.json`.
`catalog:refresh` actualiza Open5e y vuelve a extraer los hechos de la revisión
fijada; actualizar 5etools exige cambiar el commit y volver a validar.

## Ejecución de pruebas

La revisión de duplicados del catálogo se puede repetir con `pnpm catalog:audit`.
Genera `.tools/catalog-duplicates.md` y `.tools/catalog-duplicates.json` sin
modificar registros. Comprueba IDs y nombres dentro de una publicación y compara
contenido completo entre fuentes de la misma edición. Los nombres compartidos
entre publicaciones, ediciones o sistemas se señalan como candidatos de revisión,
sin asumir equivalencia ni eliminar sus referencias o licencias. Esta comparación
no certifica equivalencia semántica entre textos diferentes.

`pnpm catalog:audit-items` compara los endpoints actuales de objetos V2 y V1 de
Open5e con los identificadores, equivalencias y campos normalizados del catálogo
local. Genera `.tools/item-coverage/report.md` y `report.json` sin alterar el
catálogo ni Firestore. Distingue cobertura de registros de funciones del inventario.

Instalá Java 21 o superior para el emulador de Firestore y ejecutá:

```sh
pnpm test:rules
```

Las pruebas usan exclusivamente `demo-dnd-spark` y el emulador local en el puerto
8085. Cubren la API cliente real y las reglas: permisos, campañas ajenas, datos
privados, invitaciones, carreras por el último uso de un código, límites de
campañas, eliminación, inventario y combate. No usan un proyecto real ni claves.
El SDK de Authentication se sustituye únicamente en las pruebas para representar
identidades con tokens verificados o no verificados.

## Permisos y comportamiento

### Juego en mesa

La sección Combate tiene una sola pantalla para el encuentro, con iniciativa,
participantes y controles del DM. Cada card del DM tiene un botón visible
**Ver ficha**; para los jugadores, ese acceso aparece en su propio personaje.
La ficha rápida reúne vida, condiciones, contadores y hechizos preparados, mientras
que los rasgos, habilidades, edición e inventario se consultan en **Personajes**.
El botón **Ver mi ficha** también está disponible sin un encuentro activo.

Las fichas de Personajes mantienen altura máxima, desplazamiento interno y
secciones desplegables. Las plantillas y la bitácora se mantienen plegadas en
Combate; ya no hay una pestaña En mesa independiente.

Los contadores se configuran desde Ver ficha o el desplegable Recursos de Personajes,
con máximo y recuperación manual, corta
o larga. Sus cambios se guardan en `character_resources`, separados de la ficha;
los descansos recuperan salud y recursos juntos. Las sugerencias requieren revisar
la recuperación de cada rasgo. No hay consumo automático al lanzar hechizos ni
bonos automáticos de equipo. La revisión del creador señala elecciones pendientes
y permite confirmar las elecciones manuales al subir de nivel.

El DM puede añadir hasta 20 criaturas juntas, tirar sus iniciativas, reservar vida
y CA, ocultarlas y guardar notas privadas. Puede guardar las criaturas de un
encuentro como plantilla e iniciar otro con vida completa. Las plantillas son
privadas del DM y no incluyen personajes de jugadores.

`combatants` contiene los detalles privados del DM; `combat_public` contiene
exclusivamente lo que ven los jugadores. La página del DM actualiza automáticamente
los encuentros anteriores al abrirlos por primera vez. `encounters.characterIds`
permite comprobar si un personaje participa sin leer los detalles privados. Al
desplegar esta versión deben publicarse reglas, índices y Hosting juntos; las
pestañas antiguas deben recargarse.

La bitácora registra nuevas operaciones de combate, vida, descansos y recursos;
los eventos privados solo los lee el DM. La interfaz consulta las últimas 100
entradas al abrirla, pero no hay borrado automático de entradas históricas. La
biblioteca permite filtrar por libro, edición y tipo, consultar sin cerrar el
creador y guardar hasta 200 favoritos y 12 búsquedas recientes por usuario en
`catalog_preferences`.

Los índices estáticos incluyen propiedades, manos, daño, magia, sintonización,
categoría de armadura, sigilo y datos de lanzamiento. La biblioteca combina estos
subfiltros con clase, nivel y escuela de hechizos antes de limitar a 60 resultados,
sin descargar los textos completos para filtrar. Las búsquedas recientes conservan
también los subfiltros; el importador los regenera desde datos estructurados.

- Los miembros ven campaña, miembros, personajes y combate de su propia campaña.
  Solo el dueño del personaje y el DM pueden leer o modificar su inventario y monedas.
- Las notas personales solo las ve su autor. Las compartidas son visibles para los
  miembros y solo el DM puede crearlas o compartirlas. Se pueden guardar textos vacíos.
- Solo el DM administra encuentros y combatientes. Los cambios de HP, condiciones,
  HP temporales y salvaciones se guardan junto con el personaje en una transacción.
- Hay hasta tres campañas activas por DM, mediante slots cuya asignación verifican
  las reglas. Un usuario puede participar como jugador en otras campañas.
- Cada usuario tiene un personaje por campaña; su ID determinista evita duplicados.
- Las invitaciones por correo aparecen dentro de la app cuando la persona inicia
  sesión con ese email de Google. **No se envía email** ni se busca en un directorio
  público de usuarios. La persona no necesita haberse registrado antes.
- Los códigos son aleatorios de 192 bits, se consultan por ID y no se pueden listar
  fuera del DM. Aceptarlos crea una membresía determinista y consume un uso en una
  transacción; las reglas comprueban también vencimiento, límite y operación conjunta.
- Expulsar a un jugador revoca el acceso, pero conserva sus personajes y notas. Un
  código aún válido puede permitirle volver: desactivá los links si no querés permitirlo.
- Eliminar una campaña hace una **eliminación lógica irreversible desde la app**:
  revoca acceso a su contenido y libera el slot. La campaña deja de mostrarse; los
  documentos permanecen almacenados y cuentan para la cuota. Para una purga física,
  usá la consola con una cuenta administradora y eliminá los documentos asociados de
  `event_members`, `characters`, `inventory_items`, `currencies`, `encounters`,
  `combatants`, `combat_public`, `character_resources`, `campaign_activity`,
  `encounter_templates`, `notes`, `invitations` e `invitation_links`, y finalmente el documento
  de `events`. No hay un proceso automático de limpieza ni backups en esta versión.
- El límite de 500 objetos es una ayuda de la interfaz, no una cuota de seguridad
  garantizada por las reglas. Las reglas sí validan cantidades, monedas, HP, roles
  e identidades. Spark no aporta un rate limiter personalizado ni cron jobs.

## Cuotas gratuitas

Spark tiene límites de almacenamiento, lecturas, escrituras y transferencia; no
equivale a capacidad ilimitada. Los listeners en tiempo real y las lecturas hechas
por reglas consumen cuota. La lista de invitaciones usa un listener en lugar de
consultar cada 30 segundos. Revisá el consumo en la consola, en especial si dejás
varias pestañas abiertas o mantenés muchas campañas eliminadas.

Referencias: [planes](https://firebase.google.com/pricing),
[cuotas de Firestore](https://firebase.google.com/docs/firestore/quotas),
[transacciones y getAfter](https://firebase.google.com/docs/firestore/manage-data/transactions),
[reglas de seguridad](https://firebase.google.com/docs/firestore/security/rules-conditions).

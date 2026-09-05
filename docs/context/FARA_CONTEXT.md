# Fara

## 1. Problema y Contexto

La velocidad con la que evolucionan las tecnologías obliga a los profesionales de software a aprender continuamente nuevos lenguajes, frameworks y herramientas para mantenerse productivos y competitivos en su trabajo actual. Sin embargo, el método más común para adquirir una tecnología nueva sigue siendo el mismo de siempre: buscar tutoriales genéricos, elegir un proyecto de práctica desconectado de la experiencia propia, y reconstruir desde cero conceptos que el profesional ya domina en otro contexto tecnológico.

Esto genera una fricción concreta entre lo que una persona ya sabe hacer y lo que necesita aprender para seguir siendo productiva cuando su entorno de trabajo cambia de stack, adopta una nueva herramienta, o exige una habilidad que no tiene. El problema no es la falta de acceso a información —hoy sobra contenido educativo—, sino la falta de un puente que conecte la experiencia real y ya demostrada del profesional con la tecnología que necesita incorporar.

Aprender "desde cero" cuando en realidad se parte de años de experiencia es un desperdicio de tiempo que ninguna plataforma de cursos genéricos resuelve, porque ninguna de ellas parte de lo que la persona ya construyó.

En el marco de future of work, este es precisamente el problema central de la adaptabilidad laboral continua: la velocidad de cambio tecnológico ya no permite procesos de aprendizaje largos y genéricos: se necesita reducir el tiempo entre "mi trabajo exige algo nuevo" y "puedo contribuir con eso", apalancando la experiencia acumulada en lugar de ignorarla.

## 2. Usuario y Oportunidad

Nuestro usuario principal son profesionales de software que necesitan adquirir rápidamente una tecnología nueva para seguir siendo productivos en su trabajo, ya sea porque su equipo migra de stack, porque un proyecto exige una herramienta que no dominan, o porque buscan una oportunidad laboral que requiere una habilidad que aún no tienen.

La oportunidad no está en enseñar contenido genérico —eso ya está resuelto por el mercado de EdTech (Pluralsight, LinkedIn Learning, roadmap.sh, incontables cursos)—, sino en algo que ninguna de esas plataformas puede ofrecer: partir del código real que la persona ya escribió para practicar la tecnología nueva sobre problemas que ya resolvió antes, en lugar de sobre ejercicios inventados y descontextualizados.

La oportunidad, entonces, es transformar el aprendizaje tecnológico de un proceso genérico y desconectado en uno anclado en la experiencia demostrable de cada profesional.

## 3. Solución e Impacto

Proponemos una plataforma agéntica que, a partir de fragmentos de código que el usuario ya escribió (subidos directamente o traídos desde GitHub), identifica porciones puntuales con potencial de traducirse a la tecnología que necesita aprender, y genera a partir de ellas ejercicios prácticos concretos —no rutas de aprendizaje ni contenido teórico, que es donde el mercado ya está saturado.

El ejercicio no parte de cero: parte de algo que el usuario ya construyó. Por ejemplo, si alguien implementó un endpoint de autenticación en Python y necesita aprender Go para su nuevo equipo, la plataforma no le da un curso de Go genérico: le plantea reconstruir ese mismo endpoint en Go, señalando qué conceptos son directamente transferibles (la lógica de negocio, el diseño de la API) y cuáles son genuinamente nuevos (el manejo de concurrencia, por ejemplo). Cuando el salto tecnológico no tiene una base transferible evidente, la plataforma lo comunica explícitamente en lugar de forzar una equivalencia artificial, y complementa el ejercicio con el andamiaje necesario para los fundamentos sin análogo.

El diferencial central de la experiencia es un modo "versus" contra una IA. El usuario resuelve el ejercicio en paralelo a una IA que escribe su propia solución en tiempo real, con un ritmo pausado y realista (no la respuesta completa e instantánea). De forma transparente y explícita para el usuario —sabe en todo momento que compite contra una IA, no se le engaña sobre su naturaleza—, esa IA comete errores deliberados y los corrige sobre la marcha, concentrados específicamente en los conceptos que la plataforma identificó como nuevos para ese usuario (no en los que ya domina por transferencia). Ver el proceso de error y corrección es pedagógicamente más valioso que ver código perfecto: normaliza el debugging como parte natural de aprender algo nuevo, en vez de mostrar solo el resultado final pulido que ningún tutorial replica del proceso real de desarrollo.

Para que este modo no desmotive al usuario, los niveles de dificultad de la IA se ajustan según su progreso y su nivel de transferencia real hacia esa tecnología: un usuario que recién empieza compite contra una IA con ritmo más pausado y errores más frecuentes y visibles; a medida que gana soltura, el nivel sube. El objetivo del versus no es medir quién es "mejor", sino mantener un desafío calibrado que motive sin frustrar.

El impacto esperado es reducir el tiempo entre que un profesional identifica que necesita una tecnología nueva y el momento en que puede aplicarla con confianza en su trabajo, usando su propia experiencia como punto de partida en vez de descartarla.

## 4. Tecnología e Innovación

La solución utiliza una arquitectura de agentes de IA especializados:

- **Agente de búsqueda y matching de código**: dado un fragmento o repositorio del usuario y una tecnología objetivo, identifica las porciones de código con mayor relevancia semántica y potencial de traducción (usando análisis estructural del código, embeddings y comparación semántica) —no construye un perfil persistente, opera de forma puntual sobre el material que el usuario aporta en el momento.
- **Agente generador de ejercicios**: a partir del fragmento identificado, genera el ejercicio equivalente en la tecnología objetivo, junto con la señalización de qué conceptos son transferibles y cuáles son nuevos.
- **Agente del modo versus**: genera la solución progresiva "humanizada" del ejercicio, incluyendo errores deliberados y calibrados por nivel de dificultad, concentrados en los conceptos nuevos identificados por el agente anterior.

El stack combina la API de GitHub (o carga directa de fragmentos) para obtener el código fuente, análisis estructural/semántico de código y embeddings para el matching, y modelos de lenguaje para la generación de ejercicios y del guion de resolución con errores.

La innovación no está en generar ejercicios de programación genéricos —eso ya existe—, sino en dos elementos que sí son diferenciales: anclar cada ejercicio a código real que el usuario ya escribió (nadie más tiene acceso a esa evidencia de experiencia salvo el propio usuario), y convertir el proceso de error y corrección en una experiencia deliberada y calibrada de aprendizaje, en vez de mostrar únicamente soluciones perfectas.

## 5. Viabilidad y Sostenibilidad

El MVP es técnicamente viable apoyándose en APIs y herramientas ya existentes: la API de GitHub, modelos de lenguaje de terceros para generación y análisis semántico, y librerías estándar de embeddings —sin necesidad de infraestructura propia de modelos ni entrenamiento desde cero. Esto mantiene el costo marginal por usuario bajo (principalmente el consumo de tokens de los modelos de lenguaje), lo cual permite validar la propuesta con riesgo financiero acotado antes de escalar inversión.

El modelo de negocio, en esta etapa, se enfoca en **B2C freemium**, dirigido al profesional individual que enfrenta un momento concreto de necesidad: un cambio de proyecto, una migración de stack en su equipo actual, o la preparación para una oportunidad laboral que exige una tecnología nueva.

- **Nivel gratuito**: un número limitado de ejercicios generados por mes, sin acceso al modo versus o con acceso limitado a él.
- **Nivel de pago**: ejercicios ilimitados, acceso completo al modo versus con niveles de dificultad ajustables, e histórico de ejercicios resueltos como evidencia de aprendizaje aplicado —útil como portafolio para mostrar ante un cambio de equipo o una búsqueda laboral.

Es importante ser honestos sobre el patrón de uso esperado: aprender una tecnología nueva no es un hábito diario, sino algo puntual y esporádico. Por eso el valor no se sostiene en el uso frecuente, sino en que cada vez que surge la necesidad real, el usuario vuelve porque la experiencia resuelve algo que ninguna plataforma genérica de cursos puede ofrecer (ejercicios sobre su propio código). El histórico de ejercicios resueltos, además, le da al usuario una razón de valor que persiste entre usos: no es contenido consumido y olvidado, es evidencia acumulable de habilidades aplicadas.

## 6. Escalabilidad y Futuro

A corto plazo, la plataforma puede ampliar sus fuentes de código más allá de GitHub (GitLab, Bitbucket, carga directa de archivos) y sumar más tecnologías objetivo al catálogo de matching y generación de ejercicios.

El modo versus también tiene recorrido propio: podría evolucionar hacia desafíos colaborativos entre usuarios reales (no solo contra la IA), o hacia una biblioteca de "patrones de error típicos" por tecnología, construida a partir de los ejercicios generados, que en sí misma se vuelve un activo de contenido diferenciado.

A largo plazo, sin todavía comprometernos con un modelo de negocio B2B concreto en esta etapa, la lógica de "aprender reconstruyendo lo propio" podría extenderse más allá del código individual: hacia documentación técnica propia, proyectos históricos de un equipo, o cualquier evidencia de trabajo real que sirva como base para acelerar la adopción de una tecnología nueva. El objetivo de fondo es que la experiencia ya construida por un profesional —o eventualmente por un equipo— se convierta automáticamente en el punto de partida más eficiente para adquirir la siguiente habilidad que el mercado laboral le exija.

# FARA — Arquitectura del Sistema (v5)

Documento técnico derivado de los wireframes, la propuesta de valor y los planes de precio.
Todos los diagramas están en Mermaid y renderizan directamente en GitHub.

Cambios de fondo vs. v4:
- **`ProjectMember` distingue miembros de la `Organization` de externos**: al armar el equipo de un proyecto, se puede elegir entre los miembros existentes de la organización o invitar a alguien externo — pero ese externo debe quedar explícitamente marcado como tal (`isExternal`).

Cambios de fondo acumulados desde v3:
1. `Organization` es real: un usuario puede pertenecer a varias, sin roles.
2. `Problem` ↔ `Technology` es muchos-a-muchos ("Adaptable a").
3. El equipo de un proyecto (`ProjectMember`) puede mezclar miembros de la organización y externos identificados.

Supuesto que se mantiene: el billing (`Subscription`) sigue siendo por `User` individual, no por `Organization`, consistente con el modelo B2C freemium de la propuesta.

---

## 0. Alcance Fase 1 vs. Arquitectura objetivo

| Componente | Fase 1 (hoy) | Objetivo (post-hackathon) |
|---|---|---|
| Servicios backend | Monolito único (módulos internos) | Microservicios independientes |
| Búsqueda semántica de código | `pgvector` dentro de Postgres | Vector DB dedicada |
| Ejecución de código | Runner externo (Piston/Judge0) o contenedor único | Sandbox propio con aislamiento de red |
| Organización (multi-tenant) | `Organization` + `Membership` real, sin roles; un usuario puede pertenecer a varias; cada `Project` pertenece a una `Organization` | Roles dentro de la organización, billing por organización |
| Colaboración en un proyecto (fights) | `ProjectMember` vía enlace de invitación, independiente de `Organization` | Vincular ambos conceptos si el negocio lo requiere |
| `Problem` → `Technology` | Muchos a muchos ("Adaptable a") | — |
| Modo Fight | Vs. IA y vs. Humano, ambos en vivo | Matchmaking automático, ranking |
| Community / News | Fuera de alcance | Backlog |
| Object Storage separado | No — código como columna en Postgres | Object Storage si el volumen lo justifica |
| Billing | Flag de plan en `User` (NPC / Giga Chad) | Servicio de billing completo, evaluar si pasa a nivel de Organization |

---

## 1. Mapa de navegación

```mermaid
flowchart LR
    ORG{{"Renato's org ▾"<br/>switcher real de Organization}} --> D
    L[Landing<br/>Log In / Sign In] --> AUTH{{Auth Provider}}
    AUTH -->|Google| ORG
    AUTH -->|GitHub| ORG
    AUTH -->|Phone| ORG

    D[Dashboard<br/>racha · últimos proyectos<br/>tecnologías aprendidas]
    D --> P[Your Projects<br/>filtros: stars, technologies, premium]
    D --> B[Billing<br/>NPC / Giga Chad]
    D --> S[Settings]

    P --> NP[Modal: Create new project<br/>name · description · repos · stack]
    NP --> GEN[/Generating your problems.../]
    GEN --> PD[Project Detail<br/>Problemas propuestos]

    PD --> SHARE[Compartir enlace de invitación<br/>al proyecto - Your Team]
    SHARE --> PD

    PD -->|Code| CODE[Code Mode<br/>editor + checker]
    PD -->|Fight| FSET[Fight Setup]

    CODE --> CR{Resultado}
    CR -->|Great| CRO[Calificación + Feedback<br/>Retry / Next problem]
    CR -->|Fail| CRO
    CODE -->|Switch to fight mode| FSET

    FSET -->|vs IA · plan Giga Chad| ARENA_AI[Arena vs IA<br/>timer 5:00]
    FSET -->|vs Humano · invitar o unirse| ROOM[Sala de espera]
    ROOM --> ARENA_H[Arena vs Humano<br/>timer 5:00]

    ARENA_AI --> EVAL[/Evaluando tu solución.../]
    ARENA_H --> EVAL2[/Evaluando ambas soluciones.../]
    EVAL --> RES[Resultado]
    EVAL2 --> RES
    RES --> PD
```

---

## 2. Diagrama de componentes (vista lógica — MVP monolito)

```mermaid
flowchart TB
    subgraph client["Cliente"]
        WEB["Web App SPA<br/>(Next.js / React)"]
    end

    subgraph edge["Borde"]
        GW["API Monolito<br/>REST + WebSocket"]
    end

    subgraph core["Módulos internos (mismo deploy)"]
        AUTHS["Auth & Organization<br/>(Membership, switcher)"]
        PROJ["Projects, Repos & Team<br/>(invite link por proyecto)"]
        PROB["Problems"]
        SUB["Submissions"]
        MATCH["Matches<br/>(timer, salas vs Humano, race vs IA)"]
        BILL["Billing<br/>(flag de plan por User)"]
    end

    subgraph agents["Capa agéntica (invocada desde los módulos)"]
        A1["Agente Matching de Código"]
        A2["Agente Generador de Ejercicios"]
        A3["Agente Versus<br/>(guion completo, solo si oponente = IA)"]
        A4["Agente Evaluador<br/>(evalúa envíos humanos, 1 o 2 según el modo)"]
    end

    subgraph data["Datos"]
        PG[("PostgreSQL<br/>+ pgvector")]
        REDIS[("Redis<br/>timers + pub/sub de salas")]
    end

    subgraph ext["Externos"]
        GH["GitHub API"]
        LLM["LLM Provider"]
        PAY["Pasarela de pagos<br/>(mock para demo)"]
        RUN["Runner de código<br/>(Piston / Judge0 API)"]
    end

    WEB --> GW
    GW --> AUTHS & PROJ & PROB & SUB & MATCH & BILL
    PROJ --> A1
    PROB --> A2
    MATCH --> A3
    SUB --> A4
    A1 --> PG
    A1 --> GH
    A2 --> LLM
    A3 --> LLM
    A4 --> LLM
    SUB --> RUN
    AUTHS --> GH
    BILL --> PAY
    AUTHS & PROJ & PROB & SUB & BILL --> PG
    MATCH --> REDIS
```

---

## 3. Diagrama de clases (modelo de dominio — MVP)

```mermaid
classDiagram
    class User {
        +UUID id
        +string username
        +string email
        +string avatarUrl
        +int streakDays
        +AuthProvider provider
        +Plan plan
    }
    class Organization {
        +UUID id
        +string name
        +UUID ownerId
    }
    class Membership {
        +UUID orgId
        +UUID userId
        +datetime joinedAt
    }
    class Project {
        +UUID id
        +UUID orgId
        +string name
        +string description
        +string inviteToken
        +datetime createdAt
        +addRepo(repo)
        +generateProblems()
    }
    class ProjectMember {
        +UUID id
        +UUID projectId
        +UUID userId
        +bool isExternal
        +datetime joinedAt
    }
    class Repository {
        +UUID id
        +string fullName
        +string url
        +int stars
        +string defaultBranch
    }
    class Technology {
        +UUID id
        +string name
        +string iconUrl
        +bool isTrending
    }
    class Problem {
        +UUID id
        +string title
        +string description
        +string sourceSnippet
        +string sourceUrl
        +Difficulty difficulty
        +string[] transferableConcepts
        +string[] newConcepts
    }
    class Submission {
        +UUID id
        +string code
        +int score
        +string feedback
        +SubmissionStatus status
        +datetime submittedAt
    }
    class Match {
        +UUID id
        +MatchStatus status
        +OpponentType opponentType
        +int durationSec
        +datetime startedAt
        +UUID winnerId
    }
    class AIOpponent {
        +Level level
        +float paceFactor
        +int deliberateErrors
        +int completionTimeSec
        +jsonb revealScript
    }
    class Subscription {
        +Plan plan
        +datetime renewsAt
        +bool active
    }

    User "1" -- "*" Membership
    Organization "1" -- "*" Membership
    Organization "1" -- "*" Project
    Project "1" -- "*" ProjectMember : equipo de fight (independiente de Organization)
    User "1" -- "*" ProjectMember
    Project "1" *-- "*" Repository
    Project "*" -- "*" Technology
    Project "1" *-- "*" Problem
    Problem "*" -- "*" Technology : adaptableA
    Problem "1" -- "*" Submission
    User "1" -- "*" Submission
    Problem "1" -- "*" Match
    Match "1" -- "1" User : retador
    Match "0..1" -- "1" AIOpponent : oponente IA (excluyente)
    Match "0..1" -- "1" User : oponente humano (excluyente)
    Match "1" -- "*" Submission : 1 envío si vs IA, 2 si vs Humano
    User "1" -- "0..1" Subscription
```

`opponentType` (`ai` | `human`) determina cuál de los dos vínculos opcionales de `Match` aplica. `adaptableA` reemplaza al antiguo `targetTech` único: un `Problem` puede apuntar a varias `Technology` de las seleccionadas en el `Project`.

---

## 4. Secuencia — Creación de proyecto y generación de problemas

```mermaid
sequenceDiagram
    actor U as Usuario
    participant W as Web App
    participant API as API Monolito
    participant GH as GitHub API
    participant A1 as Agente Matching
    participant PG as PostgreSQL (+pgvector)
    participant A2 as Agente Generador

    U->>W: Create new project (nombre, repos, stack)<br/>dentro de la Organization activa
    W->>API: POST /projects (org_id, repos, stack)
    API->>PG: persiste Project + Repositories
    API-->>W: 202 Accepted (jobId)
    W-->>U: "Generating your problems..."

    API->>GH: fetch árbol y archivos de los repos
    GH-->>API: código fuente
    API->>A1: analizar(código, tecnologías del proyecto)
    A1->>PG: upsert + búsqueda semántica (pgvector)
    PG-->>A1: fragmentos candidatos
    A1-->>API: fragmentos + conceptos transferibles/nuevos
    API->>A2: generarEjercicios(fragmentos)
    A2-->>API: problemas (enunciado, tests, dificultad,<br/>tecnologías a las que es adaptable)
    API->>PG: guarda Problems + Problem_Tech
    API-->>W: push WebSocket "problems.ready"
    W-->>U: Project Detail con problemas propuestos
```

---

## 5. Secuencia — Modo Code

Sin cambios respecto a v3.

```mermaid
sequenceDiagram
    actor U as Usuario
    participant W as Web App
    participant API as API Monolito
    participant RUN as Runner de código
    participant A4 as Agente Evaluador
    participant PG as PostgreSQL

    U->>W: Escribe código y envía
    W->>API: POST /problems/{id}/submissions
    API->>RUN: ejecutar código + tests
    RUN-->>API: resultados (pass/fail, logs)
    API->>A4: evaluar(código, resultados, rúbrica)
    A4-->>API: score 0-100 + feedback cualitativo
    API->>PG: guarda Submission
    API-->>W: {score, feedback, status}
    alt Aprobado
        W-->>U: "Great!" · Retry / Next problem
    else Reprobado
        W-->>U: "You can do it better!" + feedback
    end
```

---

## 6a. Secuencia — Modo Fight vs. IA

Sin cambios respecto a v3.

```mermaid
sequenceDiagram
    actor U as Retador
    participant W as Web App
    participant API as API Monolito (Matches)
    participant A3 as Agente Versus
    participant R as Redis (timer)
    participant RUN as Runner de código
    participant A4 as Agente Evaluador
    participant PG as PostgreSQL

    U->>W: Elige battle stack → Start fight (vs IA)
    W->>API: POST /matches (opponentType=ai)
    API->>A3: generar guion completo
    A3-->>API: guion (buggy, limpio, revelado, completionTimeSec)
    API->>PG: guarda Match + guion IA
    API->>R: inicia timer 5:00
    API-->>W: match.started + guion IA

    loop Reproducción pausada en el cliente
        W-->>U: revela siguiente paso del código de la IA
    end

    U->>W: escribe y envía código en el instante t
    W->>API: POST /matches/{id}/submissions
    API->>RUN: ejecutar + validar
    RUN-->>API: resultados
    API->>A4: evaluar(código)
    A4-->>API: score + feedback
    API->>PG: guarda Submission

    alt t < completionTimeSec y score >= umbral
        API-->>W: "You won!" + feedback
    else t >= completionTimeSec o timer llega a 0 sin aprobar
        API-->>W: "You lost :(" — la IA "llegó" en completionTimeSec
    end
```

---

## 6b. Secuencia — Modo Fight vs. Humano (en vivo)

Sin cambios respecto a v3.

```mermaid
sequenceDiagram
    actor U1 as Retador
    actor U2 as Rival invitado
    participant W as Web App
    participant API as API Monolito (Matches)
    participant R as Redis (pub/sub + timer)
    participant RUN as Runner de código
    participant A4 as Agente Evaluador
    participant PG as PostgreSQL

    U1->>W: Copia el enlace de invitación del proyecto
    U1->>W: Fight Setup → "vs Humano" → crea sala
    W->>API: POST /matches (opponentType=human, status=WaitingOpponent)
    API->>R: publica sala en el canal del proyecto

    U2->>W: Abre el enlace, entra a la sala
    W->>API: POST /matches/{id}/join
    API->>R: notifica a U1 que U2 se unió
    API->>R: inicia timer 5:00
    API-->>W: match.started (ambos clientes)

    par Ambos resuelven en paralelo
        U1->>W: escribe y envía código
        U2->>W: escribe y envía código
    end
    W->>API: POST /matches/{id}/submissions (una por usuario)
    API->>RUN: ejecutar + validar ambos envíos
    RUN-->>API: resultados
    API->>A4: evaluar ambas soluciones
    A4-->>API: scores + feedback individual
    API->>PG: guarda ambos Submissions
    API->>R: publica resultado en la sala
    R-->>W: match.finished (ambos clientes)
    W-->>U1: resultado + feedback propio
    W-->>U2: resultado + feedback propio
```

---

## 7. Máquina de estados de un Match

Sin cambios respecto a v3.

```mermaid
stateDiagram-v2
    [*] --> Created: Start fight
    Created --> InProgress: oponente = IA (guion generado, timer inicia)
    Created --> WaitingOpponent: oponente = Humano (invitación/sala creada)
    WaitingOpponent --> Cancelled: timeout / nadie se une
    WaitingOpponent --> InProgress: rival se une, timer inicia
    InProgress --> Reviewing: envío(s) recibido(s)
    InProgress --> Abandoned: desconexión sostenida (solo vs Humano)
    InProgress --> Finished: timer llega a 0 (gana IA, o sin envíos vs Humano)
    Reviewing --> Finished: score(s) evaluado(s)
    Finished --> [*]
    Cancelled --> [*]
    Abandoned --> [*]
```

---

## 8. Máquina de estados de un Problem

Sin cambios respecto a v3.

```mermaid
stateDiagram-v2
    [*] --> Generating
    Generating --> Proposed: agentes terminan
    Generating --> Failed: error de generación
    Proposed --> Attempting: Code
    Proposed --> InMatch: Fight
    Attempting --> Passed: score >= umbral
    Attempting --> Retrying: score < umbral
    Retrying --> Attempting: Retry problem
    InMatch --> Passed
    InMatch --> Retrying
    Passed --> [*]
    Failed --> [*]
```

---

## 9. Modelo entidad-relación (persistencia — MVP)

```mermaid
erDiagram
    USER ||--o{ MEMBERSHIP : pertenece
    ORGANIZATION ||--o{ MEMBERSHIP : tiene
    ORGANIZATION ||--o{ PROJECT : posee
    USER ||--o| SUBSCRIPTION : tiene
    PROJECT ||--o{ PROJECT_MEMBER : incluye
    USER ||--o{ PROJECT_MEMBER : colabora
    PROJECT ||--o{ PROJECT_REPO : incluye
    REPOSITORY ||--o{ PROJECT_REPO : referenciado
    PROJECT ||--o{ PROJECT_TECH : apunta_a
    TECHNOLOGY ||--o{ PROJECT_TECH : usada_en
    PROJECT ||--o{ PROBLEM : genera
    PROBLEM ||--o{ PROBLEM_TECH : adaptable_a
    TECHNOLOGY ||--o{ PROBLEM_TECH : es_target_de
    PROBLEM ||--o{ SUBMISSION : recibe
    USER ||--o{ SUBMISSION : envia
    PROBLEM ||--o{ MATCH : disputa
    USER ||--o{ MATCH : participa_como_retador
    PROBLEM ||--o{ CODE_EMBEDDING : indexa

    USER {
        uuid id PK
        string username
        string email
        int streak_days
        string plan
    }
    ORGANIZATION {
        uuid id PK
        string name
        uuid owner_id FK
    }
    MEMBERSHIP {
        uuid id PK
        uuid org_id FK
        uuid user_id FK
        datetime joined_at
    }
    PROJECT {
        uuid id PK
        uuid org_id FK
        string name
        string description
        string invite_token
    }
    PROJECT_MEMBER {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        datetime joined_at
    }
    REPOSITORY {
        uuid id PK
        string full_name
        string url
        int stars
    }
    PROBLEM {
        uuid id PK
        uuid project_id FK
        text title
        text description
        text source_snippet
        string difficulty
        jsonb concepts
    }
    PROBLEM_TECH {
        uuid id PK
        uuid problem_id FK
        uuid technology_id FK
    }
    SUBMISSION {
        uuid id PK
        uuid problem_id FK
        uuid user_id FK
        uuid match_id FK
        text code
        int score
        text feedback
    }
    MATCH {
        uuid id PK
        uuid problem_id FK
        uuid challenger_id FK
        string opponent_type
        uuid opponent_user_id FK
        string status
        int duration_sec
        int ai_completion_time_sec
        jsonb ai_reveal_script
        uuid winner_id
    }
    CODE_EMBEDDING {
        uuid id PK
        uuid problem_id FK
        vector embedding
    }
```

`target_tech_id` desaparece de `PROBLEM` — reemplazado por la tabla puente `PROBLEM_TECH`.

---

## 10. Vista de despliegue (MVP)

Sin cambios respecto a v3.

```mermaid
flowchart TB
    subgraph cdn["CDN / Edge"]
        FE["Frontend estático<br/>Vercel"]
    end
    subgraph cloud["Cloud (Railway / Render — un solo servicio)"]
        API["API + WebSocket + Agentes<br/>(mismo contenedor)"]
    end
    subgraph stores["Datos gestionados"]
        PGX[("PostgreSQL + pgvector")]
        RDX[("Redis — timers + pub/sub de salas")]
    end
    subgraph third["Terceros"]
        GHX["GitHub API"]
        LLMX["LLM Provider"]
        RUNX["Runner de código<br/>(Piston / Judge0 API)"]
        PAYX["Pasarela de pagos<br/>(mock para demo)"]
    end

    FE -->|HTTPS / WSS| API
    API --> PGX
    API --> RDX
    API --> LLMX
    API --> GHX
    API --> RUNX
    API --> PAYX
```

---

## 11. Decisiones de arquitectura (ADRs)

| # | Decisión | Motivo |
|---|---|---|
| ADR-01 | Generación de problemas asíncrona con notificación por WebSocket | La pantalla "Generating your problems..." implica latencia de decenas de segundos |
| ADR-02 | Agentes como módulos internos del monolito, no microservicios separados, para Fase 1 | Reduce infraestructura y tiempo de deploy bajo el límite de la hackathon |
| ADR-03 | `pgvector` dentro de Postgres en vez de una Vector DB dedicada, para Fase 1 | Evita levantar y operar un servicio adicional |
| ADR-04 | Runner de código externo (Piston/Judge0) o contenedor único, en vez de sandbox propio | Construir aislamiento serio propio consume tiempo que no se tiene hoy |
| ADR-05 | Redis pub/sub + timers para el modo Fight, soportando tanto vs. IA como vs. Humano | La colaboración vía enlace es parte del plan gratuito; el fight real entre personas es tan MVP como el fight contra IA |
| ADR-06 | `Organization` + `Membership` real (sin roles); un `User` puede pertenecer a varias; cada `Project` pertenece a una `Organization` | El wireframe confirma un selector real de organizaciones, no un label fijo |
| ADR-07 | El Agente Versus se invoca una sola vez por match, antes de iniciar el timer, generando el guion completo | Elimina la dependencia de streaming en vivo del LLM durante el duelo vs. IA |
| ADR-08 | `Community` y `News` quedan fuera de alcance de Fase 1 | No forman parte del diferencial de producto descrito en la propuesta |
| ADR-09 | En el modo vs. Humano, ambas soluciones pasan por Runner + Agente Evaluador sin atajos | No hay guion pregenerado que decida el resultado — el rival es una persona real |
| ADR-10 | `Problem` ↔ `Technology` es muchos-a-muchos ("Adaptable a") en vez de un único `targetTech` | El wireframe muestra varios íconos de tecnología por problema: un mismo ejercicio puede resolverse en más de una tecnología seleccionada para el proyecto |
| ADR-11 | `ProjectMember` (equipo de fight) se modela independiente de `Organization`/`Membership` | Evita acoplar dos conceptos que el wireframe no confirma como iguales; se puede unificar después si el negocio lo requiere |

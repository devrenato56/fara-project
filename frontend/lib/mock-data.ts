import {
  Organization,
  User,
  Project,
  Problem,
  AIRunStep,
  Match,
} from "@/types";

export const MOCK_USER: User = {
  id: "user-1",
  username: "Renato Pérez",
  email: "renato@example.com",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  streakDays: 5,
  provider: "github",
  plan: "giga_chad",
};

export const MOCK_ORGANIZATIONS: Organization[] = [
  { id: "org-1", name: "Renato's org", ownerId: "user-1" },
  { id: "org-2", name: "Acme Devs", ownerId: "user-1" },
  { id: "org-3", name: "Hackathon Team", ownerId: "user-2" },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: "proj-1",
    orgId: "org-1",
    name: "API de Tareas",
    description: "Backend de gestión de tareas migrado de Python FastAPI a Go Gin con arquitectura limpia.",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "Hace 2 días",
    inviteToken: "inv_fara_task_api_99x",
    repositories: [
      { id: "repo-1", fullName: "usuario/api-tareas", url: "https://github.com/usuario/api-tareas", stars: 14 },
      { id: "repo-2", fullName: "usuario/auth-service", url: "https://github.com/usuario/auth-service", stars: 28 },
      { id: "repo-3", fullName: "usuario/utils", url: "https://github.com/usuario/utils", stars: 5 },
    ],
    technologies: ["Go", "Docker", "PostgreSQL"],
    members: [
      {
        id: "mem-1",
        projectId: "proj-1",
        userId: "user-1",
        username: "Renato Pérez",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        isExternal: false,
        joinedAt: "2026-03-01T10:00:00Z",
      },
      {
        id: "mem-2",
        projectId: "proj-1",
        userId: "user-2",
        username: "Alex Dev",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        isExternal: false,
        joinedAt: "2026-03-02T11:00:00Z",
      },
      {
        id: "mem-3",
        projectId: "proj-1",
        userId: "user-3",
        username: "Carla External",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        isExternal: true,
        joinedAt: "2026-03-03T14:30:00Z",
      },
    ],
    problemsCount: 12,
    completedCount: 8,
    progressPercent: 67,
  },
  {
    id: "proj-2",
    orgId: "org-1",
    name: "Sistema de Pagos y Webhooks",
    description: "Servicio de conciliación de pagos y transacciones en tiempo real con colas distribuidas.",
    createdAt: "2026-02-20T08:00:00Z",
    updatedAt: "Hace 3 días",
    inviteToken: "inv_fara_payments_88z",
    repositories: [
      { id: "repo-4", fullName: "usuario/payment-processor", url: "https://github.com/usuario/payment-processor", stars: 42 },
    ],
    technologies: ["Go", "Redis", "Kafka"],
    members: [
      {
        id: "mem-1",
        projectId: "proj-2",
        userId: "user-1",
        username: "Renato Pérez",
        isExternal: false,
        joinedAt: "2026-02-20T08:00:00Z",
      },
    ],
    problemsCount: 8,
    completedCount: 3,
    progressPercent: 38,
  },
  {
    id: "proj-3",
    orgId: "org-1",
    name: "Auth & Identity Provider",
    description: "Servidor OAuth2 / OIDC con rotación de llaves criptográficas y rate limiting.",
    createdAt: "2026-02-15T12:00:00Z",
    updatedAt: "Hace 1 semana",
    inviteToken: "inv_fara_auth_77a",
    repositories: [
      { id: "repo-5", fullName: "usuario/auth-core", url: "https://github.com/usuario/auth-core", stars: 89 },
    ],
    technologies: ["Go", "PostgreSQL", "Docker"],
    members: [
      {
        id: "mem-1",
        projectId: "proj-3",
        userId: "user-1",
        username: "Renato Pérez",
        isExternal: false,
        joinedAt: "2026-02-15T12:00:00Z",
      },
    ],
    problemsCount: 10,
    completedCount: 10,
    progressPercent: 100,
  },
];

export const MOCK_PROBLEMS: Record<string, Problem[]> = {
  "proj-1": [
    {
      id: "prob-1",
      projectId: "proj-1",
      title: "Autenticación JWT",
      description: "Construye un middleware de verificación JWT en Gin que extraiga el token Bearer del header Authorization, valide la firma HS256 y monte los claims del usuario en el contexto.",
      sourceSnippet: "def auth_middleware(request): token = request.headers.get('Authorization')",
      sourceUrl: "https://github.com/usuario/auth-service/blob/main/security.py#L12-L34",
      difficulty: "medium",
      status: "completed",
      transferableConcepts: [
        "Estructura del token JWT (Header, Payload, Signature)",
        "Flujo de validación en middleware HTTP",
        "Códigos de estado HTTP 401 Unauthorized",
      ],
      newConcepts: [
        "gin.HandlerFunc y gin.Context (c.Set / c.Next)",
        "golang-jwt/jwt/v5 para parsing y parseWithClaims",
        "Manejo explícito de punteros y errores en Go",
      ],
      adaptableTo: ["Go", "Docker"],
      targetObjective: "Implementar el endpoint de login y middleware JWT en Go usando el framework Gin.",
      requirements: [
        "Verificar credenciales contra base de datos simulada",
        "Generar JWT token firmado con clave secreta",
        "Retornar token en respuesta JSON",
        "Manejar errores de parsing retornando HTTP 401",
      ],
      starterCode: {
        go: `package main

import (
\t"net/http"
\t"strings"
\t"github.com/gin-gonic/gin"
)

// AuthMiddleware valida el token JWT del header
func AuthMiddleware() gin.HandlerFunc {
\treturn func(c *gin.Context) {
\t\tauthHeader := c.GetHeader("Authorization")
\t\tif authHeader == "" {
\t\t\tc.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
\t\t\treturn
\t\t}

\t\tparts := strings.Split(authHeader, " ")
\t\tif len(parts) != 2 || parts[0] != "Bearer" {
\t\t\tc.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid format"})
\t\t\treturn
\t\t}

\t\t// TODO: Valida el token y extrae los claims
\t\tc.Next()
\t}
}

func main() {
\tr := gin.Default()
\tr.Use(AuthMiddleware())
\tr.GET("/profile", func(c *gin.Context) {
\t\tc.JSON(http.StatusOK, gin.H{"status": "ok"})
\t})
\tr.Run(":8080")
}`,
      },
    },
    {
      id: "prob-2",
      projectId: "proj-1",
      title: "CRUD de Tareas con GORM",
      description: "Implementa el controlador de creación y listado de tareas con filtrado por estado (completed, pending) mapeando modelos struct con tags gorm y json.",
      sourceSnippet: "@app.get('/tasks') def get_tasks(db: Session = Depends(get_db)): ...",
      sourceUrl: "https://github.com/usuario/api-tareas/blob/main/routers/tasks.py#L45-L78",
      difficulty: "medium",
      status: "in_progress",
      transferableConcepts: [
        "Modelado entidad-relación ORM",
        "Filtrado mediante query params",
        "Serialización a JSON",
      ],
      newConcepts: [
        "Struct tags `gorm:\"column:title\" json:\"title\"`",
        "database/sql connection pooling",
        "Retorno de slices y referencias en Go",
      ],
      adaptableTo: ["Go", "PostgreSQL"],
      targetObjective: "Implementar creación y listado de tareas con persistencia en PostgreSQL mediante GORM.",
      requirements: [
        "Mapear struct Task con campos ID, Title, Status, CreatedAt",
        "Endpoint POST /tasks con validación de body",
        "Endpoint GET /tasks con filtro opcional ?status=completed",
      ],
      starterCode: {
        go: `package main

import (
\t"github.com/gin-gonic/gin"
\t"net/http"
)

type Task struct {
\tID     uint   \`json:"id"\`
\tTitle  string \`json:"title"\`
\tStatus string \`json:"status"\`
}

var tasksDB = []Task{
\t{ID: 1, Title: "Aprender Go", Status: "completed"},
\t{ID: 2, Title: "Crear API REST", Status: "in_progress"},
}

func GetTasks(c *gin.Context) {
\t// TODO: Filtra tasksDB segun status query param
\tc.JSON(http.StatusOK, tasksDB)
}

func main() {
\tr := gin.Default()
\tr.GET("/tasks", GetTasks)
\tr.Run(":8080")
}`,
      },
    },
    {
      id: "prob-3",
      projectId: "proj-1",
      title: "Concurrencia con Goroutines y Canales",
      description: "A partir de tu script de procesamiento de lotes en Python, implementa un worker pool en Go que despache tareas a múltiples goroutines sincronizadas con sync.WaitGroup y canales con buffer.",
      sourceSnippet: "with ThreadPoolExecutor(max_workers=5) as executor: results = executor.map(process, items)",
      sourceUrl: "https://github.com/usuario/utils/blob/main/batch_worker.py#L5-L25",
      difficulty: "hard",
      status: "pending",
      transferableConcepts: [
        "Paralelismo vs concurrencia",
        "Cola de trabajos y distribución de tareas",
        "Agregación de resultados",
      ],
      newConcepts: [
        "Goroutines ligeras (go worker())",
        "Canales tipados (`chan Task`, `chan Result`)",
        "sync.WaitGroup para coordinar terminación",
        "Manejo de cierre de canales sin race conditions",
      ],
      adaptableTo: ["Go"],
      targetObjective: "Construir un worker pool concurrente capaz de procesar 100 tareas en paralelo con un límite de 4 workers.",
      requirements: [
        "Crear canal de entrada de tareas `jobs := make(chan int, 100)`",
        "Lanzar 4 goroutines de trabajadores",
        "Recoger resultados en `results := make(chan int, 100)`",
        "Cerrar canales y esperar con `sync.WaitGroup`",
      ],
      starterCode: {
        go: `package main

import (
\t"fmt"
\t"sync"
\t"time"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
\tdefer wg.Done()
\tfor j := range jobs {
\t\tfmt.Printf("worker %d processing job %d\\n", id, j)
\t\ttime.Sleep(time.Millisecond * 50)
\t\tresults <- j * 2
\t}
}

func main() {
\tconst numJobs = 10
\tjobs := make(chan int, numJobs)
\tresults := make(chan int, numJobs)
\tvar wg sync.WaitGroup

\t// TODO: Lanza workers y distribuye numJobs
\tclose(jobs)
\twg.Wait()
\tclose(results)
}`,
      },
    },
    {
      id: "prob-4",
      projectId: "proj-1",
      title: "Filtros y Búsquedas Dinámicas",
      description: "Implementa búsqueda full-text y filtros combinados sobre catálogo de items utilizando Go y Postgres ILIKE.",
      sourceUrl: "https://github.com/usuario/api-tareas/blob/main/search.py",
      difficulty: "medium",
      status: "pending",
      transferableConcepts: ["Query builders", "Sanitización SQL"],
      newConcepts: ["GORM Scopes", "Paginación por cursor"],
      adaptableTo: ["Go", "PostgreSQL"],
    },
  ],
};

export const MOCK_AI_SCRIPT: AIRunStep[] = [
  {
    timeSec: 5,
    code: `package main\n\nimport (\n\t"fmt"\n\t"sync"\n)\n\nfunc main() {\n\t// Inicializando canales...\n\tjobs := make(chan int, 5)\n}`,
    description: "La IA inicializa canales...",
  },
  {
    timeSec: 15,
    code: `package main\n\nimport (\n\t"fmt"\n\t"sync"\n)\n\nfunc worker(id int, jobs chan int) {\n\tfor j := range jobs {\n\t\tfmt.Println(j)\n\t}\n}\n\nfunc main() {\n\tjobs := make(chan int, 5)\n\tgo worker(1, jobs)\n}`,
    description: "La IA escribe la función worker preliminar (con un error en la firma de canal)...",
    isBuggy: true,
  },
  {
    timeSec: 30,
    code: `package main\n\nimport (\n\t"fmt"\n\t"sync"\n)\n\n// Corrección: usando canales unidireccionales y WaitGroup\nfunc worker(id int, jobs <-chan int, wg *sync.WaitGroup) {\n\tdefer wg.Done()\n\tfor j := range jobs {\n\t\tfmt.Printf("Worker %d: %d\\n", id, j*2)\n\t}\n}\n\nfunc main() {\n\tvar wg sync.WaitGroup\n\tjobs := make(chan int, 10)\n\tfor w := 1; w <= 3; w++ {\n\t\twg.Add(1)\n\t\tgo worker(w, jobs, &wg)\n\t}\n\tfor j := 1; j <= 5; j++ {\n\t\tjobs <- j\n\t}\n\tclose(jobs)\n\twg.Wait()\n}`,
    description: "La IA corrige el error de concurrencia y agrega sync.WaitGroup.",
    isBuggy: false,
  },
];

export const MOCK_MATCH: Match = {
  id: "match-1",
  problemId: "prob-3",
  problemTitle: "Concurrencia con Goroutines",
  challengerId: "user-1",
  challengerName: "Renato Pérez",
  opponentType: "ai",
  opponentName: "FARA AI Agent (Go Pro)",
  status: "in_progress",
  durationSec: 300,
  startedAt: new Date().toISOString(),
  aiCompletionTimeSec: 180,
  aiRevealScript: MOCK_AI_SCRIPT,
};

export const MOCK_NEWS = [
  {
    id: "news-1",
    title: "Go 1.22: Novedades en el lenguaje y mejoras en enrutamiento",
    summary: "El nuevo loop for por fin soluciona el clásico bug de variables compartidas por referencia y el net/http router ahora soporta métodos y comodines sin dependencias externas.",
    date: "Hace 1d",
    readTime: "4 min de lectura",
    tag: "Go",
    url: "https://go.dev/blog/go1.22",
  },
  {
    id: "news-2",
    title: "Rust vs Go: ¿Cuál elegir para microservicios de alta concurrencia en 2026?",
    summary: "Comparativa técnica a fondo sobre tiempos de compilación, latencia p99, consumo de memoria y curva de aprendizaje de ambos ecosistemas.",
    date: "Hace 3d",
    readTime: "7 min de lectura",
    tag: "Comparativa",
    url: "#",
  },
  {
    id: "news-3",
    title: "Mejores prácticas de Concurrencia: Patrones Fan-out y Worker Pool",
    summary: "Aprende a estructurar tus pipelines de procesamiento sin sobrecargar los procesadores ni causar fugas de memoria con goroutines huérfanas.",
    date: "Hace 1s",
    readTime: "5 min de lectura",
    tag: "Arquitectura",
    url: "#",
  },
];

export const MOCK_COMMUNITY_POSTS = [
  {
    id: "post-1",
    author: "Spider-man",
    handle: "@spidey_coder",
    avatar: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=100&auto=format&fit=crop&q=80",
    timeAgo: "Hace 2h",
    content: "Un gran poder conlleva una gran responsabilidad... especialmente cuando lanzas 10,000 goroutines sin sync.WaitGroup ni buffered channels 🕷️🕸️",
    likes: 34,
    comments: 10,
    tags: ["Go", "Concurrencia", "Humor"],
  },
  {
    id: "post-2",
    author: "DevMaster",
    handle: "@dev_master_pe",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    timeAgo: "Hace 5h",
    content: "¿Cuál es tu editor de código favorito para Go? ¿VS Code con gopls o GoLand con las herramientas nativas de JetBrains? Compartamos configuraciones.",
    likes: 42,
    comments: 9,
    tags: ["Productividad", "Setup", "DevOps"],
  },
];

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEMO_EMAIL = 'demo@careeros.app'
const DEMO_PASSWORD = 'demo123456'

const applications = [
  {
    title: 'Senior Frontend Developer',
    company: 'Bending Spoons',
    location: 'Milano (Remote)',
    status: 'OFFER',
    matchScore: 88,
    appliedAt: new Date('2026-03-15'),
    description: `Cerchiamo un Senior Frontend Developer con esperienza in React, TypeScript e performance optimization.
Requisiti: React 18+, TypeScript avanzato, state management (Redux/Zustand), testing (Jest/React Testing Library), GraphQL, CI/CD.
Nice to have: React Native, AWS, esperienza con prodotti consumer scalabili.`,
    matchingSkills: ['React', 'TypeScript', 'Jest', 'CI/CD', 'Zustand'],
    missingSkills: ['GraphQL', 'React Native'],
    explanation: 'Ottima corrispondenza sulle skill core. Mancano GraphQL e React Native ma sono nice-to-have.',
    suggestion: 'Aggiungi un progetto open source con GraphQL per chiudere il gap principale.',
    notes: [
      'Superato il technical screen! System design interview con il CTO la settimana prossima.',
      'Offerta ricevuta: €65k + stock options. Deadline risposta: 30 aprile.',
    ],
  },
  {
    title: 'Frontend Engineer',
    company: 'Satispay',
    location: 'Milano',
    status: 'INTERVIEW',
    matchScore: 75,
    appliedAt: new Date('2026-03-20'),
    description: `Satispay cerca Frontend Engineer per il team Merchant Dashboard.
Tech stack: React, TypeScript, MobX, Webpack, Jest. Focus su accessibilità (WCAG 2.1) e internazionalizzazione (i18n).
Esperienza richiesta: 3+ anni in React, conoscenza REST API, metodologie agile.`,
    matchingSkills: ['React', 'TypeScript', 'Jest', 'REST API'],
    missingSkills: ['MobX', 'Accessibilità WCAG', 'i18n'],
    explanation: 'Buon match sullo stack base, ma MobX e accessibilità sono requisiti espliciti.',
    suggestion: 'Studia i fondamenti WCAG 2.1 e aggiungi un esempio di implementazione nel portfolio.',
    notes: ['Primo colloquio HR andato bene. Technical round fissato tra 1 settimana.'],
  },
  {
    title: 'Full Stack Developer',
    company: 'Facile.it',
    location: 'Milano (Hybrid)',
    status: 'SCREENING',
    matchScore: 68,
    appliedAt: new Date('2026-03-25'),
    description: `Full Stack Developer per il team Growth Engineering.
Frontend: React, TypeScript. Backend: Node.js, Python, PostgreSQL, Redis.
Cerchiamo chi sa lavorare su frontend e backend, con focus su A/B testing e analytics di prodotto.
Esperienza: 2+ anni. Python considerato un plus forte.`,
    matchingSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    missingSkills: ['Python', 'Redis', 'A/B testing'],
    explanation: 'Forte lato frontend, più debole sul backend Python e sull\'infrastruttura Redis.',
    suggestion: 'Aggiungi Redis a un progetto esistente e documenta una feature con A/B test nel README.',
    notes: [],
  },
  {
    title: 'UI Engineer — Design System',
    company: 'idealo',
    location: 'Berlino (Remote friendly)',
    status: 'SCREENING',
    matchScore: 73,
    appliedAt: new Date('2026-04-05'),
    description: `idealo cerca UI Engineer per il Design System team.
Stack: React, TypeScript, CSS-in-JS (Styled Components), Storybook, testing accessibilità.
Cerchiamo chi sa costruire componenti riusabili, documentarli con Storybook e mantenerli su larga scala.`,
    matchingSkills: ['React', 'TypeScript', 'CSS avanzato'],
    missingSkills: ['Styled Components', 'Storybook', 'Design System'],
    explanation: 'Buon profilo ma manca esperienza specifica con design system enterprise e CSS-in-JS.',
    suggestion: 'Crea una libreria di componenti con Storybook e pubblicala su npm come portfolio.',
    notes: [],
  },
  {
    title: 'React Developer',
    company: 'Musixmatch',
    location: 'Bologna (Remote)',
    status: 'APPLIED',
    matchScore: 71,
    appliedAt: new Date('2026-04-01'),
    description: `Musixmatch cerca React Developer per la piattaforma web principale.
Requisiti: React 17+, Redux Toolkit, TypeScript, REST/GraphQL API, responsive design, Storybook.
Nice to have: Electron, internazionalizzazione, Web Audio API.`,
    matchingSkills: ['React', 'TypeScript', 'REST API'],
    missingSkills: ['Redux Toolkit', 'Storybook', 'Electron'],
    explanation: 'Skill base solide, ma Redux Toolkit e Storybook sono richiesti esplicitamente.',
    suggestion: 'Migra uno dei tuoi progetti da Context API a Redux Toolkit per dimostrare la skill.',
    notes: [],
  },
  {
    title: 'Software Engineer Frontend',
    company: 'Scalapay',
    location: 'Milano',
    status: 'APPLIED',
    matchScore: 82,
    appliedAt: new Date('2026-04-03'),
    description: `Scalapay cerca Software Engineer Frontend per scalare la piattaforma fintech.
Stack: React, TypeScript, Next.js, TailwindCSS, Playwright. Forte focus su performance e testing E2E.
Esperienza: 3+ anni, mentalità product-driven, capacità di lavorare in autonomia.`,
    matchingSkills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS'],
    missingSkills: ['Playwright', 'testing E2E avanzato'],
    explanation: 'Match eccellente sullo stack, il gap principale è Playwright vs Cypress.',
    suggestion: 'Converti i test Cypress del portfolio a Playwright per allinearti allo stack richiesto.',
    notes: [],
  },
  {
    title: 'React Developer (Remote)',
    company: 'Translated',
    location: 'Roma (Full Remote)',
    status: 'APPLIED',
    matchScore: 66,
    appliedAt: new Date('2026-04-08'),
    description: `Translated cerca React Developer per il team CAT Tools.
Stack: React, TypeScript, WebSockets, WebWorkers, IndexedDB, performance optimization.
Ruolo tecnico su prodotti per traduttori professionali. Forte focus su performance browser.`,
    matchingSkills: ['React', 'TypeScript', 'JavaScript avanzato'],
    missingSkills: ['WebWorkers', 'IndexedDB', 'WebSockets'],
    explanation: 'Buona base ma le API browser avanzate (WebWorkers, IndexedDB) non sono nel portfolio.',
    suggestion: 'Implementa un piccolo demo con WebWorker per offload di task pesanti.',
    notes: [],
  },
  {
    title: 'Frontend Developer',
    company: 'Casavo',
    location: 'Milano',
    status: 'REJECTED',
    matchScore: 44,
    appliedAt: new Date('2026-03-10'),
    description: `Casavo cerca Frontend Developer con forte esperienza in Vue.js 3 e Nuxt.
Requisiti: Vue.js 3 composition API, Nuxt 3, Pinia, TypeScript, unit testing, design system Vue.
Il ruolo non è adatto per chi viene solo da React — Vue è il framework core del team.`,
    matchingSkills: ['TypeScript', 'Jest'],
    missingSkills: ['Vue.js 3', 'Nuxt 3', 'Pinia', 'Composition API'],
    explanation: 'Gap critico: il ruolo richiede Vue.js come skill primaria, non React.',
    suggestion: 'Per ruoli Vue, investi 2-3 settimane su Vue 3 + Nuxt prima di candidarti.',
    notes: ['Feedback HR: "profilo ottimo ma cerchiamo uno specialista Vue, non React."'],
  },
  {
    title: 'Frontend Engineer Platform',
    company: 'Subito.it',
    location: 'Milano',
    status: 'REJECTED',
    matchScore: 52,
    appliedAt: new Date('2026-03-05'),
    description: `Cerchiamo Frontend Engineer per il team Platform di Subito.it.
Requisiti: React, TypeScript, micro-frontend (Webpack Module Federation), performance (Core Web Vitals), 4+ anni.
Background in prodotti large-scale con milioni di utenti giornalieri.`,
    matchingSkills: ['React', 'TypeScript'],
    missingSkills: ['Micro-frontend', 'Webpack Module Federation', 'Core Web Vitals avanzato'],
    explanation: 'Stack base ok, ma l\'architettura micro-frontend è un requisito non negoziabile.',
    suggestion: 'Crea un demo con Module Federation (2 micro-frontend comunicanti) e mettilo nel portfolio.',
    notes: ['Feedback: anni di esperienza insufficienti per il livello architetturale richiesto.'],
  },
]

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local'
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Create or retrieve the demo auth user
  let userId: string

  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Marco Demo' },
  })

  if (createError) {
    if (!createError.message.toLowerCase().includes('already')) {
      throw createError
    }
    // User exists — find them
    const { data: listData } = await supabase.auth.admin.listUsers()
    const existing = listData?.users.find((u) => u.email === DEMO_EMAIL)
    if (!existing) throw new Error('Could not find existing demo user')
    userId = existing.id
    console.log(`✓ Demo user already exists (${userId})`)
  } else {
    userId = createData.user.id
    console.log(`✓ Demo user created (${userId})`)
  }

  // Wipe existing demo data to allow re-running the script
  await prisma.user.deleteMany({ where: { id: userId } })
  console.log('✓ Cleared existing demo data')

  // Create user record in public DB
  await prisma.user.create({
    data: { id: userId, email: DEMO_EMAIL, name: 'Marco Demo' },
  })

  // Create a realistic resume
  const resume = await prisma.resume.create({
    data: {
      userId,
      fileUrl: 'https://placehold.co/1/1/pdf',
      fileName: 'Marco_Bianchi_CV_2026.pdf',
      extractedText: `Marco Bianchi — Frontend Developer Senior
3 anni di esperienza in React 18, TypeScript e Next.js su prodotti SaaS B2B.
Ho costruito dashboard complesse, sistemi di design e pipeline CI/CD su GitHub Actions.
Deploy su AWS (S3, CloudFront, Lambda), testing con Jest e Cypress, state management con Zustand e React Query.`,
      skills: [
        'React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Node.js',
        'PostgreSQL', 'Prisma', 'Git', 'Jest', 'Cypress',
        'AWS', 'Docker', 'REST API', 'Zustand', 'React Query',
      ],
      rawAnalysis: {
        experience: [
          'Frontend Developer Senior — Startup SaaS B2B (2023–2026)',
          'Frontend Developer — Web Agency (2022–2023)',
        ],
        education: ['Laurea Triennale Informatica — Università di Milano (2022)'],
        summary: 'Frontend Developer con 3 anni di esperienza specializzato in React e TypeScript.',
      },
    },
  })
  console.log('✓ Resume created')

  // Create applications
  for (const app of applications) {
    const jobPosting = await prisma.jobPosting.create({
      data: {
        title: app.title,
        company: app.company,
        location: app.location,
        description: app.description,
        skills: app.matchingSkills,
      },
    })

    const matchAnalysis =
      app.matchScore !== null
        ? {
            score: app.matchScore,
            matchingSkills: app.matchingSkills,
            missingSkills: app.missingSkills,
            explanation: app.explanation,
            suggestion: app.suggestion,
          }
        : null

    const application = await prisma.application.create({
      data: {
        userId,
        jobPostingId: jobPosting.id,
        resumeId: resume.id,
        status: app.status as 'SAVED' | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED',
        matchScore: app.matchScore,
        matchAnalysis: matchAnalysis ?? undefined,
        appliedAt: app.appliedAt,
      },
    })

    for (const content of app.notes) {
      await prisma.note.create({ data: { applicationId: application.id, content } })
    }

    console.log(`  ✓ ${app.status.padEnd(10)} ${app.company} — ${app.title}`)
  }

  console.log('\n✅ Seed completato. Demo account pronto:')
  console.log(`   Email:    ${DEMO_EMAIL}`)
  console.log(`   Password: ${DEMO_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed fallito:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

import { config } from 'dotenv'
config({ path: '.env.local' })

import pg from 'pg'

async function main() {
  const client = new pg.Client({ connectionString: process.env.DIRECT_URL })
  await client.connect()

  const policies = [
    `CREATE POLICY "auth users can upload resumes" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1])`,
    `CREATE POLICY "public can read resumes" ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'resumes')`,
  ]

  for (const sql of policies) {
    try {
      await client.query(sql)
      console.log('✓ Policy created')
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('already exists')) {
        console.log('✓ Policy already exists, skipping')
      } else {
        throw e
      }
    }
  }

  await client.end()
  console.log('✅ Storage policies ready')
}

main().catch((e) => { console.error('❌', e.message); process.exit(1) })

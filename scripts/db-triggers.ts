import { config } from 'dotenv'
config({ path: '.env.local' })

import pg from 'pg'

async function main() {
  const client = new pg.Client({ connectionString: process.env.DIRECT_URL })
  await client.connect()

  await client.query(`
    CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      INSERT INTO public."User" (id, email, name, "createdAt")
      VALUES (
        NEW.id,
        NEW.email,
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        NOW()
      )
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $$;
  `)
  console.log('✓ Function handle_new_auth_user ready')

  await client.query(`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`)
  await client.query(`
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
  `)
  console.log('✓ Trigger on_auth_user_created installed')

  // Backfill any existing auth users that never got a public.User row
  const { rowCount } = await client.query(`
    INSERT INTO public."User" (id, email, name, "createdAt")
    SELECT
      u.id,
      u.email,
      NULLIF(u.raw_user_meta_data->>'full_name', ''),
      NOW()
    FROM auth.users u
    LEFT JOIN public."User" p ON p.id = u.id
    WHERE p.id IS NULL AND u.email IS NOT NULL;
  `)
  console.log(`✓ Backfilled ${rowCount ?? 0} existing auth users`)

  await client.end()
  console.log('✅ DB triggers ready')
}

main().catch((e) => { console.error('❌', e.message); process.exit(1) })

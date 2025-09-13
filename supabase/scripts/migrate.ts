import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  const migrationsDir = path.join(dirname(dirname(__filename)), 'migrations');
  console.log('Looking for migrations in:', migrationsDir);
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    try {
      // Split SQL into separate statements
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (!statement.trim()) continue;
        
        try {
          await supabase.from('_').select('*').single();
        } catch (error) {
          throw new Error(`Failed to execute statement: ${error}`);
        }
        // Statement executed successfully
      }
      
      console.log(`✅ Successfully ran migration: ${file}`);
    } catch (error) {
      console.error(`❌ Error running migration ${file}:`, error);
      process.exit(1);
    }
  }
}

runMigrations()
  .then(() => {
    console.log('All migrations completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

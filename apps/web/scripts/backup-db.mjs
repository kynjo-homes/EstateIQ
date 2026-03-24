import { execSync } from 'child_process'
import { writeFileSync } from 'fs'

const dbUrl  = process.env.DATABASE_URL
const date   = new Date().toISOString().split('T')[0]
const file   = `backup-${date}.sql`

if (!dbUrl) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

try {
  console.log(`Creating backup: ${file}`)
  execSync(`pg_dump "${dbUrl}" > ${file}`)
  console.log(`Backup complete: ${file}`)
  console.log(`File size: ${(require('fs').statSync(file).size / 1024 / 1024).toFixed(2)}MB`)
} catch (err) {
  console.error('Backup failed:', err.message)
  process.exit(1)
}
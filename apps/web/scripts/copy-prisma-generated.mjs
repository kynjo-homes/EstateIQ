/**
 * Netlify / Next serverless: Prisma resolves engines under apps/web (see error:
 * /var/task/apps/web/src/generated/prisma). Copy the monorepo-generated client + binaries
 * here before `next build` so the query engine is present in the deployment bundle.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.join(__dirname, '..')
const src = path.join(webRoot, '../../packages/database/src/generated/prisma')
const dest = path.join(webRoot, 'src/generated/prisma')

if (!fs.existsSync(src)) {
  console.error('[copy-prisma-generated] Missing Prisma output:', src)
  console.error('Run: npx prisma generate --schema=../../packages/database/prisma/schema.prisma')
  process.exit(1)
}

fs.mkdirSync(path.dirname(dest), { recursive: true })
fs.rmSync(dest, { recursive: true, force: true })
fs.cpSync(src, dest, { recursive: true })
console.log('[copy-prisma-generated] Copied query engines to', dest)

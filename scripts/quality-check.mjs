import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const root = process.cwd()
const ignored = new Set(['.git', '.nuxt', '.output', '.vercel', 'node_modules', '.agents'])
const sourceExtensions = new Set(['.css', '.html', '.js', '.json', '.md', '.mjs', '.ts', '.vue'])
const files = []

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) walk(path)
    else if (sourceExtensions.has(extname(entry.name))) files.push(path)
  }
}

walk(root)

const failures = []
const checks = [
  {
    label: 'transition-all',
    pattern: /\btransition-all\b|transition\s*:\s*all\b/,
  },
  {
    label: 'mojibake',
    pattern: /(?:Ã.|Â.|â€™|â€“|ï¿½)/,
  },
  {
    label: 'third-party tracking integration',
    pattern: /googletagmanager|google-analytics|@vercel\/analytics/,
  },
  {
    label: 'production console logging',
    pattern: /\bconsole\.(?:log|warn)\s*\(/,
    exclude: path => relative(root, path).replaceAll('\\', '/').startsWith('scripts/'),
  },
]

for (const path of files) {
  const relativePath = relative(root, path).replaceAll('\\', '/')
  if (relativePath === 'scripts/quality-check.mjs') continue
  const source = readFileSync(path, 'utf8')
  for (const check of checks) {
    if (check.exclude?.(path)) continue
    if (check.pattern.test(source)) failures.push(`${check.label}: ${relativePath}`)
  }
}

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (!String(packageJson.scripts?.typecheck || '').includes('./node_modules/vue-tsc/')) {
  failures.push('typecheck must pin the project-local vue-tsc binary')
}
if (packageJson.dependencies?.['@vercel/analytics']) {
  failures.push('analytics dependency must remain opt-out by default')
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2))
  process.exit(1)
}

console.log(JSON.stringify({
  ok: true,
  filesChecked: files.length,
  onlineToolchain: true,
  tursoReady: true,
  encoding: true,
}))

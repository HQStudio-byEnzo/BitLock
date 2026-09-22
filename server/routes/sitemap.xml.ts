const publicRoutes = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/features', priority: '0.9', changefreq: 'weekly' },
  { loc: '/features/links', priority: '0.8', changefreq: 'weekly' },
  { loc: '/features/passwords', priority: '0.8', changefreq: 'weekly' },
  { loc: '/features/crypto', priority: '0.8', changefreq: 'weekly' },
  { loc: '/features/encryption', priority: '0.8', changefreq: 'weekly' },
  { loc: '/features/favorites', priority: '0.7', changefreq: 'weekly' },
  { loc: '/features/recovery', priority: '0.7', changefreq: 'weekly' },
  { loc: '/generateur-mot-de-passe', priority: '0.9', changefreq: 'weekly' },
  { loc: '/generateur-seed-phrase', priority: '0.9', changefreq: 'weekly' },
  { loc: '/audit-securite', priority: '0.8', changefreq: 'weekly' },
  { loc: '/support', priority: '0.6', changefreq: 'weekly' },
  { loc: '/guides', priority: '0.7', changefreq: 'weekly' },
  { loc: '/guides/stocker-seed-phrase', priority: '0.8', changefreq: 'monthly' },
  { loc: '/guides/gerer-ses-mots-de-passe', priority: '0.8', changefreq: 'monthly' },
  { loc: '/guides/alternative-bitwarden', priority: '0.7', changefreq: 'monthly' },
  { loc: '/guides/comparatif-coffre-fort-mots-de-passe', priority: '0.7', changefreq: 'monthly' },
  { loc: '/legal/cgu', priority: '0.4', changefreq: 'monthly' },
  { loc: '/legal/confidentialite', priority: '0.4', changefreq: 'monthly' },
  { loc: '/legal/mentions-legales', priority: '0.4', changefreq: 'monthly' },
  { loc: '/legal/notices', priority: '0.4', changefreq: 'monthly' },
]

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

export default defineEventHandler((event) => {
  const appUrl = String(useRuntimeConfig(event).appUrl || 'http://localhost:3000').replace(/\/+$/, '')
  const today = formatDate(new Date())
  const urls = publicRoutes
    .map(route => `  <url>
    <loc>${appUrl}${route.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`)
    .join('\n')

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
})

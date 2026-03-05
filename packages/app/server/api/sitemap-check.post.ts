import { validateUrlWithDns } from '../utils/url'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.url) {
    throw createError({ statusCode: 400, message: 'URL required' })
  }

  let origin: string
  try {
    origin = new URL(body.url).origin
  } catch {
    return { found: false, sitemapUrl: null, urlCount: 0 }
  }

  const sitemapUrl = `${origin}/sitemap.xml`

  // SSRF protection — validate before fetching
  try {
    await validateUrlWithDns(sitemapUrl)
  } catch {
    return { found: false, sitemapUrl, urlCount: 0 }
  }

  try {
    const response = await $fetch.raw(sitemapUrl, {
      timeout: 5000,
      redirect: 'follow',
      responseType: 'text',
    })

    const contentType = response.headers.get('content-type') || ''
    const text = (response._data as string) || ''

    if (!contentType.includes('xml') && !text.includes('<urlset') && !text.includes('<sitemapindex')) {
      return { found: false, sitemapUrl, urlCount: 0 }
    }

    // Count <loc> entries
    const urlCount = (text.match(/<loc>/gi) || []).length

    return { found: true, sitemapUrl, urlCount }
  } catch {
    return { found: false, sitemapUrl, urlCount: 0 }
  }
})

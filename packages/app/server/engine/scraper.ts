import { fetchPage } from './fetcher'
import { extractContent } from './extractor'
import { toMarkdown } from './converter'

export interface ScrapeConfig {
  include_links?: boolean
  include_images?: boolean
  selectors?: {
    include?: string
    exclude?: string
  }
}

export interface ScrapeResult {
  title: string
  markdown: string
  rawHtml: string
  wordCount: number
  metadata: Record<string, any>
}

function yamlEscape(value: string): string {
  if (/[:#\[\]{}&*!|>'"%@`]/.test(value) || value.includes('\n')) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return value
}

function buildFrontmatter(fields: Record<string, string | null | undefined>): string {
  const lines = ['---']
  for (const [key, value] of Object.entries(fields)) {
    if (value) {
      lines.push(`${key}: ${yamlEscape(value)}`)
    }
  }
  lines.push('---')
  return lines.join('\n')
}

export async function scrape(url: string, config: ScrapeConfig): Promise<ScrapeResult> {
  const html = await fetchPage(url)
  const extracted = extractContent(html, url, config)
  const bodyMarkdown = toMarkdown(extracted.content, config)
  const scrapedAt = new Date().toISOString()

  const frontmatter = buildFrontmatter({
    title: extracted.title,
    url,
    canonical: extracted.pageMeta.canonical,
    description: extracted.excerpt,
    author: extracted.byline,
    site: extracted.siteName,
    language: extracted.pageMeta.language,
    type: extracted.pageMeta.ogType,
    image: extracted.pageMeta.ogImage,
    published: extracted.pageMeta.publishedTime,
    modified: extracted.pageMeta.modifiedTime,
    scraped_at: scrapedAt,
    scraper: 'ForgeCrawl/0.1.0',
  })

  const markdown = `${frontmatter}\n\n${bodyMarkdown}`

  return {
    title: extracted.title,
    markdown,
    rawHtml: html,
    wordCount: bodyMarkdown.split(/\s+/).filter(Boolean).length,
    metadata: {
      url,
      canonical: extracted.pageMeta.canonical,
      excerpt: extracted.excerpt,
      byline: extracted.byline,
      siteName: extracted.siteName,
      language: extracted.pageMeta.language,
      ogImage: extracted.pageMeta.ogImage,
      publishedTime: extracted.pageMeta.publishedTime,
      scrapedAt,
    },
  }
}

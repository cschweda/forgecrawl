import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import * as cheerio from 'cheerio'
import type { ScrapeConfig } from './scraper'

function getCleanBodyHtml(html: string) {
  const $ = cheerio.load(html)
  $('script, style, noscript, iframe, svg').remove()
  $('[role="navigation"], [aria-hidden="true"]').remove()
  return {
    $,
    html: $('body').html() || $.html(),
    text: $('body').text().replace(/\s+/g, ' ').trim(),
  }
}

export interface ExtractedMeta {
  canonical: string | null
  description: string | null
  language: string | null
  ogImage: string | null
  ogType: string | null
  publishedTime: string | null
  modifiedTime: string | null
}

function extractPageMeta($: cheerio.CheerioAPI): ExtractedMeta {
  return {
    canonical: $('link[rel="canonical"]').attr('href') || $('meta[property="og:url"]').attr('content') || null,
    description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || null,
    language: $('html').attr('lang') || $('meta[property="og:locale"]').attr('content') || null,
    ogImage: $('meta[property="og:image"]').attr('content') || null,
    ogType: $('meta[property="og:type"]').attr('content') || null,
    publishedTime: $('meta[property="article:published_time"]').attr('content') || $('meta[name="date"]').attr('content') || null,
    modifiedTime: $('meta[property="article:modified_time"]').attr('content') || null,
  }
}

export function extractContent(html: string, url: string, config: ScrapeConfig) {
  const $ = cheerio.load(html)
  const pageMeta = extractPageMeta($)

  // Pre-process: remove excluded selectors
  if (config.selectors?.exclude) {
    $(config.selectors.exclude).remove()
  }

  // Narrow to include selector if specified
  let processedHtml: string
  if (config.selectors?.include) {
    const selected = $(config.selectors.include).html()
    processedHtml = selected || $.html()
  } else {
    processedHtml = $.html()
  }

  // Get the full cleaned body text length for comparison
  const fullBody = getCleanBodyHtml(processedHtml)

  // Try Readability
  const dom = new JSDOM(processedHtml, { url })
  const reader = new Readability(dom.window.document)
  const article = reader.parse()

  // Use Readability only if it captures a meaningful portion of the page content.
  // If Readability returns less than 40% of the visible body text, it's likely
  // dropping significant sections (footers with real content, sidebars, etc.)
  const readabilityTextLen = article?.textContent?.trim().length || 0
  const fullBodyTextLen = fullBody.text.length || 1
  const captureRatio = readabilityTextLen / fullBodyTextLen

  if (article && article.content && readabilityTextLen > 200 && captureRatio > 0.4) {
    return {
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      byline: article.byline,
      siteName: article.siteName,
      pageMeta,
    }
  }

  // Fallback: use the full cleaned body content
  // This captures everything from non-article pages (government sites, landing pages, etc.)
  const content = fullBody.html

  if (!content) {
    throw new Error('Could not extract content from page')
  }

  const $meta = cheerio.load(processedHtml)
  const title = $meta('h1').first().text().trim()
    || $meta('title').text().trim()
    || article?.title
    || ''

  return {
    title,
    content,
    excerpt: article?.excerpt || pageMeta.description || null,
    byline: article?.byline || null,
    siteName: article?.siteName || $meta('meta[property="og:site_name"]').attr('content') || null,
    pageMeta,
  }
}

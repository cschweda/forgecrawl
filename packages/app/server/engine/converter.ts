import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import type { ScrapeConfig } from './scraper'

export function toMarkdown(html: string, config: ScrapeConfig): string {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
  })

  turndown.use(gfm)

  // Remove images if not requested
  if (!config.include_images) {
    turndown.addRule('removeImages', {
      filter: 'img',
      replacement: () => '',
    })
  }

  // Remove links if not requested (keep text)
  if (config.include_links === false) {
    turndown.addRule('removeLinks', {
      filter: 'a',
      replacement: (_content: string) => _content,
    })
  }

  let markdown = turndown.turndown(html)

  // Clean up excessive whitespace
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')

  return markdown
}

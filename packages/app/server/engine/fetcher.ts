export async function fetchPage(url: string): Promise<string> {
  const config = useRuntimeConfig()

  const response = await $fetch.raw(url, {
    headers: {
      'User-Agent': config.scrapeUserAgent,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    timeout: config.scrapeTimeout,
    redirect: 'follow',
    responseType: 'text',
  })

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
    throw new Error(`Unsupported content type: ${contentType}`)
  }

  return response._data as string
}

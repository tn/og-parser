import { VercelRequest, VercelResponse } from '@vercel/node'
import ogp from 'open-graph-scraper'

type Result = Partial<ogp.OpenGraphProperties & ogp.OpenGraphImage> | { success: boolean }

type Query = {
  urls: string
  fields: string
}

export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  const { urls, fields } = req.query as Query
  const resources = urls.split(',')
  const selectors = fields
    .split(',')
    .map(f => f.replace(/([-_][a-z])/ig, $1 => $1.toUpperCase().replace('-', '').replace('_', '')))

  const promises: Promise<ogp.SuccessResult | ogp.ErrorResult>[] = []
  const results: Result[] = []

  for (const url of resources) {
    promises.push(ogp({ url }))
  }

  /**
   * We take all responses: succesful and failed as well
   */
  try {
    const settles = await Promise.allSettled(promises)

    for (const settled of settles) {
      if (settled.status === 'fulfilled') {
        const { error, result } = settled.value

        if (error || !result.success) {
          results.push({ success: false })
        } else if (result.success) {
          results.push({
            success: true,
            ...Object.entries(result).filter(([k]) => selectors.some(s => s === k)).reduce((acc, curr) => ({ ...acc, [curr[0]]: curr[1] }), {})
          })
        }
      } else {
        results.push({ success: false })
      }
    }

    /**
     * Cache our response because parsing websites is heavey operation
     * and we don't want to be blocked by resources for frequent requests
     * @see https://vercel.com/docs/edge-network/caching
     */
     res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
     res.json(results)
  } catch {
    res.writeHead(400)
    res.end()
  }
}

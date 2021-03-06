import queryString from 'query-string'
import { ImgLiteThumbnailOptions } from './__types'
import { checkWebPSupport } from 'supports-webp-sync'

const hasWebPSupport = checkWebPSupport()

function getImageAddress(url: string) {
  const isHttpUrl = /^http/i.test(url)
  if (isHttpUrl) return url

  const origin = globalThis && globalThis.location ? globalThis.location.origin : ''
  if (!origin) return url

  const hasInitialSlash = /^\//.test(url)
  return `${origin}${hasInitialSlash ? '' : '/'}${url}`
}

export default function (
  url: string,
  { sizingStep, density = 1, width = 0, height = 0, ...options }: ImgLiteThumbnailOptions = {}
) {
  const isLocalFile =
    globalThis && globalThis.location && /localhost/.test(globalThis.location.host) && url && !/^http/i.test(url)
  const isBlobOrDataUrl = url && /^(blob|data):/i.test(url)
  const isSvg = url && /\.svg$/.test(url)

  if (!url || isLocalFile || isSvg || isBlobOrDataUrl) {
    return url
  }

  const biggestDim = Math.max.call(null, width, height)
  const _sizingStep = sizingStep || biggestDim < 1000 ? 100 : 200

  return queryString.stringifyUrl(
    {
      url: 'https://cdn.avantstay.dev/',
      query: {
        ...options,
        ...(hasWebPSupport ? { format: 'Webp' } : {}),
        ...(height ? { 'size[height]': density * Math.ceil(height / _sizingStep) * _sizingStep } : {}),
        ...(width ? { 'size[width]': density * Math.ceil(width / _sizingStep) * _sizingStep } : {}),
        image_address: getImageAddress(url),
      } as any,
    },
    { skipEmptyString: true }
  )
}

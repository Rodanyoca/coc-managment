// Next.js' own offline test seam. Compilation only: these are not real fonts.
// Never deploy an artifact produced with NEXT_FONT_GOOGLE_MOCKED_RESPONSES.
module.exports = new Proxy({}, {
  get(_target, url) {
    if (typeof url !== 'string' || !url.startsWith('https://fonts.googleapis.com/')) return undefined
    const mono = url.includes('Geist+Mono')
    return `/* latin */\n@font-face { font-family: '${mono ? 'Geist Mono' : 'Geist'}'; font-style: normal; font-weight: 100 900; font-display: swap; src: url(https://offline.invalid/${mono ? 'mono' : 'sans'}.woff2) format('woff2'); }`
  },
})

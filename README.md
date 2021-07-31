# Open Graph Parser 
Using openGraphScraper and Vercel Functions

## Deploy to Vercel

```bash
git clone https://github.com/tn/og-parser.git
cd og-parser

# Development
vercel dev

# Staging
vercel

# Production
vercel --prod
```

## Usage

Just request `https://[YOUR_DOMAIN].vercel.app/api?urls=site1.com,site2.com&fields=og_title,og_image`

[Documentation of scraper and fields list](https://github.com/jshemas/openGraphScraper)

## Licence

MIT

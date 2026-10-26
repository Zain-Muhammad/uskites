# uskites
An online store for traditional Lahori kites, premium kite-flying accessories, and Basant essentials.

## Basant booking page

Static, dependency-free landing page (`index.html`). Open it directly in a browser or host it on any static host (Netlify, Vercel, GitHub Pages, cPanel).

### Everything is edited in one file: `assets/js/config.js`

| Setting | What it controls |
|---|---|
| `basantYear` | Every "Basant 2027" on the page: title, meta tags, headings, FAQ, WhatsApp messages, schema |
| `basantDates`, `datesConfirmed` | Countdown, dates list, "tentative" note, Event schema (only added once confirmed) |
| `whatsappNumber`, `whatsappDisplay` | All order buttons (`wa.me` links with a pre-filled order message) |
| `licence.*` | Licence section, hero badge, footer, FAQ, schema. Put a scan in `assets/images/` and set `licence.image` |
| `pickupAddress`, `deliveryAreas`, `businessHours`, `city`, `siteUrl` | Contact, delivery / pickup copy and SEO |
| `products[]` | Product cards. `price: null` shows "Best rate on WhatsApp"; set a number to show a price |

### Product photos
Each product has `images.front` and `images.back`. Replace the placeholder SVGs in `assets/images/kites/` with real photos (ideally square-ish, ~800px WebP/JPG) and update the paths in `config.js`.

### Also update when you go live
- `robots.txt` and `sitemap.xml`: replace `https://uskites.pk` with your real domain.
- Analytics (optional): add GA4 or a Meta Pixel to `<head>`. WhatsApp clicks are sent as `generate_lead` / `Lead` events automatically.

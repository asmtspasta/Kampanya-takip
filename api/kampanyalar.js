module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Cache-Control’, ‘s-maxage=3600’);

const havayollari = [
{
id: ‘ryanair’,
ad: ‘Ryanair’,
renk: ‘#073590’,
logo: ‘✈’,
url: ‘https://www.ryanair.com/gb/en/cheap-flights’,
rssUrl: ‘https://www.ryanair.com/gb/en/cheap-flights’,
kampanyaUrl: ‘https://www.ryanair.com/gb/en/cheap-flights’
},
{
id: ‘easyjet’,
ad: ‘easyJet’,
renk: ‘#FF6600’,
logo: ‘🟠’,
url: ‘https://www.easyjet.com/en/offers’,
kampanyaUrl: ‘https://www.easyjet.com/en/offers’
},
{
id: ‘vueling’,
ad: ‘Vueling’,
renk: ‘#FFD700’,
logo: ‘🟡’,
url: ‘https://www.vueling.com/en/vueling-promotions’,
kampanyaUrl: ‘https://www.vueling.com/en/vueling-promotions’
},
{
id: ‘transavia’,
ad: ‘Transavia’,
renk: ‘#00A650’,
logo: ‘🟢’,
url: ‘https://www.transavia.com/en-EU/offers/’,
kampanyaUrl: ‘https://www.transavia.com/en-EU/offers/’
},
{
id: ‘airfrance’,
ad: ‘Air France’,
renk: ‘#002157’,
logo: ‘🔵’,
url: ‘https://www.airfrance.fr/fr/special-offers’,
kampanyaUrl: ‘https://www.airfrance.fr/fr/special-offers’
}
];

// Google News RSS’den her havayolu için haber çek
const sonuclar = await Promise.all(
havayollari.map(async (havayolu) => {
try {
const query = encodeURIComponent(`${havayolu.ad} promotion offer campaign 2025`);
const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en&gl=FR&ceid=FR:en`;

```
    const response = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (!response.ok) throw new Error('RSS fetch failed');
    
    const xml = await response.text();
    const haberler = parseRSS(xml).slice(0, 5);
    
    return {
      ...havayolu,
      haberler,
      sonGuncelleme: new Date().toISOString(),
      durum: 'ok'
    };
  } catch (e) {
    return {
      ...havayolu,
      haberler: [],
      sonGuncelleme: new Date().toISOString(),
      durum: 'hata'
    };
  }
})
```

);

res.status(200).json({
guncelleme: new Date().toISOString(),
havayollari: sonuclar
});
}

function parseRSS(xml) {
const items = [];
const itemRegex = /<item>([\s\S]*?)</item>/g;
let match;

while ((match = itemRegex.exec(xml)) !== null) {
const item = match[1];
const title = extractTag(item, ‘title’);
const link = extractTag(item, ‘link’);
const pubDate = extractTag(item, ‘pubDate’);
const source = extractTag(item, ‘source’);

```
if (title) {
  items.push({
    baslik: cleanText(title),
    link: link || '#',
    tarih: pubDate ? formatDate(pubDate) : '',
    kaynak: source || 'Google News'
  });
}
```

}

return items;
}

function extractTag(xml, tag) {
const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, ‘i’);
const match = xml.match(regex);
return match ? match[1].trim() : ‘’;
}

function cleanText(text) {
return text.replace(/<[^>]+>/g, ‘’).replace(/&/g, ‘&’).replace(/</g, ‘<’).replace(/>/g, ‘>’).replace(/"/g, ‘”’).trim();
}

function formatDate(dateStr) {
try {
const d = new Date(dateStr);
return d.toLocaleDateString(‘tr-TR’, { day: ‘numeric’, month: ‘short’, year: ‘numeric’ });
} catch {
return dateStr;
}
}

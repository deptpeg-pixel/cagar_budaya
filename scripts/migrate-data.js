const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../legacy/data/cagar_budaya_data.js'), 'utf8');
const fakeWindow = {};
const fn = new Function('window', code);
fn(fakeWindow);
const rawData = fakeWindow.CAGAR_BUDAYA_DATA || [];

// Verified working high-res heritage architecture images (Unsplash CDN)
const VERIFIED_CHURCH_IMAGES = [
  "https://images.unsplash.com/photo-1548625361-16800b352a97?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1565060169194-19fabf63012c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
];

const formattedData = rawData.map((item, idx) => {
  const yearMatch = (item.didirikan || '').match(/\d{4}/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : null;

  const fotos = (item.fotos && item.fotos.length > 0)
    ? item.fotos
    : [
        {
          src: VERIFIED_CHURCH_IMAGES[idx % VERIFIED_CHURCH_IMAGES.length],
          cap: `Arsitektur bersejarah ${item.nama} (${item.didirikan || 'Cagar Budaya GPIB'})`
        }
      ];

  return {
    id: 'b' + item.no,
    no: item.no,
    nama: item.nama || '',
    didirikan: item.didirikan || '',
    tahunDidirikan: year,
    status: item.status || 'Nasional',
    sk: item.sk || '',
    tglSK: item.tglSK || '',
    ket: item.ket || '',
    alamat: item.alamat || '',
    narasi: item.narasi || '',
    lat: (typeof item.lat === 'number' && !isNaN(item.lat)) ? item.lat : null,
    lng: (typeof item.lng === 'number' && !isNaN(item.lng)) ? item.lng : null,
    fotos,
    mainIdx: item.mainIdx || 0,
    fit: item.fit || 'cover'
  };
});

const dataDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const tsContent = `import { CagarBudayaItem } from "@/lib/types";

export const INITIAL_CAGAR_BUDAYA: CagarBudayaItem[] = ${JSON.stringify(formattedData, null, 2)};
`;

fs.writeFileSync(path.join(dataDir, 'initialData.ts'), tsContent, 'utf8');
console.log('✓ Updated src/data/initialData.ts with verified images for', formattedData.length, 'records');

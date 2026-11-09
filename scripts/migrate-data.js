const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../legacy/data/cagar_budaya_data.js'), 'utf8');
const fakeWindow = {};
const fn = new Function('window', code);
fn(fakeWindow);
const rawData = fakeWindow.CAGAR_BUDAYA_DATA || [];

// Curated high-resolution architectural & historical church imagery
const CURATED_PHOTOS = {
  1: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Immanuel_Church_Jakarta_2018.jpg/1280px-Immanuel_Church_Jakarta_2018.jpg",
      cap: "Fasad Klasikisme bundar (rotunda) GPIB Immanuel Jakarta (Willemskerk, 1839) dengan serambi tiang Dorika"
    },
    {
      src: "https://images.unsplash.com/photo-1548625361-16800b352a97?auto=format&fit=crop&w=1200&q=85",
      cap: "Detail arsitektur kolonial klasik abad ke-19 dan kubah konsentris"
    }
  ],
  2: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Gereja_Blenduk_Semarang.jpg/1280px-Gereja_Blenduk_Semarang.jpg",
      cap: "Kubah tembaga oktagonal ikonik Gereja Blenduk (GPIB Immanuel Semarang, 1753) di kawasan Kota Lama"
    }
  ],
  3: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Zebaoth_Church_Bogor.jpg/1280px-Zebaoth_Church_Bogor.jpg",
      cap: "Gedung bersejarah GPIB Zebaoth Bogor (1920) di tepi Kebun Raya Bogor"
    }
  ],
  4: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Sion_Church_Jakarta.jpg/1280px-Sion_Church_Jakarta.jpg",
      cap: "GPIB Sion Jakarta (Portugeesche Buitenkerk, 1695) — gereja tertua yang masih aktif di Jakarta"
    }
  ],
  5: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Pniel_Church_Jakarta.jpg/1280px-Pniel_Church_Jakarta.jpg",
      cap: "GPIB Pniel Pasar Baru (Gereja Ayam, 1913) dengan arsitektur kolonial awal abad ke-20"
    }
  ],
  6: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Paulus_Church_Menteng_Jakarta.jpg/1280px-Paulus_Church_Menteng_Jakarta.jpg",
      cap: "GPIB Paulus Menteng Jakarta (1936) karya arsitek Frans Ghijsels bergaya Art Deco Tropis"
    }
  ]
};

// High-aesthetic architectural fallback gallery for historical churches
const HERITAGE_FALLBACK_POOL = [
  "https://images.unsplash.com/photo-1548625361-16800b352a97?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1565060169194-19fabf63012c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
];

const formattedData = rawData.map((item, idx) => {
  const yearMatch = (item.didirikan || '').match(/\d{4}/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : null;

  let fotos = item.fotos && item.fotos.length > 0 ? item.fotos : [];
  if (fotos.length === 0) {
    if (CURATED_PHOTOS[item.no]) {
      fotos = CURATED_PHOTOS[item.no];
    } else {
      fotos = [
        {
          src: HERITAGE_FALLBACK_POOL[idx % HERITAGE_FALLBACK_POOL.length],
          cap: `Ilustrasi arsitektur bersejarah ${item.nama} (${item.didirikan || 'Cagar Budaya GPIB'})`
        }
      ];
    }
  }

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
console.log('✓ Enriched src/data/initialData.ts with curated photos for', formattedData.length, 'records');

import { PrismaClient, UserRole } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

/**
 * SEED Ã¢â‚¬â€ 100 demo products across 10 categories. All names begin with "[DEMO]".
 * Prices in KES. Images from Unsplash (real photos, generic placeholders).
 * Remove with: npx prisma migrate reset --force
 */

const IMG = {
  women: [
    "photo-1595777457583-95e059d581b8", "photo-1572804013309-59a88b7e92f1",
    "photo-1594633312681-425c7b97ccd1", "photo-1490481651871-ab68de25d43d",
    "photo-1539109136881-3be0616acf4b", "photo-1483985988355-763728e1935b",
    "photo-1469334031218-e382a71b716b", "photo-1485230895905-ec40ba36b9bc",
    "photo-1524504388940-b1c1722653e1", "photo-1515886657613-9f3515b0c78f"
  ],
  men: [
    "photo-1507003211169-0a1dd7228f2d", "photo-1488161628813-04466f872be2",
    "photo-1492562080023-ab3db95bfbce", "photo-1500648767791-00dcc994a43e",
    "photo-1519085360753-af0119f7cbe7", "photo-1531297484001-80022131f5a1",
    "photo-1521572163474-6864f9cf17ab", "photo-1503341504253-dff4815485f1",
    "photo-1547949003-9792a18a2601", "photo-1578681994506-b8f463449011"
  ],
  shoes: [
    "photo-1549298916-b41d501d3772", "photo-1560343090-f0409e92791a",
    "photo-1600185365483-26d7a4cc7519", "photo-1595950653106-6c9ebd614d3a",
    "photo-1552346154-21d32810aba3", "photo-1608231387042-66d1773070a5",
    "photo-1460353581641-37baddab0fa2", "photo-1491553895911-0055eca6402d",
    "photo-1543163521-1bf539c55dd2", "photo-1525966222134-fcfa99b8ae77"
  ],
  bags: [
    "photo-1548036328-c9fa89d128fa", "photo-1591561954557-26941169b49e",
    "photo-1590874103328-eac38a683ce7", "photo-1584917865442-de89df76afd3",
    "photo-1547949003-9792a18a2601", "photo-1553062407-98eeb64c6a62",
    "photo-1548863227-3af567fc3b27", "photo-1594223274512-ad4803739b7c",
    "photo-1566150905458-1bf1fc113f0d", "photo-1614179689702-355944cd0918"
  ],
  jewellery: [
    "photo-1515562141207-7a88fb7ce338", "photo-1611591437281-460bfbe1220a",
    "photo-1535632066927-ab7c9ab60908", "photo-1573408301185-9146fe634ad0",
    "photo-1602173574767-37ac01994b2a", "photo-1599643478518-a784e5dc4c8f",
    "photo-1594736797933-d0401ba2fe65", "photo-1617038260897-41a1f14a8ca0",
    "photo-1633934542430-0905ccb5f050", "photo-1622434641406-a158123450f9"
  ],
  watches: [
    "photo-1524805444758-089113d48a6d", "photo-1523170335258-f5ed11844a49",
    "photo-1522312346375-d1a52e2b99b3", "photo-1547996160-81dfa63595aa",
    "photo-1434056886845-dac89ffe9b56", "photo-1594534475808-b18fc33b045e",
    "photo-1548171915-e79a380a2a4b", "photo-1622434641406-a158123450f9",
    "photo-1612817159949-195b6eb9e31a", "photo-1533139502658-0198f920d8e8"
  ],
  beauty: [
    "photo-1596462502278-27bfdc403348", "photo-1522337360788-8b13dee7a37e",
    "photo-1571781926291-c477ebfd024b", "photo-1512496015851-a90fb38ba796",
    "photo-1631730359585-38a4935cbec4", "photo-1598440947619-2c35fc9aa908",
    "photo-1620916566398-39f1143ab7be", "photo-1610705267928-1b9f2fa7f1c5",
    "photo-1556228720-195a672e8a03", "photo-1526758097130-bab247274f58"
  ],
  home: [
    "photo-1555041469-a586c61ea9bc", "photo-1493663284031-b7e3aefcae8e",
    "photo-1567016432779-094069958ea5", "photo-1522708323590-d24dbb6b0267",
    "photo-1586023492125-27b2c045efd7", "photo-1505691938895-1758d7feb511",
    "photo-1616486338812-3dadae4b4ace", "photo-1615529182904-14819c35db37",
    "photo-1558618666-fcd25c85cd64", "photo-1540932239986-30128078f3c5"
  ],
  electronics: [
    "photo-1505740420928-5e560c06d30e", "photo-1546435770-a3e426bf472b",
    "photo-1511707171634-5f897ff02aa9", "photo-1523206489230-c012c64b2b48",
    "photo-1572569511254-d8f925fe2cbb", "photo-1606220588913-b3aacb4d2f46",
    "photo-1583394838336-acd977736f90", "photo-1588872657578-7efd1f1555ed",
    "photo-1618366712010-f4ae9c647dcb", "photo-1544244015-0df4b3ffc6b0"
  ],
  kids: [
    "photo-1519689680058-324335c77eba", "photo-1518831959646-742c3a14ebf7",
    "photo-1522771930-78848d9293e8", "photo-1471286174890-9c112ffca5b4",
    "photo-1503919545889-aef636e10ad4", "photo-1519238263530-99bdd11df2ea",
    "photo-1520006403909-838d6b92c22e", "photo-1514090458221-65bb69cf63e6",
    "photo-1476234251651-f353703a034d", "photo-1596870230751-ebdfce98ec42"
  ]
};

function unsplashUrl(photoId: string, w = 800, h = 1000): string {
  return `https://images.unsplash.com/${photoId}?w=${w}&h=${h}&fit=crop&crop=entropy&auto=format&q=80`;
}

type CategorySeed = {
  slug: string;
  name: string;
  products: Array<{
    slug: string;
    name: string;
    desc: string;
    priceKes: number;
    compareAtKes?: number;
    attrs: Record<string, string>;
    variants: Array<{ size?: string; colour?: string; stock: number }>;
  }>;
};

const catalogue: CategorySeed[] = [
  {
    slug: "women", name: "Women",
    products: [
      { slug: "linen-wrap-dress", name: "Linen Wrap Dress", desc: "Breathable linen wrap dress with tie belt.", priceKes: 3500, compareAtKes: 4500, attrs: { fabric: "Linen", fit: "True to size" }, variants: [
        { size: "S", colour: "Ivory", stock: 6 }, { size: "M", colour: "Ivory", stock: 8 }, { size: "L", colour: "Ivory", stock: 4 },
        { size: "S", colour: "Espresso", stock: 5 }, { size: "M", colour: "Espresso", stock: 7 }, { size: "L", colour: "Espresso", stock: 3 }
      ]},
      { slug: "satin-slip-dress", name: "Satin Slip Dress", desc: "Floor-length satin slip with cowl neck.", priceKes: 4800, attrs: { fabric: "Satin" }, variants: [
        { size: "S", colour: "Champagne", stock: 4 }, { size: "M", colour: "Champagne", stock: 6 }, { size: "L", colour: "Champagne", stock: 2 }
      ]},
      { slug: "cotton-blouse", name: "Cotton Poplin Blouse", desc: "Crisp cotton poplin blouse with pintuck detail.", priceKes: 2200, compareAtKes: 2800, attrs: { fabric: "Cotton" }, variants: [
        { size: "S", colour: "White", stock: 10 }, { size: "M", colour: "White", stock: 12 }, { size: "L", colour: "White", stock: 8 }
      ]},
      { slug: "wide-leg-trouser", name: "Wide-Leg Trouser", desc: "High-waisted wide-leg trousers.", priceKes: 3200, attrs: { fabric: "Wool blend" }, variants: [
        { size: "S", colour: "Black", stock: 6 }, { size: "M", colour: "Black", stock: 8 }, { size: "L", colour: "Black", stock: 4 }
      ]},
      { slug: "midi-skirt", name: "Pleated Midi Skirt", desc: "Pleated midi skirt with elastic waist.", priceKes: 2800, attrs: { fabric: "Polyester" }, variants: [
        { size: "S", colour: "Olive", stock: 5 }, { size: "M", colour: "Olive", stock: 7 }, { size: "L", colour: "Olive", stock: 3 }
      ]},
      { slug: "cashmere-cardigan", name: "Cashmere Cardigan", desc: "Soft cashmere cardigan with shell buttons.", priceKes: 6500, compareAtKes: 7800, attrs: { fabric: "Cashmere" }, variants: [
        { size: "S", colour: "Camel", stock: 3 }, { size: "M", colour: "Camel", stock: 4 }, { size: "L", colour: "Camel", stock: 2 }
      ]},
      { slug: "denim-jacket", name: "Denim Jacket", desc: "Classic denim jacket, vintage wash.", priceKes: 4200, attrs: { fabric: "Denim" }, variants: [
        { size: "S", colour: "Blue", stock: 4 }, { size: "M", colour: "Blue", stock: 6 }, { size: "L", colour: "Blue", stock: 3 }
      ]},
      { slug: "cable-knit-sweater", name: "Cable Knit Sweater", desc: "Chunky cable knit sweater.", priceKes: 3800, attrs: { fabric: "Wool" }, variants: [
        { size: "S", colour: "Cream", stock: 5 }, { size: "M", colour: "Cream", stock: 7 }, { size: "L", colour: "Cream", stock: 4 }
      ]},
      { slug: "midi-dress", name: "Floral Midi Dress", desc: "Floral print midi dress, tiered skirt.", priceKes: 4100, compareAtKes: 5200, attrs: { fabric: "Viscose" }, variants: [
        { size: "S", colour: "Floral", stock: 6 }, { size: "M", colour: "Floral", stock: 8 }, { size: "L", colour: "Floral", stock: 5 }
      ]},
      { slug: "linen-blazer", name: "Linen Blazer", desc: "Relaxed-fit linen blazer.", priceKes: 5500, attrs: { fabric: "Linen" }, variants: [
        { size: "S", colour: "Sand", stock: 3 }, { size: "M", colour: "Sand", stock: 5 }, { size: "L", colour: "Sand", stock: 2 }
      ]}
    ]
  },
  {
    slug: "men", name: "Men",
    products: [
      { slug: "tailored-shirt", name: "Tailored Cotton Shirt", desc: "Slim-fit tailored cotton shirt.", priceKes: 2400, attrs: { fabric: "Cotton" }, variants: [
        { size: "S", colour: "White", stock: 8 }, { size: "M", colour: "White", stock: 10 }, { size: "L", colour: "White", stock: 6 }, { size: "XL", colour: "White", stock: 4 }
      ]},
      { slug: "wool-blazer", name: "Wool Blazer", desc: "Single-breasted wool blazer.", priceKes: 8500, compareAtKes: 10500, attrs: { fabric: "Wool" }, variants: [
        { size: "M", colour: "Charcoal", stock: 4 }, { size: "L", colour: "Charcoal", stock: 6 }, { size: "XL", colour: "Charcoal", stock: 3 }
      ]},
      { slug: "chino-trouser", name: "Chino Trouser", desc: "Slim-fit chino trousers.", priceKes: 2900, attrs: { fabric: "Cotton twill" }, variants: [
        { size: "M", colour: "Khaki", stock: 7 }, { size: "L", colour: "Khaki", stock: 9 }, { size: "XL", colour: "Khaki", stock: 5 }
      ]},
      { slug: "polo-shirt", name: "PiquÃƒÂ© Polo Shirt", desc: "Classic piquÃƒÂ© polo shirt.", priceKes: 1800, attrs: { fabric: "Cotton" }, variants: [
        { size: "M", colour: "Navy", stock: 10 }, { size: "L", colour: "Navy", stock: 12 }, { size: "XL", colour: "Navy", stock: 8 }
      ]},
      { slug: "denim-jeans", name: "Slim Denim Jeans", desc: "Slim-fit denim jeans.", priceKes: 3800, attrs: { fabric: "Denim" }, variants: [
        { size: "30", colour: "Indigo", stock: 4 }, { size: "32", colour: "Indigo", stock: 6 }, { size: "34", colour: "Indigo", stock: 3 }
      ]},
      { slug: "bomber-jacket", name: "Bomber Jacket", desc: "Lightweight bomber jacket.", priceKes: 5200, compareAtKes: 6200, attrs: { fabric: "Nylon" }, variants: [
        { size: "M", colour: "Olive", stock: 4 }, { size: "L", colour: "Olive", stock: 5 }
      ]},
      { slug: "knit-polo", name: "Knit Polo", desc: "Fine-gauge knit polo.", priceKes: 3200, attrs: { fabric: "Merino" }, variants: [
        { size: "M", colour: "Stone", stock: 5 }, { size: "L", colour: "Stone", stock: 6 }
      ]},
      { slug: "oxford-shoes", name: "Leather Oxford Shoes", desc: "Hand-stitched leather oxfords.", priceKes: 7200, attrs: { material: "Leather" }, variants: [
        { size: "41", colour: "Brown", stock: 3 }, { size: "42", colour: "Brown", stock: 5 }, { size: "43", colour: "Brown", stock: 4 }
      ]},
      { slug: "cardigan", name: "Knit Cardigan", desc: "Chunky knit cardigan.", priceKes: 4500, attrs: { fabric: "Wool blend" }, variants: [
        { size: "M", colour: "Grey", stock: 4 }, { size: "L", colour: "Grey", stock: 5 }
      ]},
      { slug: "trench-coat", name: "Trench Coat", desc: "Classic double-breasted trench.", priceKes: 9800, compareAtKes: 12000, attrs: { fabric: "Cotton gabardine" }, variants: [
        { size: "M", colour: "Camel", stock: 2 }, { size: "L", colour: "Camel", stock: 3 }
      ]}
    ]
  },
  {
    slug: "shoes", name: "Shoes",
    products: [
      { slug: "leather-loafers", name: "Leather Loafers", desc: "Soft leather penny loafers.", priceKes: 4800, compareAtKes: 5200, attrs: { material: "Leather" }, variants: [
        { size: "39", colour: "Tan", stock: 3 }, { size: "40", colour: "Tan", stock: 5 }, { size: "41", colour: "Tan", stock: 4 }, { size: "42", colour: "Tan", stock: 2 }
      ]},
      { slug: "canvas-sneakers", name: "Canvas Sneakers", desc: "Everyday canvas sneakers.", priceKes: 2900, attrs: { material: "Canvas" }, variants: [
        { size: "39", colour: "White", stock: 6 }, { size: "40", colour: "White", stock: 8 }, { size: "41", colour: "White", stock: 5 }
      ]},
      { slug: "leather-sandals", name: "Leather Sandals", desc: "Handmade leather sandals.", priceKes: 2200, attrs: { material: "Leather" }, variants: [
        { size: "38", colour: "Brown", stock: 4 }, { size: "39", colour: "Brown", stock: 6 }, { size: "40", colour: "Brown", stock: 3 }
      ]},
      { slug: "block-heels", name: "Block Heels", desc: "Comfortable block heel pumps.", priceKes: 4200, attrs: { material: "Leather" }, variants: [
        { size: "36", colour: "Black", stock: 3 }, { size: "37", colour: "Black", stock: 5 }, { size: "38", colour: "Black", stock: 4 }
      ]},
      { slug: "chelsea-boots", name: "Chelsea Boots", desc: "Classic leather Chelsea boots.", priceKes: 6500, compareAtKes: 7500, attrs: { material: "Leather" }, variants: [
        { size: "40", colour: "Black", stock: 3 }, { size: "41", colour: "Black", stock: 5 }, { size: "42", colour: "Black", stock: 2 }
      ]},
      { slug: "espadrilles", name: "Espadrilles", desc: "Summer espadrille flats.", priceKes: 1800, attrs: { material: "Canvas" }, variants: [
        { size: "37", colour: "Natural", stock: 5 }, { size: "38", colour: "Natural", stock: 6 }
      ]},
      { slug: "running-shoes", name: "Running Shoes", desc: "Lightweight running shoes.", priceKes: 5800, attrs: { material: "Mesh" }, variants: [
        { size: "41", colour: "Grey", stock: 4 }, { size: "42", colour: "Grey", stock: 6 }, { size: "43", colour: "Grey", stock: 3 }
      ]},
      { slug: "ballet-flats", name: "Ballet Flats", desc: "Soft leather ballet flats.", priceKes: 2600, attrs: { material: "Leather" }, variants: [
        { size: "36", colour: "Nude", stock: 5 }, { size: "37", colour: "Nude", stock: 7 }, { size: "38", colour: "Nude", stock: 4 }
      ]},
      { slug: "birkenstock-style", name: "Slide Sandals", desc: "Cushioned slide sandals.", priceKes: 2000, attrs: { material: "Suede" }, variants: [
        { size: "38", colour: "Taupe", stock: 6 }, { size: "39", colour: "Taupe", stock: 8 }
      ]},
      { slug: "derby-shoes", name: "Derby Shoes", desc: "Leather derby dress shoes.", priceKes: 6800, compareAtKes: 7800, attrs: { material: "Leather" }, variants: [
        { size: "41", colour: "Black", stock: 3 }, { size: "42", colour: "Black", stock: 5 }
      ]}
    ]
  },
  {
    slug: "bags", name: "Bags",
    products: [
      { slug: "leather-tote", name: "Leather Tote", desc: "Full-grain leather tote bag.", priceKes: 7500, compareAtKes: 8500, attrs: { material: "Leather" }, variants: [{ colour: "Tan", stock: 5 }, { colour: "Black", stock: 3 }] },
      { slug: "crossbody-bag", name: "Crossbody Bag", desc: "Compact leather crossbody.", priceKes: 4200, attrs: { material: "Leather" }, variants: [{ colour: "Cognac", stock: 6 }, { colour: "Black", stock: 4 }] },
      { slug: "clutch-bag", name: "Evening Clutch", desc: "Satin evening clutch.", priceKes: 2800, attrs: { material: "Satin" }, variants: [{ colour: "Burgundy", stock: 5 }] },
      { slug: "woven-bag", name: "Woven Shoulder Bag", desc: "Hand-woven shoulder bag.", priceKes: 3500, attrs: { material: "Raffia" }, variants: [{ colour: "Natural", stock: 4 }] },
      { slug: "weekender-bag", name: "Weekender Bag", desc: "Canvas and leather weekender.", priceKes: 8900, attrs: { material: "Canvas" }, variants: [{ colour: "Olive", stock: 3 }] },
      { slug: "mini-backpack", name: "Mini Backpack", desc: "Compact leather mini backpack.", priceKes: 5600, attrs: { material: "Leather" }, variants: [{ colour: "Black", stock: 4 }] },
      { slug: "structured-tote", name: "Structured Tote", desc: "Structured saffiano leather tote.", priceKes: 9200, compareAtKes: 11000, attrs: { material: "Saffiano" }, variants: [{ colour: "Burgundy", stock: 2 }, { colour: "Black", stock: 3 }] },
      { slug: "bucket-bag", name: "Bucket Bag", desc: "Suede bucket bag with drawstring.", priceKes: 5200, attrs: { material: "Suede" }, variants: [{ colour: "Taupe", stock: 3 }] },
      { slug: "belt-bag", name: "Belt Bag", desc: "Leather belt bag / fanny pack.", priceKes: 3200, attrs: { material: "Leather" }, variants: [{ colour: "Tan", stock: 5 }] },
      { slug: "laptop-bag", name: "Laptop Tote", desc: "Padded laptop tote, fits 14\".", priceKes: 6800, attrs: { material: "Nylon" }, variants: [{ colour: "Charcoal", stock: 4 }] }
    ]
  },
  {
    slug: "jewellery", name: "Jewellery",
    products: [
      { slug: "gold-hoops", name: "Gold Hoop Earrings", desc: "Gold-plated hoop earrings.", priceKes: 1800, attrs: { metal: "Gold-plated" }, variants: [{ stock: 12 }] },
      { slug: "pearl-necklace", name: "Pearl Necklace", desc: "Freshwater pearl strand.", priceKes: 4500, compareAtKes: 5500, attrs: { material: "Pearl" }, variants: [{ stock: 6 }] },
      { slug: "silver-cuff", name: "Silver Cuff Bracelet", desc: "Hammered silver cuff.", priceKes: 3200, attrs: { metal: "Sterling silver" }, variants: [{ stock: 8 }] },
      { slug: "stacking-rings", name: "Stacking Rings Set", desc: "Set of 3 stacking rings.", priceKes: 2400, attrs: { metal: "Gold-plated" }, variants: [{ stock: 10 }] },
      { slug: "diamond-studs", name: "Diamond Stud Earrings", desc: "0.1ct diamond studs.", priceKes: 12500, attrs: { stone: "Diamond" }, variants: [{ stock: 3 }] },
      { slug: "pendant-necklace", name: "Pendant Necklace", desc: "Dainty gold pendant.", priceKes: 2200, attrs: { metal: "Gold-plated" }, variants: [{ stock: 15 }] },
      { slug: "charm-bracelet", name: "Charm Bracelet", desc: "Silver charm bracelet.", priceKes: 3800, attrs: { metal: "Silver" }, variants: [{ stock: 7 }] },
      { slug: "statement-earrings", name: "Statement Earrings", desc: "Bold statement earrings.", priceKes: 1500, attrs: { material: "Brass" }, variants: [{ stock: 9 }] },
      { slug: "signet-ring", name: "Signet Ring", desc: "Classic signet ring.", priceKes: 3400, attrs: { metal: "Gold" }, variants: [{ stock: 5 }] },
      { slug: "layered-necklace", name: "Layered Necklace", desc: "Pre-layered necklace set.", priceKes: 2900, compareAtKes: 3600, attrs: { metal: "Gold-plated" }, variants: [{ stock: 8 }] }
    ]
  },
  {
    slug: "watches", name: "Watches",
    products: [
      { slug: "classic-leather-watch", name: "Classic Leather Watch", desc: "Quartz movement, leather strap.", priceKes: 8500, compareAtKes: 10500, attrs: { movement: "Quartz" }, variants: [{ colour: "Brown", stock: 5 }] },
      { slug: "gold-dress-watch", name: "Gold Dress Watch", desc: "Gold-plated dress watch.", priceKes: 12500, attrs: { movement: "Quartz" }, variants: [{ colour: "Gold", stock: 3 }] },
      { slug: "silver-chronograph", name: "Silver Chronograph", desc: "Chronograph with sub-dials.", priceKes: 15500, attrs: { movement: "Quartz" }, variants: [{ colour: "Silver", stock: 4 }] },
      { slug: "minimalist-watch", name: "Minimalist Watch", desc: "Simple minimalist dial.", priceKes: 6800, attrs: { movement: "Quartz" }, variants: [{ colour: "White", stock: 6 }] },
      { slug: "dive-watch", name: "Dive Watch", desc: "Water-resistant dive watch.", priceKes: 18500, compareAtKes: 22000, attrs: { movement: "Automatic" }, variants: [{ colour: "Black", stock: 2 }] },
      { slug: "mesh-band-watch", name: "Mesh Band Watch", desc: "Stainless mesh band.", priceKes: 7200, attrs: { movement: "Quartz" }, variants: [{ colour: "Silver", stock: 4 }] },
      { slug: "square-watch", name: "Square Watch", desc: "Square case, modern silhouette.", priceKes: 9500, attrs: { movement: "Quartz" }, variants: [{ colour: "Rose Gold", stock: 3 }] },
      { slug: "sport-watch", name: "Sport Watch", desc: "Rubber strap sport watch.", priceKes: 5800, attrs: { movement: "Quartz" }, variants: [{ colour: "Black", stock: 5 }] },
      { slug: "rose-gold-watch", name: "Rose Gold Watch", desc: "Rose gold-tone dress watch.", priceKes: 11000, attrs: { movement: "Quartz" }, variants: [{ colour: "Rose Gold", stock: 4 }] },
      { slug: "skeleton-watch", name: "Skeleton Watch", desc: "Visible skeleton movement.", priceKes: 22500, compareAtKes: 26000, attrs: { movement: "Automatic" }, variants: [{ colour: "Silver", stock: 2 }] }
    ]
  },
  {
    slug: "beauty", name: "Beauty",
    products: [
      { slug: "vitamin-c-serum", name: "Vitamin C Serum", desc: "Brightening 15% vitamin C serum.", priceKes: 1800, attrs: { volume: "30ml" }, variants: [{ stock: 20 }] },
      { slug: "hyaluronic-serum", name: "Hyaluronic Serum", desc: "Hydrating hyaluronic acid serum.", priceKes: 1500, attrs: { volume: "30ml" }, variants: [{ stock: 25 }] },
      { slug: "shea-body-butter", name: "Shea Body Butter", desc: "Rich shea butter moisturiser.", priceKes: 1200, attrs: { volume: "200ml" }, variants: [{ stock: 30 }] },
      { slug: "clay-mask", name: "Clay Face Mask", desc: "Detoxifying kaolin clay mask.", priceKes: 950, attrs: { volume: "100ml" }, variants: [{ stock: 18 }] },
      { slug: "rose-toner", name: "Rose Water Toner", desc: "Soothing rose water toner.", priceKes: 850, attrs: { volume: "200ml" }, variants: [{ stock: 22 }] },
      { slug: "argan-oil", name: "Argan Hair Oil", desc: "Pure Moroccan argan oil.", priceKes: 1400, attrs: { volume: "50ml" }, variants: [{ stock: 15 }] },
      { slug: "lip-balm-set", name: "Lip Balm Set", desc: "Trio of tinted lip balms.", priceKes: 750, attrs: { count: "3" }, variants: [{ stock: 28 }] },
      { slug: "body-scrub", name: "Coffee Body Scrub", desc: "Exfoliating coffee scrub.", priceKes: 1100, attrs: { volume: "250g" }, variants: [{ stock: 20 }] },
      { slug: "retinol-cream", name: "Retinol Night Cream", desc: "Retinol 0.5% night cream.", priceKes: 2400, attrs: { volume: "50ml" }, variants: [{ stock: 12 }] },
      { slug: "sunscreen-spf50", name: "SPF 50 Sunscreen", desc: "Broad-spectrum SPF 50.", priceKes: 1650, attrs: { volume: "50ml" }, variants: [{ stock: 18 }] }
    ]
  },
  {
    slug: "home", name: "Home",
    products: [
      { slug: "linen-cushion", name: "Linen Cushion Cover", desc: "Stonewashed linen cushion.", priceKes: 1400, attrs: { size: "45cm" }, variants: [{ colour: "Natural", stock: 8 }, { colour: "Olive", stock: 6 }] },
      { slug: "ceramic-vase", name: "Ceramic Vase", desc: "Hand-thrown ceramic vase.", priceKes: 2200, attrs: { material: "Ceramic" }, variants: [{ colour: "White", stock: 5 }] },
      { slug: "cotton-throw", name: "Cotton Throw Blanket", desc: "Woven cotton throw.", priceKes: 3800, compareAtKes: 4500, attrs: { material: "Cotton" }, variants: [{ colour: "Rust", stock: 4 }] },
      { slug: "scented-candle", name: "Scented Candle", desc: "Soy wax candle, cedar & amber.", priceKes: 1200, attrs: { size: "200g" }, variants: [{ stock: 15 }] },
      { slug: "rattan-basket", name: "Rattan Basket", desc: "Handwoven rattan storage basket.", priceKes: 1800, attrs: { material: "Rattan" }, variants: [{ stock: 6 }] },
      { slug: "table-lamp", name: "Table Lamp", desc: "Ceramic base with linen shade.", priceKes: 4500, attrs: { material: "Ceramic + linen" }, variants: [{ stock: 3 }] },
      { slug: "linen-napkin-set", name: "Linen Napkin Set", desc: "Set of 4 linen napkins.", priceKes: 1600, attrs: { count: "4" }, variants: [{ colour: "Ivory", stock: 10 }] },
      { slug: "wood-serving-board", name: "Wood Serving Board", desc: "Acacia wood serving board.", priceKes: 2400, attrs: { material: "Acacia" }, variants: [{ stock: 5 }] },
      { slug: "glass-carafe", name: "Glass Carafe", desc: "Hand-blown glass carafe.", priceKes: 1900, attrs: { material: "Glass" }, variants: [{ stock: 7 }] },
      { slug: "woven-rug", name: "Woven Jute Rug", desc: "Handwoven jute rug, 120x180cm.", priceKes: 6500, compareAtKes: 7800, attrs: { size: "120x180cm" }, variants: [{ colour: "Natural", stock: 2 }] }
    ]
  },
  {
    slug: "electronics", name: "Electronics",
    products: [
      { slug: "wireless-headphones", name: "Wireless Headphones", desc: "Over-ear Bluetooth headphones, 30h battery.", priceKes: 12500, compareAtKes: 15000, attrs: { connectivity: "Bluetooth 5.3" }, variants: [{ colour: "Black", stock: 8 }, { colour: "White", stock: 6 }] },
      { slug: "earbuds", name: "Wireless Earbuds", desc: "True wireless earbuds, ANC.", priceKes: 6500, attrs: { connectivity: "Bluetooth 5.2" }, variants: [{ colour: "White", stock: 12 }] },
      { slug: "smart-watch", name: "Smart Watch", desc: "Fitness tracking smart watch.", priceKes: 8500, compareAtKes: 9800, attrs: { display: "AMOLED" }, variants: [{ colour: "Black", stock: 5 }] },
      { slug: "bluetooth-speaker", name: "Bluetooth Speaker", desc: "Portable waterproof speaker.", priceKes: 4800, attrs: { battery: "12h" }, variants: [{ colour: "Blue", stock: 10 }] },
      { slug: "power-bank", name: "Power Bank 20,000mAh", desc: "Fast-charge power bank.", priceKes: 3200, attrs: { capacity: "20000mAh" }, variants: [{ colour: "Black", stock: 15 }] },
      { slug: "phone-case", name: "Phone Case", desc: "Silicone phone case.", priceKes: 950, attrs: { fits: "Universal" }, variants: [{ colour: "Clear", stock: 30 }, { colour: "Black", stock: 25 }] },
      { slug: "usb-c-cable", name: "USB-C Cable", desc: "Braided USB-C fast charge cable.", priceKes: 650, attrs: { length: "2m" }, variants: [{ stock: 40 }] },
      { slug: "laptop-sleeve", name: "Laptop Sleeve", desc: "Padded 14\" laptop sleeve.", priceKes: 2200, attrs: { fits: "14 inch" }, variants: [{ colour: "Grey", stock: 8 }] },
      { slug: "wireless-mouse", name: "Wireless Mouse", desc: "Ergonomic wireless mouse.", priceKes: 1800, attrs: { connectivity: "2.4GHz" }, variants: [{ colour: "Black", stock: 12 }] },
      { slug: "desk-lamp-led", name: "LED Desk Lamp", desc: "Adjustable LED desk lamp.", priceKes: 2800, attrs: { brightness: "10 levels" }, variants: [{ colour: "White", stock: 6 }] }
    ]
  },
  {
    slug: "kids", name: "Kids",
    products: [
      { slug: "kids-cotton-tee", name: "Kids Cotton Tee", desc: "Soft organic cotton t-shirt.", priceKes: 650, attrs: { fabric: "Organic cotton" }, variants: [{ size: "2-3Y", colour: "Yellow", stock: 12 }, { size: "4-5Y", colour: "Yellow", stock: 10 }, { size: "6-7Y", colour: "Yellow", stock: 8 }] },
      { slug: "kids-dungarees", name: "Kids Dungarees", desc: "Cotton dungarees with pocket.", priceKes: 1200, attrs: { fabric: "Cotton" }, variants: [{ size: "2-3Y", colour: "Blue", stock: 8 }, { size: "4-5Y", colour: "Blue", stock: 6 }] },
      { slug: "kids-sneakers", name: "Kids Sneakers", desc: "Easy-velcro kids sneakers.", priceKes: 1800, attrs: { material: "Mesh" }, variants: [{ size: "28", colour: "White", stock: 5 }, { size: "30", colour: "White", stock: 4 }] },
      { slug: "kids-backpack", name: "Kids Backpack", desc: "Cartoon print kids backpack.", priceKes: 1500, attrs: { material: "Polyester" }, variants: [{ colour: "Dinosaur", stock: 6 }] },
      { slug: "kids-hoodie", name: "Kids Hoodie", desc: "Fleece-lined kids hoodie.", priceKes: 1400, attrs: { fabric: "Cotton fleece" }, variants: [{ size: "4-5Y", colour: "Grey", stock: 7 }, { size: "6-7Y", colour: "Grey", stock: 5 }] },
      { slug: "kids-pyjama-set", name: "Kids Pyjama Set", desc: "Cotton pyjama set.", priceKes: 1000, attrs: { fabric: "Cotton" }, variants: [{ size: "3-4Y", colour: "Stars", stock: 8 }] },
      { slug: "kids-dress", name: "Kids Summer Dress", desc: "Floral cotton dress.", priceKes: 1250, attrs: { fabric: "Cotton" }, variants: [{ size: "3-4Y", colour: "Floral", stock: 6 }] },
      { slug: "kids-sandals", name: "Kids Sandals", desc: "Adjustable strap sandals.", priceKes: 850, attrs: { material: "Leather" }, variants: [{ size: "26", colour: "Brown", stock: 5 }] },
      { slug: "kids-beanie", name: "Kids Beanie", desc: "Knit beanie.", priceKes: 450, attrs: { fabric: "Acrylic" }, variants: [{ colour: "Red", stock: 10 }] },
      { slug: "kids-shorts", name: "Kids Cotton Shorts", desc: "Elastic-waist cotton shorts.", priceKes: 700, attrs: { fabric: "Cotton" }, variants: [{ size: "3-4Y", colour: "Khaki", stock: 9 }] }
    ]
  }
];

function slugSku(slug: string, size: string | undefined, colour: string | undefined) {
  return `DEMO-${slug}-${(colour ?? "OS").toUpperCase()}-${(size ?? "OS").toUpperCase()}`;
}

const FALLBACK_PHOTO = "photo-1595777457583-95e059d581b8";

async function main() {
  console.log("Seeding J&R Ecommerce (100 products, 10 categories)...");

  const managerPassword = "Manager123!";
  await prisma.user.upsert({
    where: { email: "manager@demo.local" },
    update: {},
    create: {
      email: "manager@demo.local",
      name: "Manager",
      passwordHash: await argon2.hash(managerPassword),
      emailVerified: new Date(),
      role: UserRole.MANAGER,
      manager: { create: { displayName: "Manager" } }
    }
  });
  console.log(`  Manager: manager@demo.local / ${managerPassword}`);

  const customerPassword = "Customer123!";
  await prisma.user.upsert({
    where: { email: "customer@demo.local" },
    update: {},
    create: {
      email: "customer@demo.local",
      name: "Customer",
      passwordHash: await argon2.hash(customerPassword),
      emailVerified: new Date(),
      role: UserRole.CUSTOMER,
      phone: "+254700000001",
      customer: { create: {} }
    }
  });
  console.log(`  Customer: customer@demo.local / ${customerPassword}`);

  console.log("  Clearing old demo products...");
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  let totalProducts = 0;
  let totalVariants = 0;

  for (let cIdx = 0; cIdx < catalogue.length; cIdx++) {
    const cat = catalogue[cIdx];
    if (!cat) continue;

    const category = await prisma.category.create({
      data: { slug: cat.slug, name: cat.name, position: cIdx }
    });

    for (let pIdx = 0; pIdx < cat.products.length; pIdx++) {
      const p = cat.products[pIdx];
      if (!p) continue;

      const pool = IMG[cat.slug as keyof typeof IMG] ?? IMG.women;
      const photoId: string = pool[pIdx % pool.length] ?? FALLBACK_PHOTO;

      const product = await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          description: p.desc,
          categoryId: category.id,
          basePriceCents: p.priceKes * 100,
          compareAtCents: p.compareAtKes ? p.compareAtKes * 100 : null,
          attributesJson: p.attrs,
          active: true,
          images: {
            create: [
              { url: unsplashUrl(photoId, 800, 1000), position: 0, altText: p.name },
              { url: unsplashUrl(photoId, 800, 1000) + "&sat=-10", position: 1, altText: p.name }
            ]
          }
        }
      });

      for (const v of p.variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: slugSku(p.slug, v.size, v.colour),
            size: v.size ?? null,
            colour: v.colour ?? null,
            stock: v.stock,
            active: true
          }
        });
        totalVariants++;
      }
      totalProducts++;
    }
    console.log(`  Ã¢Å“â€œ ${cat.name}: ${cat.products.length} products`);
  }

  await prisma.deliveryZone.upsert({
    where: { name: "Nairobi Metro" }, update: {},
    create: { name: "Nairobi Metro", counties: ["Nairobi", "Kiambu", "Machakos", "Kajiado"], baseFeeCents: 30000, freeAboveCents: 500000, estimatedDaysMin: 1, estimatedDaysMax: 2, active: true }
  });
  await prisma.deliveryZone.upsert({
    where: { name: "Countrywide Courier" }, update: {},
    create: { name: "Countrywide Courier", counties: ["*"], baseFeeCents: 50000, freeAboveCents: 700000, estimatedDaysMin: 2, estimatedDaysMax: 5, active: true }
  });

  console.log(`\nSeeded: ${totalProducts} products, ${totalVariants} variants across ${catalogue.length} categories.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
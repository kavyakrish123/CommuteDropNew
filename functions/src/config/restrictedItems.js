/**
 * Restricted Items Database
 * Comprehensive list of prohibited items for Singapore-based peer-to-peer delivery
 */

// Primary restricted keywords (case-insensitive matching)
const RESTRICTED_KEYWORDS = [
  // Tobacco products
  'cigarette', 'cigarettes', 'cigar', 'cigars', 'tobacco', 'smoke', 'smoking',
  'vape', 'vapes', 'vaping', 'e-cigarette', 'e-cig', 'ecig', 'juul',
  'hookah', 'shisha', 'nicotine', 'cigarette lighter', 'lighter fluid',
  
  // Alcohol
  'alcohol', 'alcoholic', 'beer', 'wine', 'whiskey', 'whisky', 'vodka',
  'rum', 'gin', 'brandy', 'champagne', 'liquor', 'spirits', 'cocktail',
  'sake', 'soju', 'tiger beer', 'heineken', 'carlsberg',
  
  // Medicine and pharmaceuticals
  'medicine', 'medicines', 'medication', 'medications', 'pill', 'pills',
  'tablet', 'tablets', 'capsule', 'capsules', 'prescription', 'prescribed',
  'drug', 'drugs', 'pharmaceutical', 'supplement', 'supplements', 'vitamin',
  'vitamins', 'antibiotic', 'antibiotics', 'painkiller', 'painkillers',
  'paracetamol', 'ibuprofen', 'aspirin', 'cough syrup', 'syrup',
  'injection', 'injections', 'syringe', 'syringes', 'medical device',
  
  // Currency and valuables
  'cash', 'money', 'currency', 'dollar', 'dollars', 'sgd', 'singapore dollar',
  'jewellery', 'jewelry', 'gold', 'silver', 'diamond', 'diamonds',
  'precious metal', 'precious stone', 'gem', 'gems', 'watch', 'watches',
  'rolex', 'luxury', 'valuable', 'valuables', 'collectible', 'collectibles',
  'gift card', 'voucher', 'vouchers', 'cash card', 'ez-link',
  
  // Perishable food
  'food', 'fresh food', 'perishable', 'perishables', 'hot food', 'cold food',
  'refrigerated', 'frozen', 'ice cream', 'cake', 'cakes', 'pastry', 'pastries',
  'meat', 'fish', 'seafood', 'dairy', 'milk', 'cheese', 'yogurt', 'yoghurt',
  'fruit', 'fruits', 'vegetable', 'vegetables', 'fresh produce',
  'expires', 'expiry', 'expiration', 'spoils', 'spoiled',
  
  // Weapons and dangerous items
  'weapon', 'weapons', 'knife', 'knives', 'blade', 'blades', 'sword',
  'gun', 'guns', 'firearm', 'firearms', 'ammunition', 'ammo', 'bullet',
  'bullets', 'explosive', 'explosives', 'bomb', 'bombs', 'grenade',
  'scissors', 'razor', 'razors', 'sharp', 'pointed', 'cutting tool',
  'tool', 'tools', 'screwdriver', 'hammer', 'wrench',
  
  // Flammable and hazardous materials
  'flammable', 'combustible', 'gasoline', 'petrol', 'diesel', 'fuel',
  'lighter', 'matches', 'match', 'fire', 'lighter fluid', 'kerosene',
  'chemical', 'chemicals', 'acid', 'acids', 'bleach', 'solvent', 'solvents',
  'paint', 'paints', 'thinner', 'paint thinner', 'adhesive', 'glue',
  'aerosol', 'aerosols', 'spray', 'sprays', 'deodorant', 'hairspray',
  'propane', 'butane', 'gas', 'gas cylinder', 'lpg',
  
  // Liquids (general restriction)
  'liquid', 'liquids', 'beverage', 'beverages', 'drink', 'drinks',
  'water bottle', 'bottle of', 'container of liquid',
  
  // Electronics with lithium batteries (optional but recommended)
  'lithium battery', 'lithium batteries', 'power bank', 'power banks',
  'laptop battery', 'phone battery', 'spare battery',
  
  // Powders and gels
  'powder', 'powders', 'gel', 'gels', 'cream', 'creams', 'lotion', 'lotions',
  'paste', 'pastes', 'substance', 'substances',
  
  // Suspicious/unclear items
  'unknown', 'unclear', 'mystery', 'secret', 'confidential', 'private',
  'suspicious', 'unidentified', 'package', 'parcel', 'item', 'thing',
  
  // Illegal items
  'illegal', 'contraband', 'stolen', 'counterfeit', 'fake', 'pirated',
  'controlled substance', 'narcotic', 'narcotics', 'marijuana', 'cannabis',
  'heroin', 'cocaine', 'meth', 'methamphetamine',
];

// Secondary patterns (for partial matching)
const RESTRICTED_PATTERNS = [
  /cig/i,
  /vape/i,
  /alcohol/i,
  /beer|wine|whiskey|vodka|rum|gin/i,
  /medicine|medication|pill|tablet|capsule/i,
  /prescription|pharmaceutical/i,
  /cash|money|currency|dollar/i,
  /jewel|gold|silver|diamond|precious/i,
  /food|perishable|fresh|refrigerated|frozen/i,
  /weapon|knife|gun|explosive|bomb/i,
  /flammable|combustible|gasoline|petrol|fuel/i,
  /chemical|acid|bleach|solvent/i,
  /liquid|beverage|drink/i,
  /lithium.*battery|power.*bank/i,
  /powder|gel|cream|paste/i,
  /illegal|contraband|stolen|counterfeit/i,
];

// Suspicious phrases that indicate illegal activity
const SUSPICIOUS_PHRASES = [
  "don't tell",
  "don't open",
  "keep quiet",
  "don't ask",
  "illegal",
  "hide",
  "secret",
  "confidential",
  "off platform",
  "outside app",
  "direct payment",
  "cash only",
  "no questions",
  "discreet",
  "private",
];

module.exports = {
  RESTRICTED_KEYWORDS,
  RESTRICTED_PATTERNS,
  SUSPICIOUS_PHRASES,
};



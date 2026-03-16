export const PLATFORMS = ['Meta', 'TikTok', 'Axon', 'Snap', 'Google', 'Bing'];
export const PAID_SOCIAL = ['Meta', 'TikTok', 'Axon', 'Snap'];
export const PAID_SEARCH = ['Google', 'Bing'];

export const CLIENTS = [
  'AfterSell',
  'Apollo Neuroscience',
  'Athena Club',
  'AutoBrush',
  'Barimelts',
  'Begin Health',
  'BudClub',
  'Clooudie',
  'ColourPop',
  'ElleVet',
  'Eskiin',
  'Fashion Nova',
  'Fun Spot America ATL',
  'Fun Spot America FL',
  'Higher Education',
  'Hiya Health',
  'Joy of Life',
  'Kaizen',
  'Kind Patches',
  'Let Loose',
  'Lovebug',
  'Monat',
  'PIMCO',
  'Piper Aircraft',
  'Renaissance Benefits',
  'Solshine Hair',
  'WMP Eyewear',
  'WearMe Pro',
  'onewith',
];

// Maps Supermetrics "Data source" values → app platform keys
export const PLATFORM_NAME_MAP = {
  'Facebook Ads': 'Meta',
  'Google Ads': 'Google',
  'TikTok Ads': 'TikTok',
  'Snapchat Marketing': 'Snap',
  'Microsoft Advertising (Bing)': 'Bing',
  'Axon by AppLovin': 'Axon',
  // Already-normalized pass-through
  'Meta': 'Meta',
  'Google': 'Google',
  'TikTok': 'TikTok',
  'Snap': 'Snap',
  'Bing': 'Bing',
  'Axon': 'Axon',
};

// Maps raw Supermetrics account names → consolidated client names
export const ACCOUNT_CLIENT_MAP = {
  // Meta / Facebook
  'AfterSell': 'AfterSell',
  'Begin_Health_Primary': 'Begin Health',
  'Clooudie': 'Clooudie',
  'Clooudie 1': 'Clooudie',
  'ColourPop': 'ColourPop',
  'EVS': 'ElleVet',
  'Fun Spot America ATL': 'Fun Spot America ATL',
  'Fun Spot America FL': 'Fun Spot America FL',
  'Joy of Life': 'Joy of Life',
  'Kind Patches': 'Kind Patches',
  'Kind Patches Retail': 'Kind Patches',
  'Kind Patches Retail ': 'Kind Patches',
  'Lovebug Pro 2025': 'Lovebug',
  'LoveBug': 'Lovebug',
  'Renaissance Benefits Ad Account': 'Renaissance Benefits',
  'onewith': 'onewith',
  // Google
  'Barimelts': 'Barimelts',
  'Go ElleVet': 'ElleVet',
  'Hiya Health': 'Hiya Health',
  'Kaizen Food Company': 'Kaizen',
  'Kaizen Foods Company': 'Kaizen',
  'Kind Patches 🇦🇺': 'Kind Patches',
  'Kind Patches 🇬🇧': 'Kind Patches',
  'Kind Patches 🇺🇸': 'Kind Patches',
  'Lovebug Primary': 'Lovebug',
  'WMP Eyewear': 'WMP Eyewear',
  // Bing
  'ElleVet Sciences LLC': 'ElleVet',
  // Snapchat
  'BudClub Media LLC Self Service': 'BudClub',
  'ColourPop Cosmetics Self Service': 'ColourPop',
  'Ellevet Sciences Self Service': 'ElleVet',
  'House of Brands LLC Self Service': 'Higher Education',
  'Kind Patches CET USD': 'Kind Patches',
  'Let Loose  Self Service': 'Let Loose',
  'Let Loose Self Service': 'Let Loose',
  // TikTok
  'Athena Club': 'Athena Club',
  'AutoBrush - Main': 'AutoBrush',
  'Eskiin Main Ad Account': 'Eskiin',
  'Fashion Nova Ad Account USE THIS': 'Fashion Nova',
  'Hiya Health X TSA': 'Hiya Health',
  'Hiya Health x TSA | Auto-Pay': 'Hiya Health',
  'Monat Global TikTok Shop': 'Monat',
  'Solshine Hair': 'Solshine Hair',
  'WearMe Pro': 'WearMe Pro',
  'Renaissance Benefits': 'Renaissance Benefits',
  // New accounts from live sheet
  'Apollo Neuroscience': 'Apollo Neuroscience',
  'PIMCO': 'PIMCO',
  'PIMCO ': 'PIMCO',
  'Piper Aircraft': 'Piper Aircraft',
  'Snapchat Marketing': '__skip__',
};

export const PLATFORM_COLORS = {
  Meta: '#1877F2',
  TikTok: '#010101',
  Axon: '#FF6B35',
  Snap: '#FFFC00',
  Google: '#4285F4',
  Bing: '#00809D',
};

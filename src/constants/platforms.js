export const PLATFORMS = ['Meta', 'TikTok', 'Axon', 'Snap', 'Google', 'Bing'];
export const PAID_SOCIAL = ['Meta', 'TikTok', 'Axon', 'Snap'];
export const PAID_SEARCH = ['Google', 'Bing'];

export const CLIENTS = [
  'AfterSell',
  'Begin Health',
  'ColourPop',
  'ElleVet',
  'Fun Spot America ATL',
  'Fun Spot America FL',
  'Joy of Life',
  'Kind Patches',
  'Lovebug',
  'onewith',
];

// Maps Supermetrics platform names → app platform keys
export const PLATFORM_NAME_MAP = {
  'Meta Ads': 'Meta',
  'Google Ads': 'Google',
  'TikTok Ads': 'TikTok',
  'Snapchat Ads': 'Snap',
  'Bing Ads': 'Bing',
  'Microsoft Advertising': 'Bing',
  'Axon': 'Axon',
  // Pass-through for already-normalized values
  'Meta': 'Meta',
  'Google': 'Google',
  'TikTok': 'TikTok',
  'Snap': 'Snap',
  'Bing': 'Bing',
};

export const PLATFORM_COLORS = {
  Meta: '#1877F2',
  TikTok: '#010101',
  Axon: '#FF6B35',
  Snap: '#FFFC00',
  Google: '#4285F4',
  Bing: '#00809D',
};

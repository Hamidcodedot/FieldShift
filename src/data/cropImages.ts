/**
 * Curated high-resolution agricultural photography for crops and farming visualization.
 * All URLs are optimized lightweight CDN assets with automatic format and crop handling.
 */

export interface CropVisual {
  id: string;
  name: string;
  imageUrl: string;
  familyColor: string;
}

export const CROP_VISUALS: Record<string, CropVisual> = {
  wheat: {
    id: 'wheat',
    name: 'Wheat',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80',
    familyColor: '#d97706', // amber-600
  },
  rice_paddy: {
    id: 'rice_paddy',
    name: 'Rice (Paddy)',
    imageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=400&q=80',
    familyColor: '#059669', // emerald-600
  },
  cotton: {
    id: 'cotton',
    name: 'Cotton',
    imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80',
    familyColor: '#0284c7', // sky-600
  },
  chickpea: {
    id: 'chickpea',
    name: 'Chickpea (Gram)',
    imageUrl: 'https://images.unsplash.com/photo-1583064313642-a7c14d49a5a1?auto=format&fit=crop&w=400&q=80',
    familyColor: '#16a34a', // green-600
  },
  green_gram_moong: {
    id: 'green_gram_moong',
    name: 'Summer Moong (Green Gram)',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    familyColor: '#10b981', // emerald-500
  },
  pigeon_pea: {
    id: 'pigeon_pea',
    name: 'Pigeon Pea (Arhar)',
    imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80',
    familyColor: '#15803d', // green-700
  },
  mustard_brassica: {
    id: 'mustard_brassica',
    name: 'Indian Mustard (Raya)',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=400&q=80',
    familyColor: '#ca8a04', // yellow-600
  },
  sorghum: {
    id: 'sorghum',
    name: 'Sorghum (Jowar)',
    imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=400&q=80',
    familyColor: '#ea580c', // orange-600
  },
  maize: {
    id: 'maize',
    name: 'Maize (Corn)',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80',
    familyColor: '#eab308', // yellow-500
  },
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80',
    familyColor: '#f59e0b', // amber-500
  },
  lentil: {
    id: 'lentil',
    name: 'Lentil (Masoor)',
    imageUrl: 'https://images.unsplash.com/photo-1583064313642-a7c14d49a5a1?auto=format&fit=crop&w=400&q=80',
    familyColor: '#059669', // emerald-600
  },
  barley: {
    id: 'barley',
    name: 'Barley',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80',
    familyColor: '#b45309', // amber-700
  },
  cowpea: {
    id: 'cowpea',
    name: 'Cowpea (Lobia)',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    familyColor: '#16a34a',
  },
  millet_pearl: {
    id: 'millet_pearl',
    name: 'Pearl Millet (Bajra)',
    imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=400&q=80',
    familyColor: '#d97706',
  },
  // Canonical ID aliases matching CROPS_DATABASE
  puddle_rice: {
    id: 'puddle_rice',
    name: 'Rice (Paddy)',
    imageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=400&q=80',
    familyColor: '#059669',
  },
  mustard: {
    id: 'mustard',
    name: 'Indian Mustard (Raya)',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=400&q=80',
    familyColor: '#ca8a04',
  },
  corn_maize: {
    id: 'corn_maize',
    name: 'Maize (Corn)',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80',
    familyColor: '#eab308',
  },
  pearl_millet: {
    id: 'pearl_millet',
    name: 'Pearl Millet (Bajra)',
    imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=400&q=80',
    familyColor: '#d97706',
  },
};

export const DEFAULT_CROP_IMAGE =
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80'; // Lush farmland

export function getCropImageUrl(cropId?: string): string {
  if (!cropId) return DEFAULT_CROP_IMAGE;
  return CROP_VISUALS[cropId]?.imageUrl || DEFAULT_CROP_IMAGE;
}

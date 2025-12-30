
import { Location } from './types';

export const LOCATIONS: Location[] = [
  { 
    id: 'A', 
    name: '小芳堂', 
    apiUrl: 'https://pm25.lass-net.org/data/last.php?device_id=B827EBC2994D' 
  },
  { 
    id: 'B', 
    name: '司令台', 
    apiUrl: 'https://pm25.lass-net.org/data/last.php?device_id=B827EBC2994D' // Reuse for demo
  },
  { 
    id: 'C', 
    name: '小田原', 
    apiUrl: 'https://pm25.lass-net.org/data/last.php?device_id=B827EBC2994D' // Reuse for demo
  },
  { 
    id: 'D', 
    name: '腳踏車練習場', 
    apiUrl: 'https://pm25.lass-net.org/data/last.php?device_id=B827EBC2994D' // Reuse for demo
  }
];

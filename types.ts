
export interface Location {
  id: string;
  name: string;
  apiUrl: string;
}

export interface EnvironmentData {
  pm25: number;
  temperature: number;
  humidity: number;
  co2: number;
  tvoc: number;
  windspeed: number;
  sunlight: number;
  electricity: number;
  precipitation: number;
}

// Added Artifact interface to match usage in ArtifactCard component
export interface Artifact {
  id: string;
  html: string;
  styleName: string;
  status: 'streaming' | 'complete';
}

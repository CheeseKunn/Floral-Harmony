export interface Suggestion {
  title: string;
  description: string;
  flowerList: string[];
  colorPalette: string[]; // Hex codes or color names
  vibe: string;
  flowerLanguage: string;
  blessing: string;
}

export interface FloralAnalysisResponse {
  analysis: string;
  identifiedFlowers: string[];
  suggestions: Suggestion[];
}

export interface UserInput {
  text: string;
  image: File | null;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
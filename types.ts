export enum AccountType {
  CASSANDRA19 = 'Cassandra19',
  DIVINESLUTS = 'Divinesluts',
}

export interface Persona {
  id: AccountType;
  name: string;
  tagline: string;
  description: string;
  instagram: string;
  twitter: string;
  color: string;
}

export enum ContentType {
  IMAGE_PROMPT = 'Image Prompt',
  POST_TEXT = 'Post Text',
}

export interface GeneratedPosts {
  fanvue: string;
  instagram: string;
  twitter: string;
}

export type GeneratedContent = string[] | GeneratedPosts[];

export interface PromptOption {
  es: string;
  en: string;
  [key: string]: string; // Allows indexing with 'es' or 'en' strings
}

export type Selections = Record<string, PromptOption[]>;

export interface HistoryItem {
  id: string;
  mainAction: string;
  selections: Selections;
  englishPrompt: string;
  contentType: ContentType;
  personaId: AccountType;
  timestamp: number;
}

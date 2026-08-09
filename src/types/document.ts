import { Language, CVTheme, CV } from '../types';

export type ElementType =
  | 'text'
  | 'image'
  | 'section'
  | 'shape'
  | 'line'
  | 'icon'
  | 'group'
  | 'skill'
  | 'contact'
  | 'experience'
  | 'education'
  | 'language'
  | 'project'
  | 'custom';

export interface ElementStyle {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number; // pt or px
  fontFamily?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black' | string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  opacity?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | string;
  padding?: number;
  margin?: number;
}

export interface CVElement {
  id: string;
  type: ElementType;
  x: number; // in px relative to page top-left
  y: number; // in px relative to page top-left
  width: number; // in px
  height?: number; // in px
  rotation?: number; // degrees
  zIndex: number;
  locked?: boolean;
  visible?: boolean;
  opacity?: number;
  style?: ElementStyle;
  content: any; // dynamic content based on element type
  metadata?: {
    sectionId?: string;
    sectionType?: string;
    column?: 'gauche' | 'droite' | 'principale';
    [key: string]: any;
  };
}

export interface CVPage {
  id: string;
  pageNumber: number;
  width: number; // e.g. 794px for A4 at 96DPI
  height: number; // e.g. 1123px for A4 at 96DPI
  margins: { top: number; right: number; bottom: number; left: number };
  background: string;
  elements: CVElement[];
}

export interface CVSettings {
  format: 'A4' | 'Letter';
  unit: 'mm' | 'px' | 'pt';
  orientation: 'portrait' | 'landscape';
  autoPagination: boolean;
  gridSnap: boolean;
  gridSize: number;
  showGuides: boolean;
  showRulers: boolean;
}

export interface CVDocument {
  id: string;
  version: number;
  title: string;
  language: Language;
  metadata: {
    createdAt: string;
    updatedAt: string;
    authorId?: string;
    templateId?: string;
  };
  settings: CVSettings;
  theme: CVTheme;
  pages: CVPage[];
  legacyData?: CV;
}

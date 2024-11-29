export interface Settings {
  title: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  favicon?: Blob;
}

export const breakpoints: Record<Settings['size'], string> = {
  small: 'max-w-3xl',
  medium: 'max-w-5xl',
  large: 'max-w-7xl',
}

export const gridSizes: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
}

interface BlockText {
  type: "text";
  content: string;
  id: string;
  color: string;
}

interface BlockImage {
  type: "image";
  url: string;
  alt: string;
  id: string;
  width: number | 'auto' | 'full';
  height: number | 'auto';
}

interface BlockGrid {
  type: "grid";
  size: number;
  children: Block[];
  id: string;
  color: string;
}

interface BlockButton {
  type: "button";
  text: string;
  align: 'left' | 'center' | 'right';
  url: string;
  id: string;
  color: string;
}

interface BlockVerticalSpace {
  type: "vertical-space";
  size: number;
  id: string; 
}

export const columnSpan: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
};

export const sizeTable: Record<number, string> = {
  1: 'h-4',
  2: 'h-8',
  3: 'h-16',
  4: 'h-24',
  5: 'h-32',
}

export const alignment: Record<'left' | 'center' | 'right', string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export type Block = (BlockText | BlockImage | BlockGrid | BlockButton | BlockVerticalSpace) & { columnSpan?: number; };
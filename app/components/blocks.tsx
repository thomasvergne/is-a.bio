import { createContext, Dispatch, SetStateAction, useContext, useRef } from "react";
import { ContextMenu, ContextMenuContent, ContextMenuSeparator, ContextMenuTrigger } from "./ui/context-menu";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { TextEditor } from "./text-editor";
import { Menu } from "./artefact-creator";

export interface Settings {
  title: string;
  description: string;
  size: 'small' | 'medium' | 'large';
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
  size: 'small' | 'medium' | 'large';
  content: string;
  id: string;
}

interface BlockImage {
  type: "image";
  url: string;
  alt: string;
  id: string;
}

interface BlockGrid {
  type: "grid";
  size: number;
  children: Block[];
  id: string;
}

interface BlockButton {
  type: "button";
  text: string;
  align: 'left' | 'center' | 'right';
  url: string;
  id: string;
}

export const columnSpan: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
};

export const alignment: Record<'left' | 'center' | 'right', string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export type Block = (BlockText | BlockImage | BlockGrid | BlockButton) & { columnSpan?: number; };

interface RenderBlockProps {
  block: Block;
  index: number;
  isGrid?: boolean;
  parent?: Block;
}

export function RenderBlock({ index, isGrid = false, parent }: RenderBlockProps) {
  const { blocks, setBlocks } = useContext(BlockContext);
  const renderedBlock = blocks[index];

  const imageUrlRef = useRef<HTMLInputElement>(null);
  const imageAltRef = useRef<HTMLInputElement>(null);
  const gridSizeRef = useRef<HTMLInputElement>(null);
  const buttonUrlRef = useRef<HTMLInputElement>(null);
  const buttonTextRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLInputElement>(null);

  function updateBlock(block: Block, index: number) {
    setBlocks(blocks.map((b, i) => i === index ? block : b));
  }

  switch (renderedBlock.type) {
    case "image": {
      const { url, alt, columnSpan: colS } = renderedBlock;
      return <>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <img
              key={index}
              src={url}
              alt={alt}
              className={cn("w-full h-96 object-cover my-8", colS && columnSpan[colS])}
            />
          </ContextMenuTrigger>

          <ContextMenuContent asChild>
            <Card className="w-80">
              <CardHeader className="p-2">
                <CardTitle>
                  Edit image block
                </CardTitle>
              </CardHeader>

              <CardContent className="p-2">
                <Label className="mb-2 block">
                  Image URL
                </Label>

                <Input ref={imageUrlRef} placeholder="Enter image URL" type="text" defaultValue={url} />

                <Label className="mt-4 block mb-2">
                  Image alt text
                </Label>

                <Input ref={imageAltRef} placeholder="Enter image alt text" type="text" defaultValue={alt} />

                { 
                  isGrid 
                    && <>
                        <Label className="my-2 block">
                          Column span (length that the button should span)
                        </Label>

                        <Input ref={spanRef}  placeholder="Enter column span" type="number" defaultValue={colS} max={parent?.type === 'grid' ? parent.size : 1} min={1} />
                      </>
                }
              </CardContent>

              <CardFooter className="flex justify-between p-2">
                <Button onClick={() => {
                  if (!imageUrlRef.current || !imageAltRef.current) return;

                  const url = imageUrlRef.current.value;
                  const alt = imageAltRef.current.value;

                  updateBlock({
                    type: 'image',
                    url,
                    alt,
                    id: renderedBlock.id,
                  }, index);
                }}>
                  Update image
                </Button>

                <Button variant="destructive" onClick={() => {
                  setBlocks(blocks.filter((_, i) => i !== index));
                }}>
                  Delete block
                </Button>
              </CardFooter>
            </Card>
          </ContextMenuContent>
        </ContextMenu>
      </>
    }

    case "text": {
      const { size, content, id, columnSpan: colS } = renderedBlock;

      return <TextEditor 
        value={content} 
        onValueChange={(val) => {
          updateBlock({
            type: 'text',
            size,
            content: val,
            id,
          }, index);
        }} 
        size={size}
        setSize={(size) => {
          updateBlock({
            type: 'text',
            content,
            size,
            id,
          }, index)
        }}
        deleteText={() => {
          setBlocks(blocks.filter((_, i) => i !== index));
        }}
        className={cn({
          'text-base': size === 'small',
          'text-xl font-semibold': size === 'medium',
          'text-3xl font-bold': size === 'large',
        }, colS && columnSpan[colS])} 
      />
    }

    case 'button': {
      const { text, url, align, id, columnSpan: colS } = renderedBlock;

      return <>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className={cn("flex w-full", alignment[align], colS && columnSpan[colS])}>
              <Button>
                {text}
              </Button>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent asChild>
            <Card className="w-80">
              <CardHeader className="p-2">
                <CardTitle>
                  Edit button block
                </CardTitle>
              </CardHeader>

              <CardContent className="p-2">
                <Label className="mb-2 block">
                  Button text
                </Label>

                <Input ref={buttonTextRef} placeholder="Enter button text" type="text" defaultValue={text} />

                <Label className="my-2 block">
                  Button URL
                </Label>

                <Input ref={buttonUrlRef} placeholder="Enter button URL" type="text" defaultValue={url} />

                <Label className="my-2 block">
                  Button alignment
                </Label>

                <Select defaultValue={align} onValueChange={(val) => {
                  updateBlock({
                    type: 'button',
                    text,
                    url,
                    align: val as 'left' | 'center' | 'right',
                    id,
                  }, index);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select button alignment" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="left">
                      Left
                    </SelectItem>

                    <SelectItem value="center">
                      Center
                    </SelectItem>

                    <SelectItem value="right">
                      Right
                    </SelectItem>
                  </SelectContent>
                </Select>

                { 
                  isGrid 
                    && <>
                        <Label className="my-2 block">
                          Column span (length that the button should span)
                        </Label>

                        <Input ref={spanRef}  placeholder="Enter column span" type="number" defaultValue={colS} max={parent?.type === 'grid' ? parent.size : 1} min={1} />
                      </>
                }
              </CardContent>

              <CardFooter className="flex justify-between p-2">
                <Button variant="destructive" onClick={() => {
                  setBlocks(blocks.filter((_, i) => i !== index));
                }}>
                  Delete block
                </Button>

                <Button onClick={() => {
                  if (!buttonTextRef.current || !buttonUrlRef.current) return;

                  const text = buttonTextRef.current.value;
                  const url = buttonUrlRef.current.value;

                  updateBlock({
                    type: 'button',
                    text,
                    url,
                    align,
                    id,
                    columnSpan: spanRef.current ? parseInt(spanRef.current.value, 10) : 1,
                  }, index);
                }}>
                  Update button 
                </Button>
              </CardFooter>
            </Card>
          </ContextMenuContent>
        </ContextMenu>
      </>
    }

    case "grid": {
      const { size, children, id } = renderedBlock;
      
      return <>
        <BlockContext.Provider value={{ blocks: children, setBlocks: (children) => {
          updateBlock({
            type: 'grid',
            size,
            children: children as Block[],
            id,
          }, index);
        }}}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className={cn("grid gap-4 w-full col-span-2 items-center group border border-dashed border-slate-200 p-2 rounded-lg min-h-20", size in gridSizes ? gridSizes[size] : "col-span-1")}>
                {
                  children.length > 0 
                    ? children.map((child, i) => {
                        return <RenderBlock key={i} block={child} index={i} isGrid parent={renderedBlock} />
                      })
                    : null
                      
                }
              </div>
            </ContextMenuTrigger>

            <ContextMenuContent>
              <Menu blocks={children} position={children.length} setBlocks={(children) => {
                updateBlock({
                  type: 'grid',
                  size,
                  children: children as Block[],
                  id,
                }, index)
              }} />
              <ContextMenuSeparator />
              <Card className="w-80 shadow-none border-none">
                <CardHeader className="p-2">
                  <CardTitle>
                    Edit grid block
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-2">
                  <Label className="mb-2 block">
                    Grid size
                  </Label>

                  <Input ref={gridSizeRef} placeholder="Enter grid size" type="number" defaultValue={size} />
                </CardContent>

                <CardFooter className="flex justify-between p-2">
                  <Button onClick={() => {
                    if (!gridSizeRef.current) return;

                    const size = parseInt(gridSizeRef.current.value, 10);

                    if (!size) return;

                    updateBlock({
                      type: 'grid',
                      size,
                      children,
                      id,
                    }, index);
                  }}>  
                    Update grid
                  </Button>

                  <Button variant="destructive" onClick={() => {
                    setBlocks(blocks.filter((_, i) => i !== index));
                  }}>
                    Delete block
                  </Button>
                </CardFooter>
              </Card>
            </ContextMenuContent>
          </ContextMenu>
        </BlockContext.Provider>
      </>
    }
  }
}

export function insertAt<A>(arr: A[], index: number, ...items: A[]): A[] {
  return [...arr.slice(0, index), ...items, ...arr.slice(index)];
}

export const BlockContext = createContext({ blocks: [] as Block[], setBlocks: (() => {}) as Dispatch<SetStateAction<Block[]>> });
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

export type Block = { 
  type: "text";
  size: 'small' | 'medium' | 'large';
  content: string;
  id: string;
} | {
  type: "image";
  url: string;
  alt: string;
  id: string;
} | {
  type: "grid";
  size: number;
  children: Block[];
  id: string;
}

interface RenderBlockProps {
  block: Block;
  index: number;
  blocks: Block[];
  setBlocks: Dispatch<SetStateAction<Block[]>>;
}

export function RenderBlock({ index }: RenderBlockProps) {
  const { blocks, setBlocks } = useContext(BlockContext);
  const renderedBlock = blocks[index];

  const imageUrlRef = useRef<HTMLInputElement>(null);
  const imageAltRef = useRef<HTMLInputElement>(null);
  const gridSizeRef = useRef<HTMLInputElement>(null);

  function updateBlock(block: Block, index: number) {
    setBlocks(blocks.map((b, i) => i === index ? block : b));
  }

  switch (renderedBlock.type) {
    case "image": {
      const { url, alt } = renderedBlock;
      return <>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <img
              key={index}
              src={url}
              alt={alt}
              className="w-full h-96 object-cover my-8"
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

                <Label className="mt-4 block">
                  Image alt text
                </Label>

                <Input ref={imageAltRef} placeholder="Enter image alt text" type="text" defaultValue={alt} />
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
      const { size, content, id } = renderedBlock;

      return <>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <TextEditor 
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
                'text-3xl font-bold': size === 'large'
              })} 
            />
          </ContextMenuTrigger>

          <ContextMenuContent asChild>
            <Card className="w-80">
              <CardHeader className="p-2">
                <CardTitle>
                  Edit text block
                </CardTitle>
              </CardHeader>

              <CardContent className="p-2">
                <Label className="mb-2 block">
                  Text size
                </Label>

                <Select defaultValue={size} onValueChange={(val) => {
                  updateBlock({
                    type: 'text',
                    content,
                    size: val as 'small' | 'medium' | 'large',
                    id,
                  }, index);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Set text size" />
                  </SelectTrigger>
                  
                  <SelectContent>
                    <SelectItem value="small">
                      Small
                    </SelectItem>

                    <SelectItem value="medium">
                      Medium
                    </SelectItem>

                    <SelectItem value="large">
                      Large
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>

              <CardFooter className="p-2">
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
                        return <RenderBlock key={i} block={child} index={i} blocks={children} setBlocks={(children) => {
                          return updateBlock({
                            type: 'grid',
                            size,
                            children: children as Block[],
                            id,
                          }, index)
                        }} />
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
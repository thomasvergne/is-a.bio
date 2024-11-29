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
import { ColorPicker } from "./ui/color-picker";
import { alignment, Block, columnSpan, gridSizes, sizeTable } from "./types";

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
  const imageWidthRef = useRef<HTMLInputElement>(null);
  const imageHeightRef = useRef<HTMLInputElement>(null);
  const imageSpanRef = useRef<HTMLInputElement>(null);

  const gridSizeRef = useRef<HTMLInputElement>(null);
  const gridColorRef = useRef<HTMLInputElement>(null);

  const buttonUrlRef = useRef<HTMLInputElement>(null);
  const buttonTextRef = useRef<HTMLInputElement>(null);
  const buttonSpanRef = useRef<HTMLInputElement>(null);
  const buttonColorRef = useRef<HTMLInputElement>(null);

  function updateBlock(block: Block, index: number) {
    setBlocks(blocks.map((b, i) => i === index ? block : b));
  }

  switch (renderedBlock.type) {
    case "image": {
      const { url, alt, columnSpan: colS, height, width } = renderedBlock;
      return <>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <img
              key={index}
              src={url}
              alt={alt}
              className={cn("object-cover", colS && columnSpan[colS])}
              style={{ 
                height: height === 'auto' ? '12rem' : `${height}px`, 
                width: width === 'auto' 
                  ? 'auto' 
                  : width === 'full'
                    ? '100%'
                    : `${width}px`
              }}
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

                <div className="grid grid-cols-2 gap-2"> 
                  <Label className="mt-4 block mb-2">
                    Image width
                  </Label>

                  <Label className="mt-4 block mb-2">
                    Image height
                  </Label>

                  <Input ref={imageWidthRef} placeholder="Enter image width" type="number" defaultValue={width} />
                  <Input ref={imageHeightRef} placeholder="Enter image height" type="number" defaultValue={height} />
                </div>

                { 
                  isGrid 
                    && <>
                        <Label className="my-2 block">
                          Column span (length that the button should span)
                        </Label>

                        <Input ref={imageSpanRef}  placeholder="Enter column span" type="number" defaultValue={colS} max={parent?.type === 'grid' ? parent.size : 1} min={1} />
                      </>
                }
              </CardContent>

              <CardFooter className="flex justify-between p-2">
                <Button onClick={() => {
                  if (!imageUrlRef.current || !imageAltRef.current) return;

                  const url = imageUrlRef.current.value;
                  const alt = imageAltRef.current.value;
                  const width = imageWidthRef.current 
                    ? isNaN(parseInt(imageWidthRef.current.value, 10)) && imageWidthRef.current.value === 'full'
                      ? 'full'
                      : parseInt(imageWidthRef.current.value, 10)
                    : 'auto';
                  const height = imageHeightRef.current ? parseInt(imageHeightRef.current.value, 10) : 'auto';
                  const colS = imageSpanRef.current ? parseInt(imageSpanRef.current.value, 10) : 1;

                  updateBlock({
                    type: 'image',
                    url,
                    alt,
                    id: renderedBlock.id,
                    width,
                    height,
                    columnSpan: colS,
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
      const { content, id, columnSpan: colS, color } = renderedBlock;

      return <TextEditor 
        value={content} 
        onValueChange={(val) => {
          updateBlock({
            type: 'text',
            content: val,
            id,
            color,
          }, index);
        }}

        color={color}
        onColorChange={(color) => {
          updateBlock({
            type: 'text',
            content,
            id,
            color,
          }, index);
        }}

        isGrid={isGrid}

        colSpan={colS ?? 1}
        onColSpanChange={(colspan) => {
          updateBlock({
            type: 'text',
            content,
            id,
            color,
            columnSpan: colspan,
          }, index);

          console.log(colspan);
        }}

        deleteText={() => {
          setBlocks(blocks.filter((_, i) => i !== index));
        }}

        className={cn(colS && columnSpan[colS])} 
        style={{ color }}
      />
    }

    case 'button': {
      const { text, url, align, id, columnSpan: colS, color } = renderedBlock;

      return <>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className={cn("flex w-full", alignment[align], colS && columnSpan[colS])}>
              <Button style={{ backgroundColor: color, }}>
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
                    color,
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

                        <Input ref={buttonSpanRef}  placeholder="Enter column span" type="number" defaultValue={colS} max={parent?.type === 'grid' ? parent.size : 1} min={1} />
                      </>
                }

                <Label className="mb-2">
                  Button color
                </Label>

                <ColorPicker ref={buttonColorRef} defaultValue={color} />
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
                  const color = buttonColorRef.current ? buttonColorRef.current.value : 'hsl(var(--primary))';

                  updateBlock({
                    type: 'button',
                    text,
                    url,
                    align,
                    id,
                    columnSpan: buttonSpanRef.current ? parseInt(buttonSpanRef.current.value, 10) : 1,
                    color,
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
      const { size, children, id, color } = renderedBlock;
      
      return <>
        <BlockContext.Provider value={{ blocks: children, setBlocks: (children) => {
          updateBlock({
            type: 'grid',
            size,
            children: children as Block[],
            id,
            color
          }, index);
        }}}>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className={cn("grid gap-4 w-full col-span-2 items-center group border border-dashed border-slate-200 p-2 rounded-lg min-h-20", size in gridSizes ? gridSizes[size] : "col-span-1")} style={{ backgroundColor: color }}>
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
                  color
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

                  <Label>
                    Grid color
                  </Label>

                  <Input ref={gridColorRef} type="color" />

                  <Label>
                    Grid width
                  </Label>

                  <Input type="number" />
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
                      color,
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

    case 'vertical-space': {
      const { size } = renderedBlock;

      return <div className={cn("w-px mx-auto border-l border-dashed border-primary/30 relative", sizeTable[size])} />
    }
  }
}

export function insertAt<A>(arr: A[], index: number, ...items: A[]): A[] {
  return [...arr.slice(0, index), ...items, ...arr.slice(index)];
}

export const BlockContext = createContext({ 
  blocks: [] as Block[], 
  setBlocks: (() => {}) as Dispatch<SetStateAction<Block[]>>
});
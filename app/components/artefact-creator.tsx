import { Divider } from "./ui/divider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Block, BlockContext, insertAt } from "./blocks";
import { Dispatch, SetStateAction, useContext, useRef, useState } from "react";
import { ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from "./ui/context-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ArtefactCreatorProps {
  blocks: Block[];
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  position: number;
  revealOnHover?: boolean;
  style?: 'divider' | 'card';
}

export function ArtefactCreator({ blocks, setBlocks, position, revealOnHover = false, style = 'divider' }: ArtefactCreatorProps) {
  return <div className={`${revealOnHover && "opacity-0 hover:opacity-100 hover:pointer-events-auto group-hover:pointer-events-auto group-hover:opacity-100 transition-all duration-200"}`}>
    {
      style === 'divider'
        ? <Divider>
            <Menu blocks={blocks} setBlocks={setBlocks} position={position} style={style} />
          </Divider>
        : <div className="h-full w-full mx-auto grid place-items-center">
            <Menu blocks={blocks} setBlocks={setBlocks} position={position} style={style} />
          </div>
    }
  </div>
}

export function Menu({ position }: ArtefactCreatorProps) {
  const { blocks, setBlocks } = useContext(BlockContext);

  const imageUrlRef = useRef<HTMLInputElement>(null);
  const imageAltRef = useRef<HTMLInputElement>(null);
  const imageHeightRef = useRef<HTMLInputElement>(null);
  const imageWidthRef = useRef<HTMLInputElement>(null);

  const gridSizeRef = useRef<HTMLInputElement>(null);

  const buttonUrlRef = useRef<HTMLInputElement>(null);
  const buttonTextRef = useRef<HTMLInputElement>(null);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');

  const [height, setHeight] = useState<number>(3);

  function addImage() {
    const url = imageUrlRef.current?.value;
    const alt = imageAltRef.current?.value;
    const height = imageHeightRef.current?.value;
    const width = imageWidthRef.current?.value;

    if (!url || !alt) {
      return
    }

    setBlocks(insertAt(blocks, position, {
      type: "image",
      url,
      alt,
      id: `image-${position}`,
      height: height ? parseInt(height, 10) : 'auto',
      width: width ? parseInt(width, 10) : 'auto',
    }));
  }

  function addGrid() {
    const size = parseInt(gridSizeRef.current?.value || "0", 10);

    if (!size) {
      return
    }

    setBlocks(insertAt(blocks, position, {
      type: "grid",
      size,
      children: [],
      id: `grid-${position}`,
    }));
  }

  function addText() {
    setBlocks(insertAt(blocks, position, {
      type: "text",
      content: "Hello, world!",
      size: 'small',
      id: `text-${position}`,
    }));
  }

  function addButton() {
    const url = buttonUrlRef.current?.value;
    const text = buttonTextRef.current?.value;
    const align = alignment;

    if (!url || !text || !align) {
      return
    }

    setBlocks(insertAt(blocks, position, {
      type: "button",
      text,
      url,
      align,
      id: `button-${position}`,
    }));
  }

  function addSeparator() {
    setBlocks(insertAt(blocks, position, {
      type: "vertical-space",
      size: height,
      id: `separator-${position}`,
    }));
  }

  return <>
    <ContextMenuItem inset onClick={addText}>
      Add a text box
    </ContextMenuItem>
    <ContextMenuSub>
      <ContextMenuSubTrigger inset>
        Add an image
      </ContextMenuSubTrigger>

      <ContextMenuSubContent asChild>
        <Card>
          <CardHeader>
            <CardTitle>
              Add an extern image
            </CardTitle>

            <CardDescription>
              Add an image from an external URL to your portfolio
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Label className="block mb-2">
              Image URL
            </Label>

            <Input ref={imageUrlRef} placeholder="Enter image URL" type="text" />

            <Label className="block mt-4 mb-2">
              Image alt text
            </Label>

            <Input ref={imageAltRef} placeholder="Enter image alt text" type="text" />


            <div className="grid grid-cols-2 gap-2"> 
              <Label className="mt-4 block mb-2">
                Image width
              </Label>

              <Label className="mt-4 block mb-2">
                Image height
              </Label>

              <Input ref={imageWidthRef} placeholder="Enter image width" type="number" />
              <Input ref={imageHeightRef} placeholder="Enter image height" type="number" />
            </div>

            <Button onClick={addImage} className="mt-4">
              Add image
            </Button>
          </CardContent>
        </Card>
      </ContextMenuSubContent>
    </ContextMenuSub>

    <ContextMenuSub>
      <ContextMenuSubTrigger inset>
        Add a button
      </ContextMenuSubTrigger>

      <ContextMenuSubContent asChild>
        <Card>
          <CardHeader>
            <CardTitle>
              Add a button
            </CardTitle>

            <CardDescription>
              Add a button to your portfolio that links to a specific URL
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Label className="block mb-2">
              Button text
            </Label>

            <Input ref={buttonTextRef} placeholder="Enter button text" type="text" />

            <Label className="block mt-4 mb-2">
              Button URL
            </Label>

            <Input ref={buttonUrlRef} placeholder="Enter button URL" type="text" />

            <Label className="block mt-4 mb-2">
              Button alignment
            </Label>

            <Select onValueChange={(val) => setAlignment(val as 'left' | 'center' | 'right')}>
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

            <Button onClick={addButton} className="mt-4">
              Add button
            </Button>
          </CardContent>
        </Card>
      </ContextMenuSubContent>
    </ContextMenuSub>

    <ContextMenuSub>
      <ContextMenuSubTrigger inset>
        Add a vertical separator
      </ContextMenuSubTrigger>

      <ContextMenuSubContent asChild>
        <Card>
          <CardHeader>
            <CardTitle>
              Add a vertical separator
            </CardTitle>

            <CardDescription>
              Add a vertical separator to your portfolio
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Label className="block mb-2">
              Separator height
            </Label>

            <Select onValueChange={(val) => setHeight(Number(val) ?? 1)}>
              <SelectTrigger>
                <SelectValue placeholder="Select separator height" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1">
                  Very small
                </SelectItem>

                <SelectItem value="2">
                  Small
                </SelectItem>

                <SelectItem value="3">
                  Medium
                </SelectItem>

                <SelectItem value="4">
                  Large
                </SelectItem>

                <SelectItem value="5">
                  Very large
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>

          <CardContent>
            <Button onClick={addSeparator}>
              Add separator
            </Button>
          </CardContent>
        </Card>
      </ContextMenuSubContent>
    </ContextMenuSub>

    <ContextMenuSub>
      <ContextMenuSubTrigger inset>
        Add a grid
      </ContextMenuSubTrigger>

      <ContextMenuSubContent asChild>
        <Card>
          <CardHeader>
            <CardTitle>
              Add a grid
            </CardTitle>

            <CardDescription>
              Add a grid to your portfolio
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Label className="block mb-2">
              Grid size
            </Label>

            <Input ref={gridSizeRef} placeholder="Enter grid size" type="number" max={3} min={1} defaultValue={2} />

            <Button onClick={addGrid} className="mt-4">
              Add grid
            </Button>
          </CardContent>
        </Card>
      </ContextMenuSubContent>
    </ContextMenuSub>

    <ContextMenuItem className="text-destructive" inset>
      Back
    </ContextMenuItem>
  </>
}
import { Divider } from "./ui/divider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Block, BlockContext, insertAt } from "./blocks";
import { Dispatch, SetStateAction, useContext, useRef } from "react";
import { ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from "./ui/context-menu";

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
  const gridSizeRef = useRef<HTMLInputElement>(null);

  function addImage() {
    const url = imageUrlRef.current?.value;
    const alt = imageAltRef.current?.value;

    if (!url || !alt) {
      return
    }

    setBlocks(insertAt(blocks, position, {
      type: "image",
      url,
      alt,
      id: `image-${position}`,
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

            <Button onClick={addImage} className="mt-4">
              Add image
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
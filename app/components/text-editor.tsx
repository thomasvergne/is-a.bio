import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { marked } from 'marked';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "./ui/context-menu";
import { cn } from "~/lib/utils";
import { ColorPicker } from "./ui/color-picker";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Block } from "./types";

interface TextEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  deleteText: () => void;
  onColorChange: (color: string) => void;
  onColSpanChange: (colSpan: number) => void;
  colSpan: number;
  color: string;
  isGrid?: boolean;
  parent?: Block;
}

export function TextEditor({ value, onValueChange, onColorChange, className, deleteText, style, color, isGrid, colSpan, parent, onColSpanChange }: TextEditorProps) {
  const [isEditing, setIsEditing] = useState(true);
  
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onDoubleClick={() => setIsEditing(!isEditing)}>
        {
          isEditing 
            ? <Textarea 
                defaultValue={value} 
                placeholder="Enter the description of your portfolio"
                onChange={(e) => onValueChange(e.target.value)}
                className={className} 
                style={style}
              />
            : <div dangerouslySetInnerHTML={{ __html: marked(value) }} className={cn("!w-full prose max-w-full", className)} style={style} />
        }
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem disabled={value === ''} onSelect={() => {
          if (value === '') {
            return;
          }
          setIsEditing(!isEditing);
        }}>
          {isEditing ? "View" : "Edit"}
        </ContextMenuItem>
        
        <div className="m-2">
          <ColorPicker color={color} onColorChange={onColorChange} />
        </div>


        { 
          isGrid 
            && <div className="m-2">
                <Label className="block mb-2">
                  Column span (length that the button should span)
                </Label>

                <Input 
                  placeholder="Enter column span" type="number" 
                  defaultValue={colSpan} 
                  max={parent?.type === 'grid' ? parent.size : 1} 
                  onChange={(e) => {
                    if (e.target.value === '') {
                      return;
                    }

                    if (isNaN(Number(e.target.value))) {
                      return;
                    }

                    console.log(e.target.value)

                    onColSpanChange(Number(e.target.value))
                  }} 
                  min={1} 
                />
              </div>
        }

        <ContextMenuSeparator />

        <ContextMenuItem onSelect={deleteText}>
          Remove
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
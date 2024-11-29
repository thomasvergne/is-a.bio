import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { marked } from 'marked';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "./ui/context-menu";
import { cn } from "~/lib/utils";
import { ColorPicker } from "./ui/color-picker";

interface TextEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  deleteText: () => void;
  onColorChange: (color: string) => void;
  color: string;
}

export function TextEditor({ value, onValueChange, onColorChange, className, deleteText, style, color }: TextEditorProps) {
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

        <ContextMenuSeparator />

        <ContextMenuItem onSelect={deleteText}>
          Remove
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
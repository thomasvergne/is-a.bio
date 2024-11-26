import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { marked } from 'marked';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuTrigger } from "./ui/context-menu";
import { cn } from "~/lib/utils";

interface TextEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  setSize: (size: 'small' | 'medium' | 'large') => void;
  size: 'small' | 'medium' | 'large';
  deleteText: () => void;
}

export function TextEditor({ value, onValueChange, setSize, size, className, deleteText }: TextEditorProps) {
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
              />
            : <div dangerouslySetInnerHTML={{ __html: marked(value) }} className={cn("!w-full prose max-w-full", className)} />
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

        <ContextMenuRadioGroup value={size}>
          <ContextMenuRadioItem value="small" onSelect={() => setSize('small')}>
            Small
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="medium" onSelect={() => setSize('medium')}>
            Medium
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="large" onSelect={() => setSize('large')}>
            Large
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>

        <ContextMenuSeparator />

        <ContextMenuItem onSelect={deleteText}>
          Remove
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
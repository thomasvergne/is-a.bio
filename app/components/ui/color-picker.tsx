import { forwardRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { HexColorPicker } from 'react-colorful';
import { Input } from "./input";

interface ColorPickerProps extends React.HTMLAttributes<HTMLInputElement>, React.RefAttributes<HTMLInputElement> {
  onColorChange?: (color: string) => void;
}

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(({ defaultValue, ...props }, ref) => {
  const [color, setColor] = useState<string>(defaultValue as string || "#000000");

  return <>
    <input type="hidden" value={color} ref={ref} />

    <Popover>
      <PopoverTrigger asChild>
        <span className="relative block w-12 h-12 rounded-md border border-slate-200" style={{ backgroundColor: color }}>

        </span>
      </PopoverTrigger>

      <PopoverContent>
        <HexColorPicker color={color} onChange={(val) => {
          setColor(val);
          props.onColorChange?.call(null, val);
        }} className="!w-full mb-2" />

        <Input type="text" value={color} onChange={(e) => {
          setColor(e.target.value);
          props.onColorChange?.call(null, e.target.value);
        }} {...props} />
      </PopoverContent>
    </Popover>
  </>;
});

ColorPicker.displayName = "ColorPicker";  
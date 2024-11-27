import { marked } from "marked";
import { alignment, Block, columnSpan, gridSizes, sizeTable } from "./blocks";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

export function PreviewBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'image': {
      const { url, alt, columnSpan: colS, height, width } = block;

      return <img
        src={url}
        alt={alt}
        className={cn("object-cover my-8", colS && columnSpan[colS])}
        style={{ height: height === 'auto' ? '12rem' : `${height}px`, width: width === 'auto' ? 'auto' : `${width}px` }}
      />;
    }

    case 'text': {
      const { content } = block;

      return <div className="prose my-2 max-w-full" dangerouslySetInnerHTML={{ __html: marked(content) }} />;
    }

    case 'grid': {
      const { children, size } = block;
      return <div className={cn("grid gap-4 my-4", size in gridSizes ? gridSizes[size] : 'col-span-1')}>
        {children.map((child, index) => <PreviewBlock key={index} block={child} />)}
      </div>;
    }

    case 'button': {
      const { text, url, align, columnSpan: colS } = block;

      return <div className={cn("w-full flex items-center", alignment[align], colS && columnSpan[colS])}>
        <Button asChild>
          <a href={url}>
            {text}
          </a>
        </Button>
      </div>
    }

    case 'vertical-space': {
      const { size } = block;

      return <div className={cn("relative", sizeTable[size])} />;
    }
  }
}
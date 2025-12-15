"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { BlockConfig, BlockType, CustomTheme } from "../types"

interface DraggableBlockProps {
  blockType: BlockType
  config: BlockConfig
  id: string
  themeOverride?: CustomTheme
}

export function DraggableBlock({ blockType, config, id, themeOverride }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { blockType, config },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = config.icon

  // Get effective colors (themeOverride takes precedence)
  const blockTheme = themeOverride?.blocks?.[blockType]
  const effectiveColor = blockTheme?.color ?? config.color
  const effectiveBgColor = blockTheme?.bgColor ?? config.bgColor

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing ${effectiveBgColor} transition-all hover:scale-105`}
    >
      <div className={`flex min-w-6 h-6 w-6 items-center justify-center rounded-md bg-card ${effectiveColor}`}>
        <Icon className="min-w-4 h-4 w-4" />
      </div>
      <div>
        <p className="font-medium text-sm text-foreground">{config.label}</p>
        {config.description && (
          <p className="text-xs text-muted-foreground">{config.description}</p>
        )}
      </div>
    </div>
  )
}

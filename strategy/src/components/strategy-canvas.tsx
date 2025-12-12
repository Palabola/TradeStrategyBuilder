"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CanvasBlock } from "./canvas-block"
import { ArrowDown } from "lucide-react"
import { BlockConfig } from ".."
import { BlockType } from "../types"

interface CanvasItem {
  id: string
  blockType: BlockType
  config: BlockConfig
  values: Record<string, string | number>
}

interface StrategyCanvasProps {
  items: CanvasItem[]
  onRemoveBlock: (id: string) => void
  onValueChange: (id: string, name: string, value: string | number) => void
}

export function StrategyCanvas({ items, onRemoveBlock, onValueChange }: StrategyCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[500px] rounded-xl border-2 border-dashed p-6 transition-colors ${
        isOver ? "border-primary bg-primary/5" : "border-border bg-muted/30"
      }`}
    >
      {items.length === 0 ? (
        <div className="flex h-full min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ArrowDown className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Drop blocks here</h3>
            <p className="text-muted-foreground">Drag blocks from the sidebar to build your strategy</p>
          </div>
        </div>
      ) : (
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id}>
                <CanvasBlock
                  id={item.id}
                  blockType={item.blockType}
                  config={item.config}
                  values={item.values}
                  onRemove={() => onRemoveBlock(item.id)}
                  onValueChange={(name, value) => onValueChange(item.id, name, value)}
                />
                {index < items.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  )
}

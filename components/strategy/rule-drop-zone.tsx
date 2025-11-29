"use client"

import type React from "react"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CanvasBlock } from "./canvas-block"
import type { BlockConfig, BlockCategory } from "./block-types"
import { Plus, Pencil, Check, X, ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CanvasItem {
  id: string
  config: BlockConfig
  values: Record<string, string | number>
}

interface RuleDropZoneProps {
  id: string
  name: string
  onNameChange: (name: string) => void
  conditionItems: CanvasItem[]
  actionItems: CanvasItem[]
  onRemoveBlock: (id: string, category: BlockCategory) => void
  onValueChange: (id: string, name: string, value: string | number, category: BlockCategory) => void
  onDelete?: () => void
  canDelete?: boolean
  onMobileDropZoneClick?: (groupId: string, category: BlockCategory) => void
}

export function RuleDropZone({
  id,
  name,
  onNameChange,
  conditionItems,
  actionItems,
  onRemoveBlock,
  onValueChange,
  onDelete,
  canDelete = true,
  onMobileDropZoneClick,
}: RuleDropZoneProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(name)

  const { setNodeRef: setConditionsRef, isOver: isOverConditions } = useDroppable({ id: `${id}-conditions` })
  const { setNodeRef: setActionsRef, isOver: isOverActions } = useDroppable({ id: `${id}-actions` })

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditValue(name)
    setIsEditing(true)
  }

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (editValue.trim()) {
      onNameChange(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditValue(name)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editValue.trim()) {
        onNameChange(editValue.trim())
      }
      setIsEditing(false)
    } else if (e.key === "Escape") {
      setEditValue(name)
      setIsEditing(false)
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl border-2 border-border">
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between rounded-t-lg px-4 py-3 bg-muted/30 transition-colors hover:opacity-80">
            <div className="flex items-center gap-3">
              <ChevronDown className={`h-5 w-5 transition-transform text-foreground ${isOpen ? "" : "-rotate-90"}`} />
              {isEditing ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-7 w-40 text-sm"
                    placeholder="Rule name"
                    autoFocus
                  />
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSaveEdit}>
                    <Check className="h-4 w-4 text-success" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-foreground">{name}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={handleStartEdit}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {conditionItems.length} condition{conditionItems.length !== 1 ? "s" : ""}, {actionItems.length}{" "}
                    action{actionItems.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="h-8 text-muted-foreground hover:text-destructive"
              >
                Remove
              </Button>
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Conditions</h4>
              <div
                ref={setConditionsRef}
                className={`min-h-[100px] p-3 rounded-lg border-2 border-dashed transition-colors relative ${
                  isOverConditions ? "border-primary bg-primary/5" : "border-border bg-muted/10"
                }`}
              >
                {conditionItems.length === 0 ? (
                  <div 
                    onClick={() => onMobileDropZoneClick?.(id, "condition")}
                    className="flex h-[80px] items-center justify-center cursor-pointer lg:cursor-default"
                  >
                    <div className="text-center">
                      <Plus className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground hidden lg:block">Drop conditions here</p>
                      <p className="text-sm text-muted-foreground lg:hidden">Tap to add condition</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <SortableContext items={conditionItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3 relative z-10">
                        {conditionItems.map((item) => (
                          <CanvasBlock
                            key={item.id}
                            id={item.id}
                            config={item.config}
                            values={item.values}
                            onRemove={() => onRemoveBlock(item.id, "condition")}
                            onValueChange={(name, value) => onValueChange(item.id, name, value, "condition")}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        onMobileDropZoneClick?.(id, "condition")
                      }}
                      className={`mt-3 h-12 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors cursor-pointer lg:cursor-default ${
                        isOverConditions ? "border-primary bg-primary/10" : "border-muted-foreground/30"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${isOverConditions ? "text-primary" : "text-muted-foreground"}`}
                      >
                        + Add another condition
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Actions</h4>
              <div
                ref={setActionsRef}
                className={`min-h-[100px] p-3 rounded-lg border-2 border-dashed transition-colors relative ${
                  isOverActions ? "border-success bg-success/5" : "border-border bg-muted/10"
                }`}
              >
                {actionItems.length === 0 ? (
                  <div 
                    onClick={() => onMobileDropZoneClick?.(id, "action")}
                    className="flex h-[80px] items-center justify-center cursor-pointer lg:cursor-default"
                  >
                    <div className="text-center">
                      <Plus className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground hidden lg:block">Drop actions here</p>
                      <p className="text-sm text-muted-foreground lg:hidden">Tap to add action</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <SortableContext items={actionItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3 relative z-10">
                        {actionItems.map((item) => (
                          <CanvasBlock
                            key={item.id}
                            id={item.id}
                            config={item.config}
                            values={item.values}
                            onRemove={() => onRemoveBlock(item.id, "action")}
                            onValueChange={(name, value) => onValueChange(item.id, name, value, "action")}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        onMobileDropZoneClick?.(id, "action")
                      }}
                      className={`mt-3 h-12 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors cursor-pointer lg:cursor-default ${
                        isOverActions ? "border-success bg-success/10" : "border-muted-foreground/30"
                      }`}
                    >
                      <p className={`text-sm font-medium ${isOverActions ? "text-success" : "text-muted-foreground"}`}>
                        + Add another action
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

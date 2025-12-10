"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getStrategyById, saveStrategyToStorage } from "@/lib/strategy-storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Plus, X, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { agentService, supportedModels } from "../../lib/agent-service"
import { supportedIndicators, supportedTimeframes } from "../../lib/strategy-runner"
import { predefinedStrategies } from "../../lib/predefined-strategies"
import { CustomTheme, BlockType, blockConfigs, IndicatorOption, StrategyTemplate, StrategyBuilder} from '@palabola86/trade-strategy-builder'

type ThemeOption = "none" | "grayscale" | "colored"

// Pre-compute themes at module level for stability
const GRAYSCALE_THEME: CustomTheme = (() => {
  const blocks: CustomTheme["blocks"] = {}
  const blockTypes = Object.keys(blockConfigs) as BlockType[]
  
  for (const blockType of blockTypes) {
    blocks[blockType] = {
      color: "text-gray-500",
      bgColor: "bg-gray-500/10 border-gray-500/30",
    }
  }
  
  return { blocks }
})()

const COLORED_THEME: CustomTheme = (() => {
  const blocks: CustomTheme["blocks"] = {}
  const blockTypes = Object.keys(blockConfigs) as BlockType[]
  
  for (const blockType of blockTypes) {
    const config = blockConfigs[blockType]
    blocks[blockType] = {
      color: config.color,
      bgColor: config.bgColor,
    }
  }
  
  return { blocks }
})()

// Available indicator categories
const indicatorCategories = ["price", "oscillator", "volume", "volatility"]

interface StrategyPageClientProps {
  strategyId?: string
  candleOptions?: string[]
  indicatorOptions?: IndicatorOption[]
  unitOptions?: string[]
  channelOptions?: string[]
  themeOverride?: CustomTheme | null
}

export function StrategyPageClient({
  strategyId,
  candleOptions: initialCandleOptions,
  indicatorOptions: initialIndicatorOptions,
  unitOptions,
  channelOptions,
  themeOverride: initialThemeOverride,
}: StrategyPageClientProps) {
  const router = useRouter()
  const [themeOption, setThemeOption] = useState<ThemeOption>("none")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Candle options state
  const [candleOptions, setCandleOptions] = useState<string[]>(initialCandleOptions || [])
  const [newCandle, setNewCandle] = useState("")
  
  // Indicator options state
  const [indicatorOptions, setIndicatorOptions] = useState<IndicatorOption[]>(initialIndicatorOptions || [])
  const [newIndicatorName, setNewIndicatorName] = useState("")
  const [newIndicatorCategory, setNewIndicatorCategory] = useState("price")

  // Strategy deploy state
  const [showDeployDialog, setShowDeployDialog] = useState(false)
  const [lastSavedStrategyId, setLastSavedStrategyId] = useState<string | null>(null)

  const handleSave = useCallback((strategy: StrategyTemplate) => {
    const savedStrategy = saveStrategyToStorage(strategy)
    setLastSavedStrategyId(savedStrategy.strategyId || null)
    setShowDeployDialog(true)
  }, [])

  // AI function wrapper - delegates to agentService.callAI
  const handleCallAI = useCallback(async (systemPrompt: string, userPrompts: string[], model: string): Promise<string> => {
    return await agentService.callAI(systemPrompt, userPrompts, model)
  }, [])

  const loadStrategyById = useCallback((id: string): StrategyTemplate | null => {
    const strategy = getStrategyById(id)
    return strategy
  }, [])

  // Compute the actual theme based on selection
  const computedTheme = useMemo((): CustomTheme | undefined => {
    switch (themeOption) {
      case "grayscale":
        return GRAYSCALE_THEME
      case "colored":
        return COLORED_THEME
      case "none":
      default:
        return initialThemeOverride ?? undefined
    }
  }, [themeOption, initialThemeOverride])

  // Generate a key that changes when options change to force StrategyBuilder to re-mount
  const builderKey = useMemo(() => {
    return `${themeOption}-${candleOptions.join(",")}-${indicatorOptions.map(i => `${i.name}:${i.category}`).join(",")}`
  }, [themeOption, candleOptions, indicatorOptions])

  // Candle options handlers
  const addCandleOption = () => {
    if (newCandle.trim() && !candleOptions.includes(newCandle.trim())) {
      setCandleOptions([...candleOptions, newCandle.trim()])
      setNewCandle("")
    }
  }

  const removeCandleOption = (candle: string) => {
    setCandleOptions(candleOptions.filter(c => c !== candle))
  }

  const resetCandleOptions = () => {
    setCandleOptions(supportedTimeframes)
  }

  // Indicator options handlers
  const addIndicatorOption = () => {
    if (newIndicatorName.trim() && !indicatorOptions.some(i => i.name === newIndicatorName.trim())) {
      setIndicatorOptions([...indicatorOptions, { name: newIndicatorName.trim(), category: newIndicatorCategory }])
      setNewIndicatorName("")
    }
  }

  const removeIndicatorOption = (name: string) => {
    setIndicatorOptions(indicatorOptions.filter(i => i.name !== name))
  }

  const resetIndicatorOptions = () => {
    setIndicatorOptions(supportedIndicators)
  }

  return (
    <div className="relative">
      {/* Strategy Deployed Dialog */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Strategy Deployed!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Your strategy has been saved successfully. Would you like to analyze its performance on historical data?
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowDeployDialog(false)}
            >
              Not Now
            </Button>
            <Button 
              onClick={() => {
                setShowDeployDialog(false)
                if (lastSavedStrategyId) {
                  router.push(`/analyze?strategy=${lastSavedStrategyId}`)
                }
              }}
              disabled={!lastSavedStrategyId}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Button */}
      <div className="absolute right-0 -top-16 z-10">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Options
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Strategy Builder Options</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Theme Override Section */}
              <div className="grid gap-2">
                <Label htmlFor="theme-select">Theme Override</Label>
                <Select value={themeOption} onValueChange={(value: ThemeOption) => setThemeOption(value)}>
                  <SelectTrigger id="theme-select">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Default)</SelectItem>
                    <SelectItem value="grayscale">Grayscale</SelectItem>
                    <SelectItem value="colored">Colored</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {themeOption === "none" && "Use default block colors"}
                  {themeOption === "grayscale" && "All blocks displayed in grayscale"}
                  {themeOption === "colored" && "Use vibrant colors from block configurations"}
                </p>
              </div>

              {/* Candle Options Section */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Candle Options</Label>
                  <Button variant="ghost" size="sm" onClick={resetCandleOptions} className="h-7 text-xs">
                    Reset to Default
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candleOptions.map((candle) => (
                    <Badge key={candle} variant="secondary" className="gap-1 pr-1">
                      {candle}
                      <button
                        onClick={() => removeCandleOption(candle)}
                        className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 2h, 3d"
                    value={newCandle}
                    onChange={(e) => setNewCandle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCandleOption()}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={addCandleOption}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Indicator Options Section */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Indicator Options</Label>
                  <Button variant="ghost" size="sm" onClick={resetIndicatorOptions} className="h-7 text-xs">
                    Reset to Default
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {indicatorOptions.map((indicator) => (
                    <Badge key={indicator.name} variant="secondary" className="gap-1 pr-1">
                      <span>{indicator.name}</span>
                      <span className="text-xs text-muted-foreground">({indicator.category})</span>
                      <button
                        onClick={() => removeIndicatorOption(indicator.name)}
                        className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Indicator name"
                    value={newIndicatorName}
                    onChange={(e) => setNewIndicatorName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addIndicatorOption()}
                    className="flex-1"
                  />
                  <Select value={newIndicatorCategory} onValueChange={setNewIndicatorCategory}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {indicatorCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={addIndicatorOption}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 w-full">
      <StrategyBuilder
        key={builderKey}
        strategyId={strategyId}
        candleOptions={candleOptions}
        indicatorOptions={indicatorOptions}
        unitOptions={unitOptions}
        channelOptions={channelOptions}
        predefinedStrategies={predefinedStrategies}
        onSave={handleSave}
        themeOverride={computedTheme}
        supportedAIModels={supportedModels}
        callAIFunction={handleCallAI}
        getStrategyById={loadStrategyById}
      />
      </div>
    </div>
  )
}

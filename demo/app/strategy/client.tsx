"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getStrategyById, saveDraftStrategyToStorage, saveStrategyToStorage } from "@/lib/strategy-storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Plus, X, BarChart3, DollarSign, Banknote, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { agentService, supportedModels } from "../../lib/agent-service"
import { supportedIndicators, supportedTimeframes } from "../../lib/strategy-runner"
import { predefinedStrategies } from "../../lib/predefined-strategies"
import { CustomTheme, BlockType, blockConfigs, IndicatorOption, StrategyTemplate, BlockConfig, StrategyBuilder} from "@palabola86/trade-strategy-builder"
import { AnalysisPanel } from "@/components/analysis-panel"

type ThemeOption = "none" | "grayscale" | "colored"

// Grayscale theme definition set all blocks to grayscale colors
const GRAYSCALE_THEME: CustomTheme = (() => {
  const blocks: CustomTheme["blocks"] = {}
  const blockTypes = Object.keys(blockConfigs) as BlockType[]
  
  for (const blockType of blockTypes) {
    blocks[blockType] = {
      color: "text-gray-500",
      bgColor: "bg-gray-500/10 border-gray-500/30",
    }
  }

  blocks["always"] = {
    color: "text-gray-500",
    bgColor: "bg-gray-500/10 border-gray-500/30",
  }

  blocks['buy-limit'] = {
    color: "text-gray-500",
    bgColor: "bg-gray-500/10 border-gray-500/30",
  }

  blocks['sell-limit'] = {
    color: "text-gray-500",
    bgColor: "bg-gray-500/10 border-gray-500/30",
  }

  return { blocks }
})()

// Colored theme definition with app defined vibrant colors
const COLORED_THEME: CustomTheme = {
  blocks: {
    "increased-by": {
      color: "text-info",
      bgColor: "bg-info/10 border-info/30",
    },
    "decreased-by": {
      color: "text-destructive",
      bgColor: "bg-destructive/10 border-destructive/30",
    },
    "greater-than": {
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/30",
    },
    "lower-than": {
      color: "text-pink",
      bgColor: "bg-pink/10 border-pink/30",
    },
    "crossing-above": {
      color: "text-cyan",
      bgColor: "bg-cyan/10 border-cyan/30",
    },
    "crossing-below": {
      color: "text-teal",
      bgColor: "bg-teal/10 border-teal/30",
    },
    "open-position": {
      color: "text-success",
      bgColor: "bg-success/10 border-success/30",
    },
    "close-position": {
      color: "text-destructive",
      bgColor: "bg-destructive/10 border-destructive/30",
    },
    "buy": {
      color: "text-success",
      bgColor: "bg-success/10 border-success/30",
    },
    "sell": {
      color: "text-destructive",
      bgColor: "bg-destructive/10 border-destructive/30",
    },
    "buy-order": {
      color: "text-success",
      bgColor: "bg-success/10 border-success/30",
    },
    "sell-order": {
      color: "text-destructive",
      bgColor: "bg-destructive/10 border-destructive/30",
    },
    "notify-me": {
      color: "text-warning",
      bgColor: "bg-warning/10 border-warning/30",
    },
    "buy-limit": {
      color: "text-success",
      bgColor: "bg-success/10 border-success/30",
    },
    "sell-limit": {
      color: "text-destructive",
      bgColor: "bg-destructive/10 border-destructive/30",
    },
    "always": {
      color: "text-warning",
      bgColor: "bg-warning/10 border-warning/30",
    },
  },
}

// Available indicator categories
const indicatorCategories = ["price", "oscillator", "volume", "volatility"]

interface StrategyPageClientProps {
  initialStrategy?: StrategyTemplate
  candleOptions?: string[]
  indicatorOptions?: IndicatorOption[]
  unitOptions?: string[]
  channelOptions?: string[]
  themeOverride?: CustomTheme | null
}

export function StrategyPageClient({
  initialStrategy,
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

  // Current strategy state for onStrategyChange callback
  const [currentStrategy, setCurrentStrategy] = useState<StrategyTemplate | null>(null)

  const customBlockConfigs: Record<BlockType, BlockConfig> = useMemo(() => ({
    // Example custom block configuration
    'buy-limit': {
      label: 'Buy Limit',
      description: 'Place a buy limit order at a specified price',
      promptDescription: "Buy limit order at a limitPrice in unitLimit as specific price or percentage from current price. stopLoss, takeProfit, and trailingStop are optional and can be set as percentages.",
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 border-green-500/30',
      category: 'action',
      parameters: [
        [
          {
            name: "limitPrice",
            type: "number",
            label: "Limit Price",
            default: 0.5,
            required: true,
          },
          {
            name: "unitLimit",
            type: "select",
            label: "Unit",
            options: unitOptions,
            default: "%",
            required: true,
          },
        ],
        [
          {
            name: "amount",
            type: "number",
            label: "Amount",
            placeholder: "100",
            default: 100,
            required: true,
          },
          {
            name: "unit",
            type: "select",
            label: "Unit",
            options: unitOptions,
            default: "USD",
            required: true,
          },
        ],
        [
          {
            name: "stopLoss",
            type: "number",
            label: "Stop Loss (%)",
            default: 0,
          },
          {
            name: "takeProfit",
            type: "number",
            label: "Take Profit (%)",
            default: 0,
          },
          {
            name: "trailingStop",
            type: "number",
            label: "Trailing Stop (%)",
            default: 0,
          },
        ],
      ]
    },
     "sell-limit": {
    label: "Sell Limit",
    labelPostfixFunction: (params: any) => {
      let result = `${params.amount} ${params.unit}`
      if (Number(params.stopLoss) > 0 || Number(params.takeProfit) > 0) {
        if (Number(params.stopLoss) > 0) result += ` SL:${params.stopLoss}%`
        if (Number(params.takeProfit) > 0) result += ` TP:${params.takeProfit}%`
      }
      return result
    },
    description: "Place a sell limit order at a specified price",
    promptDescription: "Sell limit order at a limitPrice in unitLimit as specific price or percentage from current price. stopLoss, takeProfit, and trailingStop are optional and can be set as percentages.",
    icon: Banknote,
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/30",
    category: "action",
    parameters: [
       [
          {
            name: "limitPrice",
            type: "number",
            label: "Limit Price",
            default: 0.5,
            required: true,
          },
          {
            name: "unitLimit",
            type: "select",
            label: "Unit",
            options: unitOptions,
            default: "%",
            required: true,
          },
      ],
      [
        {
          name: "amount",
          type: "number",
          label: "Amount",
          placeholder: "100",
          default: 100,
          required: true,
        },
        {
          name: "unit",
          type: "select",
          label: "Unit",
          options: unitOptions,
          default: "USD",
          required: true,
        },
      ],
      [
        {
          name: "stopLoss",
          type: "number",
          label: "Stop Loss (%)",
          default: 0,
        },
        {
          name: "takeProfit",
          type: "number",
          label: "Take Profit (%)",
          default: 0,
        },
        {
          name: "trailingStop",
          type: "number",
          label: "Trailing Stop (%)",
          default: 0,
        },
      ],
    ],
    },
    "always": {
      label: "Always Trigger",
      promptDescription: "Always triggers the associated action block. Use this to create actions that should run unconditionally every time.",
      icon: Bell,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10 border-yellow-500/30",
      category: "condition",
      parameters: [],
    },
  }), [unitOptions])

  // Save strategy handler
  const handleSave = useCallback((strategy: StrategyTemplate) => {
    saveStrategyToStorage(strategy)
    setShowDeployDialog(true)
  }, [])

  // Handle strategy changes from the builder
  const handleStrategyChange = useCallback((strategy: StrategyTemplate | null) => {
    setCurrentStrategy(strategy)
    saveDraftStrategyToStorage(strategy)
  }, [])

  // AI function wrapper - delegates to agentService.callAI
  const handleCallAI = useCallback(async (
    systemPrompt: string, 
    userPrompts: string[], 
    model: string): Promise<string> => {
    return await agentService.callAI(systemPrompt, userPrompts, model)
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

  // Memoize config options to prevent unnecessary re-renders
  const configOptions = useMemo(() => ({
    ...blockConfigs,
    ...customBlockConfigs
  }), [customBlockConfigs])

  // Effective initial strategy - either from props or localStorage draft
  const [effectiveInitialStrategy, setEffectiveInitialStrategy] = useState<StrategyTemplate | undefined>(initialStrategy)

  // Load draft strategy from localStorage if no initialStrategy provided
  useEffect(() => {
    if (!initialStrategy) {
      try {
        const draft = localStorage.getItem('strategy-draft')
        if (draft) {
          const parsedDraft = JSON.parse(draft) as StrategyTemplate
          setEffectiveInitialStrategy(parsedDraft)
        }
      } catch (error) {
        console.warn('Failed to load strategy draft from localStorage:', error)
      }
    } else {
      setEffectiveInitialStrategy(initialStrategy)
    }
  }, [initialStrategy])

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
              Your strategy has been saved successfully.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowDeployDialog(false)}>
              OK
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

      <div className="grid grid-cols-1 2xl:grid-cols-20 gap-4 w-full">
        <div className="2xl:col-span-11">

          <StrategyBuilder
            initialStrategy={effectiveInitialStrategy}
            configOptions={configOptions}
            themeOverride={computedTheme}
            candleOptions={candleOptions}
            indicatorOptions={indicatorOptions}
            unitOptions={unitOptions}
            predefinedStrategies={predefinedStrategies}
            supportedAIModels={supportedModels}
            onSave={handleSave}
            onStrategyChange={handleStrategyChange}
            callAIFunction={handleCallAI}
          />


        </div>
        <div className="2xl:col-span-9">
          {/* Analysis Panel */}
          <AnalysisPanel 
            selectedStrategy={currentStrategy}
            layout="column"
            showEmptyState={true}
            emptyStateMessage="Build a strategy to run analysis"
          />
        </div>
      </div>
    </div>
  )
}

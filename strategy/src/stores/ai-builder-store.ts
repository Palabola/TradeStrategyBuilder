import { create } from 'zustand'

interface AIBuilderState {
  // AI model and prompt
  selectedAIModel: string
  aiPrompt: string
  aiSystemPrompt: string
  
  // Generation result
  aiGeneratedJson: string
}

interface AIBuilderActions {
  // AI model and prompt actions
  setSelectedAIModel: (model: string) => void
  setAiPrompt: (prompt: string) => void
  setAiSystemPrompt: (prompt: string) => void
  
  // Generation actions
  setAiGeneratedJson: (json: string) => void
  
  // Utility actions
  reset: () => void
  initialize: (defaultModel: string, systemPrompt: string) => void
}

type AIBuilderStore = AIBuilderState & AIBuilderActions

const initialState: AIBuilderState = {
  selectedAIModel: '',
  aiPrompt: '',
  aiSystemPrompt: '',
  aiGeneratedJson: '',
}

export const useAIBuilderStore = create<AIBuilderStore>((set) => ({
  ...initialState,
  
  // AI model and prompt actions
  setSelectedAIModel: (model) => set({ selectedAIModel: model }),
  setAiPrompt: (prompt) => set({ aiPrompt: prompt }),
  setAiSystemPrompt: (prompt) => set({ aiSystemPrompt: prompt }),
  
  // Generation actions
  setAiGeneratedJson: (json) => set({ aiGeneratedJson: json }),
  
  // Utility actions
  reset: () => set({
    aiPrompt: '',
    aiGeneratedJson: '',
  }),
  
  initialize: (defaultModel, systemPrompt) => set({
    selectedAIModel: defaultModel, 
    aiSystemPrompt: systemPrompt
  }),
}))

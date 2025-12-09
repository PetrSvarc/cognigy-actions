type CognigyAnalyticsEvent = {
  type: string
  payload?: Record<string, unknown>
}

interface CognigyWebchatInstance {
  open?: () => void
  close?: () => void
  sendMessage?: (text: string, data?: Record<string, unknown>) => void
  registerAnalyticsService?: (handler: (event: CognigyAnalyticsEvent) => void) => void
}

declare global {
  interface Window {
    initWebchat?: (
      endpointUrl: string,
      config?: Record<string, unknown>,
    ) => Promise<CognigyWebchatInstance> | CognigyWebchatInstance | void
  }
}

export {}

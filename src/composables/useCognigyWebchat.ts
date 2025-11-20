import { ref } from 'vue'
import router from '@/router'
import { useExternalScript } from './useExternalScript'
import { useTableData } from './useTableData'

const WEBCHAT_SCRIPT =
  'https://github.com/Cognigy/Webchat/releases/latest/download/webchat.js'
const WEBCHAT_PLUGIN =
  'https://PetrSvarc.github.io/cognigy-plugin/plugin.js'
const WEBCHAT_ENDPOINT =
  'https://cognigy-endpoint-na1.nicecxone.com/ac0b6002f0960b5dffcb867a93477f5271be0e57f2abb55bb1e4e5676473a30e'

type LoaderStatus = 'idle' | 'loading' | 'ready' | 'error'

type WebchatAnalyticsEvent = {
  type: string
  payload?: {
    text?: string
    data?: Record<string, unknown>
  }
}

type WebchatInstance = {
  open?: () => void
  close?: () => void
  sendMessage?: (text: string, data?: Record<string, unknown>) => void
  registerAnalyticsService?: (handler: (event: WebchatAnalyticsEvent) => void) => void
}

const { load } = useExternalScript(WEBCHAT_SCRIPT)
const { load: loadPlugin } = useExternalScript(WEBCHAT_PLUGIN)
const status = ref<LoaderStatus>('idle')
const errorMessage = ref<string | null>(null)
const webchatInstance = ref<WebchatInstance | null>(null)
let analyticsAttached = false
const { setTableData, markChartReady } = useTableData()

const attachAnalyticsLogger = (instance: WebchatInstance | null) => {
  if (analyticsAttached || !instance?.registerAnalyticsService) return

  instance.registerAnalyticsService((event) => {
    console.log('[Cognigy Webchat] analytics event', event)

    if (event.type !== 'webchat/incoming-message') {
      return
    }

    console.log('[Cognigy Webchat] incoming message event', event)

    const payloadData = event.payload?.data
    console.log('[Cognigy Webchat] payload data', payloadData)

    const hasTablePayload =
      typeof payloadData === 'object' &&
      payloadData !== null &&
      (payloadData as Record<string, unknown>).hasTableData === true

    if (hasTablePayload) {
      const pluginData =
        typeof payloadData === 'object' &&
        payloadData !== null &&
        (payloadData as Record<string, unknown>)._plugin &&
        typeof (payloadData as Record<string, unknown>)._plugin === 'object'
          ? ((payloadData as Record<string, unknown>)._plugin as Record<string, unknown>).data
          : undefined

      console.log('[Cognigy Webchat] storing table data from payload data property', pluginData)
      setTableData(pluginData ?? null)
    }

    const shouldCreateChart =
      typeof payloadData === 'object' &&
      payloadData !== null &&
      (payloadData as Record<string, unknown>).createChart === true

    if (shouldCreateChart) {
      console.log('[Cognigy Webchat] received createChart flag')
      markChartReady()
      if (router.currentRoute.value.path !== '/insights') {
        console.log('[Cognigy Webchat] redirecting to /insights')
        router.push('/insights')
      }
    }

    const hasRetrieveRouteFlag =
      typeof payloadData === 'object' &&
      payloadData !== null &&
      ((payloadData as Record<string, unknown>).retrieveRoute === true ||
        (payloadData as Record<string, unknown>).retreiveRoute === true)

    const shouldReturnRoute = Boolean(hasRetrieveRouteFlag)

    console.log('[Cognigy Webchat] shouldReturnRoute', shouldReturnRoute)

    if (!shouldReturnRoute) {
      console.debug('[Cognigy Webchat] no retrieveRoute flag present, skipping reply')
      return
    }

    if (typeof instance.sendMessage !== 'function') {
      console.warn('[Cognigy Webchat] sendMessage is not available on the webchat instance')
      return
    }

    const currentRoute = router.currentRoute.value
    const routeDescriptor =
      currentRoute?.fullPath ??
      currentRoute?.path ??
      (typeof currentRoute?.name === 'string' ? currentRoute.name : null) ??
      '/'

    console.log('[Cognigy Webchat] sending currentRoute payload', routeDescriptor)

    instance.sendMessage('', {
      currentRoute: routeDescriptor,
    })

    console.log('[Cognigy Webchat] sent currentRoute payload', routeDescriptor)
  })

  analyticsAttached = true
}

const init = async () => {
  if (status.value === 'loading' || status.value === 'ready') return

  status.value = 'loading'
  errorMessage.value = null

  try {
    await load()
    await loadPlugin()

    if (typeof window === 'undefined' || typeof window.initWebchat !== 'function') {
      throw new Error('initWebchat is not available in this environment.')
    }

    const instance = await window.initWebchat(WEBCHAT_ENDPOINT)

    webchatInstance.value = (instance ?? null) as WebchatInstance | null
    attachAnalyticsLogger(webchatInstance.value)
    status.value = 'ready'
  } catch (error) {
    status.value = 'error'
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to connect to Cognigy webchat.'
  }
}

const open = () => {
  webchatInstance.value?.open?.()
}

const close = () => {
  webchatInstance.value?.close?.()
}

export function useCognigyWebchat() {
  return {
    status,
    errorMessage,
    init,
    open,
    close,
  }
}

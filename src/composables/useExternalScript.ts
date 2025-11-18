import { ref } from 'vue'

type ScriptStatus = 'idle' | 'loading' | 'ready' | 'error'

const DATA_ATTR = 'data-external-script'

export function useExternalScript(src: string) {
  const status = ref<ScriptStatus>('idle')
  const error = ref<Error | null>(null)

  const load = () =>
    new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        status.value = 'ready'
        resolve()
        return
      }

      const selector = `script[${DATA_ATTR}="${src}"]`
      const existing = document.querySelector<HTMLScriptElement>(selector)

      if (existing) {
        const isLoaded = existing.dataset.loaded === 'true'

        if (isLoaded) {
          status.value = 'ready'
          resolve()
          return
        }

        status.value = 'loading'

        existing.addEventListener(
          'load',
          () => {
            status.value = 'ready'
            resolve()
          },
          { once: true },
        )

        existing.addEventListener(
          'error',
          () => {
            const scriptError = new Error(`Could not load script: ${src}`)
            error.value = scriptError
            status.value = 'error'
            reject(scriptError)
          },
          { once: true },
        )

        return
      }

      status.value = 'loading'

      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.setAttribute(DATA_ATTR, src)
      script.dataset.loaded = 'false'

      script.onload = () => {
        status.value = 'ready'
        script.dataset.loaded = 'true'
        resolve()
      }

      script.onerror = () => {
        const scriptError = new Error(`Could not load script: ${src}`)
        error.value = scriptError
        status.value = 'error'
        script.remove()
        reject(scriptError)
      }

      document.head.append(script)
    })

  return {
    load,
    status,
    error,
  }
}

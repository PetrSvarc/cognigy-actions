/**
 * Vue Adapter for TanStack Mutations
 *
 * This composable provides a Vue 3 reactive wrapper around TanStack Query Core's
 * MutationObserver. It enables performing mutations with reactive state tracking
 * in Vue applications, ideal for form submissions and data modifications.
 */

import { ref, readonly, shallowRef, type Ref } from 'vue'
import { MutationObserver, type MutationObserverOptions, type MutationObserverResult } from '@tanstack/query-core'
import { getQueryClient } from '../sdk-core/queryClient.ts'

/**
 * Result interface for useCoreMutation composable
 * Provides reactive refs for mutation states and control functions
 */
export interface UseCoreMutationResult<TData, TError, TVariables> {
  /** The data returned from the last successful mutation */
  data: Readonly<Ref<TData | undefined>>
  /** The error object if the mutation encountered an error */
  error: Readonly<Ref<TError | null>>
  /** True when the mutation is currently executing (legacy naming for compatibility) */
  isLoading: Readonly<Ref<boolean>>
  /** True when the mutation is in a "pending" state (currently executing) */
  isPending: Readonly<Ref<boolean>>
  /** True when the mutation encountered an error */
  isError: Readonly<Ref<boolean>>
  /** True when the mutation completed successfully */
  isSuccess: Readonly<Ref<boolean>>
  /** True when the mutation is idle (not executing) */
  isIdle: Readonly<Ref<boolean>>
  /** The current status of the mutation */
  status: Readonly<Ref<'idle' | 'pending' | 'error' | 'success'>>
  /** The variables passed to the last mutation call */
  variables: Readonly<Ref<TVariables | undefined>>
  /** Trigger the mutation (fire-and-forget style) */
  mutate: (variables: TVariables) => void
  /** Trigger the mutation and return a promise */
  mutateAsync: (variables: TVariables) => Promise<TData>
  /** Reset the mutation to its initial state */
  reset: () => void
}

/**
 * Vue composable for TanStack Mutations
 *
 * Creates a MutationObserver and syncs its state to Vue reactive refs.
 * Provides both synchronous (mutate) and async (mutateAsync) mutation triggers.
 *
 * @example
 * ```typescript
 * const { mutate, mutateAsync, isLoading, error } = useCoreMutation({
 *   mutationFn: (data) => api.createUser(data),
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ['users'] })
 *   },
 * })
 *
 * // Fire-and-forget
 * mutate({ name: 'John' })
 *
 * // With promise handling
 * await mutateAsync({ name: 'John' })
 * ```
 *
 * @param options - MutationObserver options from TanStack Query Core
 * @returns Reactive refs for mutation state and control functions
 */
export function useCoreMutation<TData = unknown, TError = Error, TVariables = void>(
  options: MutationObserverOptions<TData, TError, TVariables>
): UseCoreMutationResult<TData, TError, TVariables> {
  const queryClient = getQueryClient()

  // Create reactive refs for all mutation states
  // Using shallowRef for data to avoid deep reactivity on potentially large objects
  const data = shallowRef<TData | undefined>(undefined)
  const error = ref<TError | null>(null) as Ref<TError | null>
  const isLoading = ref(false)
  const isPending = ref(false)
  const isError = ref(false)
  const isSuccess = ref(false)
  const isIdle = ref(true)
  const status = ref<'idle' | 'pending' | 'error' | 'success'>('idle')
  const variables = shallowRef<TVariables | undefined>(undefined)

  // Create the MutationObserver with the provided options
  const observer = new MutationObserver<TData, TError, TVariables>(queryClient, options)

  /**
   * Updates all reactive refs from the observer result
   */
  function updateState(result: MutationObserverResult<TData, TError, TVariables>): void {
    data.value = result.data
    error.value = result.error
    isPending.value = result.isPending
    isLoading.value = result.isPending // Legacy compatibility
    isError.value = result.isError
    isSuccess.value = result.isSuccess
    isIdle.value = result.isIdle
    status.value = result.status
    variables.value = result.variables
  }

  // Subscribe to observer updates
  observer.subscribe((result) => {
    updateState(result)
  })

  /**
   * Trigger the mutation (fire-and-forget style)
   * Errors are handled through the error ref, not thrown
   */
  function mutate(vars: TVariables): void {
    observer.mutate(vars)
  }

  /**
   * Trigger the mutation and return a promise
   * Errors will be thrown and should be caught by the caller
   */
  async function mutateAsync(vars: TVariables): Promise<TData> {
    return observer.mutate(vars)
  }

  /**
   * Reset the mutation to its initial idle state
   * Clears data, error, and resets all status flags
   */
  function reset(): void {
    observer.reset()
  }

  // Return readonly refs to prevent external mutation
  return {
    data: readonly(data) as Readonly<Ref<TData | undefined>>,
    error: readonly(error) as Readonly<Ref<TError | null>>,
    isLoading: readonly(isLoading),
    isPending: readonly(isPending),
    isError: readonly(isError),
    isSuccess: readonly(isSuccess),
    isIdle: readonly(isIdle),
    status: readonly(status) as Readonly<Ref<'idle' | 'pending' | 'error' | 'success'>>,
    variables: readonly(variables) as Readonly<Ref<TVariables | undefined>>,
    mutate,
    mutateAsync,
    reset,
  }
}

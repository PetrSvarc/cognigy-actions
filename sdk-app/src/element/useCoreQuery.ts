/**
 * Vue Adapter for TanStack Query Core
 *
 * This composable provides a Vue 3 reactive wrapper around TanStack Query Core's
 * QueryObserver. It enables using TanStack Query in Vue applications without
 * the full @tanstack/vue-query package, which is useful for Shadow DOM widgets
 * where we need minimal dependencies and full control over the integration.
 */

import { ref, onUnmounted, readonly, shallowRef, type Ref } from 'vue'
import { QueryObserver, type QueryObserverOptions, type QueryObserverResult } from '@tanstack/query-core'
import { getQueryClient } from '../sdk-core/queryClient.ts'

/**
 * Result interface for useCoreQuery composable
 * Provides reactive refs for all query states and a refetch function
 */
export interface UseCoreQueryResult<TData, TError> {
  /** The latest successfully resolved data for the query */
  data: Readonly<Ref<TData | undefined>>
  /** The error object if the query encountered an error */
  error: Readonly<Ref<TError | null>>
  /** True when the query is in a "loading" state (no data, currently fetching) */
  isLoading: Readonly<Ref<boolean>>
  /** True when the query is currently fetching (including background refetches) */
  isFetching: Readonly<Ref<boolean>>
  /** True when the query encountered an error */
  isError: Readonly<Ref<boolean>>
  /** True when the query has successfully resolved data */
  isSuccess: Readonly<Ref<boolean>>
  /** True when the query is in a "pending" state (no cached data) */
  isPending: Readonly<Ref<boolean>>
  /** True when the query is in a "stale" state */
  isStale: Readonly<Ref<boolean>>
  /** The current status of the query */
  status: Readonly<Ref<'pending' | 'error' | 'success'>>
  /** The current fetch status of the query */
  fetchStatus: Readonly<Ref<'fetching' | 'paused' | 'idle'>>
  /** Function to manually refetch the query */
  refetch: () => Promise<QueryObserverResult<TData, TError>>
}

/**
 * Vue composable for TanStack Query Core
 *
 * Creates a QueryObserver and syncs its state to Vue reactive refs.
 * Automatically subscribes on mount and unsubscribes on unmount.
 *
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useCoreQuery({
 *   queryKey: ['user', userId],
 *   queryFn: () => fetchUser(userId),
 *   staleTime: 5 * 60 * 1000,
 * })
 * ```
 *
 * @param options - QueryObserver options from TanStack Query Core
 * @returns Reactive refs for query state and control functions
 */
export function useCoreQuery<TData = unknown, TError = Error>(
  options: QueryObserverOptions<TData, TError>
): UseCoreQueryResult<TData, TError> {
  const queryClient = getQueryClient()

  // Create reactive refs for all query states
  // Using shallowRef for data to avoid deep reactivity on potentially large objects
  const data = shallowRef<TData | undefined>(undefined)
  const error = ref<TError | null>(null) as Ref<TError | null>
  const isLoading = ref(true)
  const isFetching = ref(true)
  const isError = ref(false)
  const isSuccess = ref(false)
  const isPending = ref(true)
  const isStale = ref(false)
  const status = ref<'pending' | 'error' | 'success'>('pending')
  const fetchStatus = ref<'fetching' | 'paused' | 'idle'>('fetching')

  // Create the QueryObserver with the provided options
  const observer = new QueryObserver<TData, TError>(queryClient, options)

  /**
   * Updates all reactive refs from the observer result
   */
  function updateState(result: QueryObserverResult<TData, TError>): void {
    data.value = result.data
    error.value = result.error
    isLoading.value = result.isLoading
    isFetching.value = result.isFetching
    isError.value = result.isError
    isSuccess.value = result.isSuccess
    isPending.value = result.isPending
    isStale.value = result.isStale
    status.value = result.status
    fetchStatus.value = result.fetchStatus
  }

  // Get the current result and initialize state
  // Use getCurrentResult() which returns the cached result without requiring defaulted options
  const initialResult = observer.getCurrentResult()
  updateState(initialResult)

  // Subscribe to observer updates
  const unsubscribe = observer.subscribe((result) => {
    updateState(result)
  })

  // Cleanup subscription on component unmount
  onUnmounted(() => {
    unsubscribe()
    observer.destroy()
  })

  /**
   * Manually refetch the query
   */
  async function refetch(): Promise<QueryObserverResult<TData, TError>> {
    return observer.refetch()
  }

  // Return readonly refs to prevent external mutation
  return {
    data: readonly(data) as Readonly<Ref<TData | undefined>>,
    error: readonly(error) as Readonly<Ref<TError | null>>,
    isLoading: readonly(isLoading),
    isFetching: readonly(isFetching),
    isError: readonly(isError),
    isSuccess: readonly(isSuccess),
    isPending: readonly(isPending),
    isStale: readonly(isStale),
    status: readonly(status) as Readonly<Ref<'pending' | 'error' | 'success'>>,
    fetchStatus: readonly(fetchStatus) as Readonly<Ref<'fetching' | 'paused' | 'idle'>>,
    refetch,
  }
}

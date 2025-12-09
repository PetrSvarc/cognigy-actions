/**
 * API Client Configuration
 *
 * Creates an Axios instance with interceptors for authentication
 * and error handling in the chat widget SDK.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * API configuration interface
 */
export interface ApiConfig {
  /** Authentication token */
  token: string
  /** Base URL for API requests */
  baseURL: string
}

/**
 * Module-level storage for API configuration
 */
let apiConfig: ApiConfig = {
  token: '',
  baseURL: '/api',
}

/**
 * Singleton axios instance
 */
let apiClientInstance: AxiosInstance | null = null

/**
 * Sets the API configuration
 * Called by SDK.create() to configure the API client
 */
export function setApiConfig(config: Partial<ApiConfig>): void {
  apiConfig = {
    ...apiConfig,
    ...config,
  }

  // If axios instance exists, update its baseURL
  if (apiClientInstance && config.baseURL) {
    apiClientInstance.defaults.baseURL = config.baseURL
  }
}

/**
 * Gets the current API configuration
 */
export function getApiConfig(): ApiConfig {
  return { ...apiConfig }
}

/**
 * Request interceptor to add Authorization header
 */
function requestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const currentConfig = getApiConfig()

  if (currentConfig.token) {
    config.headers.Authorization = `Bearer ${currentConfig.token}`
  }

  return config
}

/**
 * Request error interceptor
 */
function requestErrorInterceptor(error: AxiosError): Promise<never> {
  return Promise.reject(error)
}

/**
 * Response interceptor for successful responses
 */
function responseInterceptor(response: AxiosResponse): AxiosResponse {
  return response
}

/**
 * Response error interceptor for handling API errors
 */
function responseErrorInterceptor(error: AxiosError): Promise<never> {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status

    switch (status) {
      case 401:
        // Unauthorized - token may be expired or invalid
        console.error('[API Client] Unauthorized: Token may be expired or invalid')
        break
      case 403:
        // Forbidden - insufficient permissions
        console.error('[API Client] Forbidden: Insufficient permissions')
        break
      case 404:
        // Not found
        console.error('[API Client] Resource not found')
        break
      case 429:
        // Rate limited
        console.error('[API Client] Rate limited: Too many requests')
        break
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        console.error('[API Client] Server error:', status)
        break
      default:
        console.error('[API Client] Request failed with status:', status)
    }
  } else if (error.request) {
    // Request was made but no response received
    console.error('[API Client] Network error: No response received')
  } else {
    // Error in setting up the request
    console.error('[API Client] Request setup error:', error.message)
  }

  return Promise.reject(error)
}

/**
 * Creates an Axios instance with configured interceptors
 */
export function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add request interceptor for auth token
  instance.interceptors.request.use(requestInterceptor, requestErrorInterceptor)

  // Add response interceptor for error handling
  instance.interceptors.response.use(responseInterceptor, responseErrorInterceptor)

  return instance
}

/**
 * Gets the singleton API client instance
 * Creates a new instance if one doesn't exist
 */
export function getApiClient(): AxiosInstance {
  if (!apiClientInstance) {
    apiClientInstance = createApiClient()
  }
  return apiClientInstance
}

/**
 * Resets the API client instance
 * Useful for testing or when reinitializing the SDK
 */
export function resetApiClient(): void {
  apiClientInstance = null
  apiConfig = {
    token: '',
    baseURL: '/api',
  }
}

/**
 * The singleton axios instance
 * Use getApiClient() for lazy initialization
 */
export const apiClient = getApiClient()

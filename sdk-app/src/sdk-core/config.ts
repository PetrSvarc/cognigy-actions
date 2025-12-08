/**
 * Configuration Utilities
 *
 * Functions for parsing and validating SDK configuration.
 */

import type { SDKConfig } from './types.ts'

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<SDKConfig> = {
  // Add default values here as needed
}

/**
 * Parses and normalizes configuration from various input formats
 */
export function parseConfig(config: Partial<SDKConfig>): SDKConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
  } as SDKConfig
}

/**
 * Validates that the configuration has all required fields
 */
export function validateConfig(config: SDKConfig): boolean {
  // Token is required
  if (!config.token || typeof config.token !== 'string') {
    console.error('[MyChatSDK] Configuration error: "token" is required and must be a string')
    return false
  }

  // Element, if provided, must be a string or HTMLElement
  if (config.element !== undefined) {
    if (typeof config.element !== 'string' && !(config.element instanceof HTMLElement)) {
      console.error('[MyChatSDK] Configuration error: "element" must be a CSS selector string or HTMLElement')
      return false
    }
  }

  return true
}

/**
 * Parses configuration from script tag data attributes
 */
export function parseConfigFromScript(script: HTMLScriptElement): Partial<SDKConfig> {
  const config: Partial<SDKConfig> = {}

  // Parse token
  const token = script.getAttribute('data-token')
  if (token) {
    config.token = token
  }

  // Parse element selector
  const element = script.getAttribute('data-element')
  if (element) {
    config.element = element
  }

  return config
}

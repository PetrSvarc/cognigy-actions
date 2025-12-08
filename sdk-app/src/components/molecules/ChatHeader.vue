<script setup lang="ts">
/**
 * ChatHeader Component
 *
 * A flexible chat header component with configurable layout.
 * Supports back navigation, logo/title display, menu, and close actions.
 */

export interface ChatHeaderProps {
  /** The title text to display */
  title?: string
  /** Whether to show the logo/avatar */
  showLogo?: boolean
  /** Optional logo image URL */
  logoSrc?: string
  /** Whether to show the back button */
  showBackButton?: boolean
  /** Whether to show the menu button (three dots) */
  showMenuButton?: boolean
  /** Whether to show the close button */
  showCloseButton?: boolean
}

withDefaults(defineProps<ChatHeaderProps>(), {
  title: '',
  showLogo: true,
  logoSrc: '',
  showBackButton: false,
  showMenuButton: true,
  showCloseButton: true
})

const emit = defineEmits<{
  /** Emitted when the back button is clicked */
  back: []
  /** Emitted when the menu button is clicked */
  menu: []
  /** Emitted when the close button is clicked */
  close: []
}>()

const handleBack = (): void => {
  emit('back')
}

const handleMenu = (): void => {
  emit('menu')
}

const handleClose = (): void => {
  emit('close')
}
</script>

<template>
  <header class="chat-header">
    <!-- Left Section: Back Button -->
    <div class="chat-header__left">
      <button
        v-if="showBackButton"
        type="button"
        class="chat-header__button chat-header__button--back"
        aria-label="Go back"
        @click="handleBack"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </div>

    <!-- Center Section: Logo + Title -->
    <div class="chat-header__center">
      <div v-if="showLogo || title" class="chat-header__brand">
        <!-- Logo/Avatar -->
        <div v-if="showLogo" class="chat-header__logo">
          <img
            v-if="logoSrc"
            :src="logoSrc"
            :alt="title ? `${title} logo` : 'Chat logo'"
            class="chat-header__logo-image"
          />
          <!-- Default logo placeholder when no logoSrc provided -->
          <div v-else class="chat-header__logo-placeholder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
        </div>
        <!-- Title -->
        <span v-if="title" class="chat-header__title">{{ title }}</span>
      </div>
    </div>

    <!-- Right Section: Menu + Close Buttons -->
    <div class="chat-header__right">
      <button
        v-if="showMenuButton"
        type="button"
        class="chat-header__button chat-header__button--menu"
        aria-label="Open menu"
        @click="handleMenu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      <button
        v-if="showCloseButton"
        type="button"
        class="chat-header__button chat-header__button--close"
        aria-label="Close chat"
        @click="handleClose"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
// Design tokens
$header-height: 64px;
$header-padding-x: 12px;
$header-background: #ffffff;
$header-border-color: #e5e5e5;

$button-size: 40px;
$button-icon-color: #333333;
$button-hover-bg: rgba(0, 0, 0, 0.05);
$button-active-bg: rgba(0, 0, 0, 0.1);
$button-focus-ring: rgba(0, 102, 204, 0.4);

$logo-size: 40px;
$logo-bg: #3b82f6;
$logo-color: #ffffff;

$title-color: #1a1a1a;
$title-font-size: 16px;
$title-font-weight: 600;

$transition-speed: 0.15s;

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $header-height;
  padding: 0 $header-padding-x;
  background-color: $header-background;
  border-bottom: 1px solid $header-border-color;
  box-sizing: border-box;
  flex-shrink: 0;

  // Ensure the header is above other content for shadow effects
  position: relative;
  z-index: 10;
}

// Layout sections
.chat-header__left,
.chat-header__right {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: $button-size;
}

.chat-header__left {
  justify-content: flex-start;
}

.chat-header__right {
  justify-content: flex-end;
}

.chat-header__center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0; // Allow text truncation
  padding: 0 8px;
}

// Brand container (logo + title)
.chat-header__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

// Logo/Avatar
.chat-header__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: $logo-size;
  height: $logo-size;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.chat-header__logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-header__logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: $logo-bg;
  color: $logo-color;

  svg {
    width: 24px;
    height: 24px;
  }
}

// Title
.chat-header__title {
  font-size: $title-font-size;
  font-weight: $title-font-weight;
  color: $title-color;
  line-height: 1.25;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

// Buttons
.chat-header__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: $button-size;
  height: $button-size;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: $button-icon-color;
  cursor: pointer;
  transition: background-color $transition-speed ease, transform $transition-speed ease;
  flex-shrink: 0;

  &:hover {
    background-color: $button-hover-bg;
  }

  &:active {
    background-color: $button-active-bg;
    transform: scale(0.95);
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid $button-focus-ring;
    outline-offset: 2px;
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
}

// Button variants (for potential future styling differences)
.chat-header__button--back {
  // Back button specific styles if needed
}

.chat-header__button--menu {
  // Menu button specific styles if needed
}

.chat-header__button--close {
  // Close button specific styles if needed
}
</style>

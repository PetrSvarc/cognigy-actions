<script setup lang="ts">
/**
 * Avatar Component
 *
 * Displays user or AI avatars with optional status indicators.
 * AI type shows a branded AI icon, user type shows a circular photo.
 */

export type AvatarType = 'ai' | 'user'
export type AvatarSize = 'sm' | 'md' | 'lg'
export type AvatarStatus = 'online' | 'offline' | null

interface Props {
  /** Type of avatar - 'ai' for AI bot, 'user' for human user */
  type: AvatarType
  /** Image source URL for user avatars */
  src?: string
  /** Size variant */
  size?: AvatarSize
  /** Online status indicator */
  status?: AvatarStatus
  /** Alt text for the avatar image */
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  status: null,
  alt: 'Avatar'
})

// Size mappings in pixels
const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48
}

const avatarSize = sizeMap[props.size]
</script>

<template>
  <div
    class="avatar"
    :class="[`avatar--${size}`, `avatar--${type}`]"
    :style="{ width: `${avatarSize}px`, height: `${avatarSize}px` }"
  >
    <!-- AI Avatar -->
    <div v-if="type === 'ai'" class="avatar__ai-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="avatar__ai-svg"
      >
        <!-- AI Icon - stylized "AI" letters -->
        <path
          d="M7.5 17L4.5 7H6.5L8.5 13.5L10.5 7H12.5L9.5 17H7.5Z"
          fill="currentColor"
        />
        <path
          d="M14 7H16V17H14V7Z"
          fill="currentColor"
        />
        <circle
          cx="15"
          cy="5"
          r="1.25"
          fill="currentColor"
        />
      </svg>
    </div>

    <!-- User Avatar -->
    <template v-else>
      <img
        v-if="src"
        :src="src"
        :alt="alt"
        class="avatar__image"
      />
      <div v-else class="avatar__placeholder">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="avatar__placeholder-icon"
        >
          <path
            d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <!-- Status Indicator -->
      <span
        v-if="status"
        class="avatar__status"
        :class="`avatar__status--${status}`"
        :aria-label="status === 'online' ? 'Online' : 'Offline'"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
$primary-blue: #3B5EFF;
$status-online: #22C55E;
$status-offline: #EF4444;

.avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: visible;

  // Size variants
  &--sm {
    .avatar__status {
      width: 8px;
      height: 8px;
      border-width: 1.5px;
    }
  }

  &--md {
    .avatar__status {
      width: 10px;
      height: 10px;
      border-width: 2px;
    }
  }

  &--lg {
    .avatar__status {
      width: 12px;
      height: 12px;
      border-width: 2px;
    }
  }
}

// AI Avatar styles
.avatar__ai-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $primary-blue;
  border-radius: 50%;
  color: #FFFFFF;
}

.avatar__ai-svg {
  width: 60%;
  height: 60%;
}

// User Avatar styles
.avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E5E7EB;
  border-radius: 50%;
  color: #9CA3AF;
}

.avatar__placeholder-icon {
  width: 60%;
  height: 60%;
}

// Status indicator
.avatar__status {
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: 50%;
  border-style: solid;
  border-color: #FFFFFF;
  box-sizing: border-box;

  &--online {
    background: $status-online;
  }

  &--offline {
    background: $status-offline;
  }
}
</style>

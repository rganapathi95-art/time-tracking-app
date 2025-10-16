<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
    >
      <Bell class="h-6 w-6" />
      <span
        v-if="unreadCount > 0"
        class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50 border border-gray-200"
    >
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
        <button
          v-if="notifications.length > 0"
          @click="markAllAsRead"
          class="text-sm text-primary-600 hover:text-primary-800"
        >
          Mark all read
        </button>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <div v-if="loading" class="flex justify-center items-center py-8">
          <Loader2 class="animate-spin h-6 w-6 text-primary-600" />
        </div>

        <div v-else-if="notifications.length === 0" class="text-center py-8">
          <BellOff class="mx-auto h-12 w-12 text-gray-400" />
          <p class="mt-2 text-sm text-gray-500">No notifications</p>
        </div>

        <div v-else>
          <div
            v-for="notification in notifications"
            :key="notification._id"
            @click="handleNotificationClick(notification)"
            :class="[
              'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
              !notification.isRead ? 'bg-blue-50' : ''
            ]"
          >
            <div class="flex items-start space-x-3">
              <div :class="getPriorityColor(notification.priority)" class="flex-shrink-0 mt-1">
                <component :is="getNotificationIcon(notification.type)" class="h-5 w-5" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatTime(notification.createdAt) }}</p>
              </div>
              <button
                @click.stop="deleteNotification(notification._id)"
                class="flex-shrink-0 text-gray-400 hover:text-red-600"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="notifications.length > 0" class="p-3 border-t border-gray-200 text-center">
        <button
          @click="clearRead"
          class="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear read notifications
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import notificationService from '../services/notificationService'
import { Bell, BellOff, X, Loader2, CheckCircle, XCircle, Calendar, AlertTriangle, Info } from 'lucide-vue-next'

const router = useRouter()
const isOpen = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
let pollInterval = null

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await fetchNotifications()
  }
}

const fetchNotifications = async () => {
  loading.value = true
  try {
    const response = await notificationService.getNotifications({ limit: 10 })
    notifications.value = response.data
    unreadCount.value = response.unreadCount
  } catch (error) {
    console.error('Error fetching notifications:', error)
  } finally {
    loading.value = false
  }
}

const fetchUnreadCount = async () => {
  try {
    const response = await notificationService.getUnreadCount()
    unreadCount.value = response.data.count
  } catch (error) {
    console.error('Error fetching unread count:', error)
  }
}

const handleNotificationClick = async (notification) => {
  if (!notification.isRead) {
    try {
      await notificationService.markAsRead(notification._id)
      notification.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  if (notification.actionUrl) {
    router.push(notification.actionUrl)
    isOpen.value = false
  }
}

const markAllAsRead = async () => {
  try {
    await notificationService.markAllAsRead()
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
  } catch (error) {
    console.error('Error marking all as read:', error)
  }
}

const deleteNotification = async (id) => {
  try {
    await notificationService.deleteNotification(id)
    notifications.value = notifications.value.filter(n => n._id !== id)
    await fetchUnreadCount()
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

const clearRead = async () => {
  try {
    await notificationService.clearReadNotifications()
    notifications.value = notifications.value.filter(n => !n.isRead)
  } catch (error) {
    console.error('Error clearing read notifications:', error)
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    'timesheet_reminder': Calendar,
    'timesheet_approved': CheckCircle,
    'timesheet_rejected': XCircle,
    'period_opened': Calendar,
    'hour_limit_warning': AlertTriangle,
    'system': Info
  }
  return icons[type] || Info
}

const getPriorityColor = (priority) => {
  const colors = {
    'low': 'text-gray-500',
    'medium': 'text-blue-500',
    'high': 'text-red-500'
  }
  return colors[priority] || 'text-gray-500'
}

const formatTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (isOpen.value && !event.target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  fetchUnreadCount()
  // Poll for new notifications every 30 seconds
  pollInterval = setInterval(fetchUnreadCount, 30000)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

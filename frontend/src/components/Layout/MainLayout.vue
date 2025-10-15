<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar :isSidebarOpen="isSidebarOpen" @closeSidebar="closeSidebar" />
    
    <!-- Main Content Area -->
    <div class="lg:pl-64">
      <!-- Top Bar with Toggle -->
      <div class="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:px-6">
        <button
          @click="toggleSidebar"
          class="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <Menu class="h-6 w-6" />
        </button>
        <div class="flex-1"></div>
        <!-- Optional: Add notifications, search, etc. here -->
      </div>

      <!-- Page Content -->
      <main class="p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import { Menu } from 'lucide-vue-next'

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>

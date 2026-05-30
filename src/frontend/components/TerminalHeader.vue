<template>
  <div class="terminal-header">
    <div class="terminal-dots">
      <span class="terminal-dot red"></span>
      <span class="terminal-dot yellow"></span>
      <span class="terminal-dot green"></span>
    </div>
    <div class="terminal-title">{{ title }}</div>
    <div class="terminal-header-theme">
      <span class="theme-label">Theme:</span>
      <div class="theme-toggle">
        <button 
          class="theme-btn" 
          :class="{ active: currentTheme === 'auto' }"
          @click="setTheme('auto')"
          title="Auto - Follow System"
        >🌙☀</button>
        <button 
          class="theme-btn" 
          :class="{ active: currentTheme === 'dark' }"
          @click="setTheme('dark')"
          title="Dark Mode"
        >🌙</button>
        <button 
          class="theme-btn" 
          :class="{ active: currentTheme === 'light' }"
          @click="setTheme('light')"
          title="Light Mode"
        >☀</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  title: {
    type: String,
    default: 'Server Monitor'
  }
})

const currentTheme = ref('dark')

const getPreferredTheme = () => {
  return localStorage.getItem('theme_preference') || 'dark'
}

const setTheme = (theme) => {
  localStorage.setItem('theme_preference', theme)
  currentTheme.value = theme
  applyTheme(theme)
}

const applyTheme = (theme) => {
  if (theme === 'auto') {
    const hour = new Date().getHours()
    theme = (hour >= 6 && hour < 18) ? 'light' : 'dark'
  }
  document.body.classList.remove('dark', 'light')
  if (theme !== 'dark') {
    document.body.classList.add(theme)
  }
}

onMounted(() => {
  currentTheme.value = getPreferredTheme()
  applyTheme(currentTheme.value)
})
</script>
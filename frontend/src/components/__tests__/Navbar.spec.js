import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Navbar from '../Layout/Navbar.vue'

describe('Navbar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders properly', () => {
    const wrapper = mount(Navbar, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    expect(wrapper.text()).toContain('TimeTrack')
  })

  it('displays user information', () => {
    const wrapper = mount(Navbar, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })
})

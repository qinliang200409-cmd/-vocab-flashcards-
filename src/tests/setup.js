// Vitest setup file
import { vi } from 'vitest'

// Create a functional localStorage mock that actually stores data
class LocalStorageMock {
  constructor() {
    this.store = {}
  }

  getItem(key) {
    return this.store[key] || null
  }

  setItem(key, value) {
    this.store[key] = String(value)
  }

  removeItem(key) {
    delete this.store[key]
  }

  clear() {
    this.store = {}
  }

  get length() {
    return Object.keys(this.store).length
  }

  key(index) {
    const keys = Object.keys(this.store)
    return keys[index] || null
  }
}

// Mock localStorage
global.localStorage = new LocalStorageMock()

// Mock sessionStorage
global.sessionStorage = new LocalStorageMock()

// Mock Web Speech API
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => [])
}

global.SpeechSynthesisUtterance = class {
  constructor(text) {
    this.text = text
    this.lang = 'en-US'
    this.rate = 1
    this.pitch = 1
    this.volume = 1
  }
}

// Note: We don't clear localStorage/sessionStorage automatically
// Tests should manage their own cleanup as needed

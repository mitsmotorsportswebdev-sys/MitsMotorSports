import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

type ScrollPosition = {
  left: number
  top: number
}

type ScrollState = {
  window: ScrollPosition
  containers: Record<string, ScrollPosition>
}

const STORAGE_KEY = 'mits-motorsports-scroll-positions'

function getScrollableContainers() {
  return Array.from(document.querySelectorAll<HTMLElement>('*')).filter((element) => {
    const style = window.getComputedStyle(element)
    const canScroll = style.overflowY === 'auto' || style.overflowY === 'scroll'
    return canScroll && element.scrollHeight > element.clientHeight
  })
}

function getContainerId(element: HTMLElement, index: number) {
  return element.id || element.dataset.scrollContainer || `container-${index}`
}

function readSavedPositions() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) as Record<string, ScrollState> : {}
  } catch {
    return {}
  }
}

function savePosition(key: string) {
  const containers = getScrollableContainers()
  const state: ScrollState = {
    window: { left: window.scrollX, top: window.scrollY },
    containers: Object.fromEntries(containers.map((container, index) => [
      getContainerId(container, index),
      { left: container.scrollLeft, top: container.scrollTop },
    ])),
  }
  const positions = readSavedPositions()
  positions[key] = state
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
}

function resetScroll() {
  window.scrollTo({ left: 0, top: 0, behavior: 'auto' })
  document.documentElement.scrollLeft = 0
  document.documentElement.scrollTop = 0
  document.body.scrollLeft = 0
  document.body.scrollTop = 0
  getScrollableContainers().forEach((container) => {
    container.scrollTo({ left: 0, top: 0, behavior: 'auto' })
  })
}

function restoreScroll(key: string) {
  const saved = readSavedPositions()[key]
  if (!saved) {
    resetScroll()
    return
  }

  window.scrollTo({ ...saved.window, behavior: 'auto' })
  getScrollableContainers().forEach((container, index) => {
    const position = saved.containers[getContainerId(container, index)]
    if (position) container.scrollTo({ ...position, behavior: 'auto' })
  })
}

function scrollToHash(hash: string) {
  const element = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (element) {
    element.scrollIntoView({ behavior: 'auto', block: 'start' })
  } else {
    resetScroll()
  }
}

export default function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const previousKey = useRef(location.key)

  useLayoutEffect(() => {
    if (window.history.scrollRestoration !== undefined) {
      window.history.scrollRestoration = 'manual'
    }

    savePosition(previousKey.current)
    if (location.hash) {
      scrollToHash(location.hash)
    } else if (navigationType === 'POP') {
      restoreScroll(location.key)
    } else {
      resetScroll()
    }
    previousKey.current = location.key
  }, [location.key, location.hash, navigationType])

  useLayoutEffect(() => {
    let frame = 0
    const save = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => savePosition(location.key))
    }
    window.addEventListener('scroll', save, { passive: true, capture: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', save, true)
    }
  }, [location.key])

  return null
}

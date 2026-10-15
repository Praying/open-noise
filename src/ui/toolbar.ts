/** 紫色工具栏:交通灯 · 传输控制 · 正在播放 · 音量 · 定时器 */

import type { CatalogEntry } from '../catalog/default-noises'
import {
  iconGlobe,
  iconNext,
  iconPause,
  iconPlay,
  iconPrev,
  iconTimer,
  iconVolumeHigh,
  iconVolumeLow,
} from './icons'
import type { Messages } from '../i18n'

export interface ToolbarState {
  nowPlaying: CatalogEntry | null
  isPlaying: boolean
  volume: number
  messages: Messages
  /** 音频引擎/资源错误文案;非空时在胶囊位显示(代替曲目名),保证失败可见 */
  errorText?: string | null
}

export interface ToolbarHandlers {
  onPrev(): void
  onTogglePlay(): void
  onNext(): void
  onVolumeChange(volume: number): void
  onTimerClick(anchor: HTMLElement): void
  onLanguageClick(anchor: HTMLElement): void
}

export function renderToolbar(state: ToolbarState, handlers: ToolbarHandlers): HTMLElement {
  const bar = document.createElement('div')
  bar.className = 'toolbar'

  const m = state.messages
  bar.setAttribute('data-tauri-drag-region', '') // 工具栏背景可拖拽窗口(原生 macOS 行为)
  bar.innerHTML = `
    <div class="traffic-light-space" aria-hidden="true"></div>
    <div class="transport">
      <button class="prev-btn" title="${m.prevTooltip}" aria-label="${m.prevTooltip}">${iconPrev()}</button>
      <button class="play-btn" title="${m.playTooltip}" aria-label="${m.playTooltip}">${
        state.isPlaying ? iconPause() : iconPlay()
      }</button>
      <button class="next-btn" title="${m.nextTooltip}" aria-label="${m.nextTooltip}">${iconNext()}</button>
    </div>
    <div class="now-playing">
      <div class="tile">${state.nowPlaying ? `<img src="${state.nowPlaying.icon}" alt="">` : ''}</div>
      <div class="pill${state.errorText ? ' error' : ''}"><span>${
        state.errorText ?? state.nowPlaying?.name ?? '—'
      }</span></div>
    </div>
    <div class="volume">
      <span class="vol-low">${iconVolumeLow()}</span>
      <input type="range" min="0" max="100" value="${state.volume}" aria-label="${m.volumeLabel}" title="${m.volumeLabel}" />
      <span class="vol-high">${iconVolumeHigh()}</span>
    </div>
    <button class="lang-btn" title="${m.languageTooltip}" aria-label="${m.languageTooltip}">${iconGlobe()}</button>
    <button class="timer-btn" title="${m.timerTooltip}" aria-label="${m.timerTooltip}">${iconTimer()}</button>
  `

  const volumeInput = bar.querySelector<HTMLInputElement>('.volume input')!
  volumeInput.addEventListener('input', () => {
    handlers.onVolumeChange(Number(volumeInput.value))
  })

  bar.querySelector('.prev-btn')!.addEventListener('click', handlers.onPrev)
  bar.querySelector('.next-btn')!.addEventListener('click', handlers.onNext)
  const playBtn = bar.querySelector<HTMLButtonElement>('.play-btn')!
  playBtn.addEventListener('click', handlers.onTogglePlay)
  bar.querySelector('.lang-btn')!.addEventListener('click', (event) => {
    handlers.onLanguageClick(event.currentTarget as HTMLElement)
  })
  bar.querySelector('.timer-btn')!.addEventListener('click', (event) => {
    handlers.onTimerClick(event.currentTarget as HTMLElement)
  })

  return bar
}

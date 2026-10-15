/**
 * 应用装配:UI 状态 + 音频引擎接线。
 * 引擎逻辑全部在 audio/domain 纯函数层;此处只做 DOM 与事件编排。
 */

import './ui/styles.css'
import { SoundCatalog } from './domain/catalog'
import { audioUrl, type NoiseModel } from './domain/noise'
import { DEFAULT_NOISES, type CatalogEntry } from './catalog/default-noises'
import { segmentForCrossfade } from './audio/crossfade-loop'
import { buildLoopBuffer, LoopPlayer, type AudioContextLike } from './audio/loop-player'
import { evaluateTimer, type TimerConfig } from './audio/sleep-timer'
import {
  loadFavorites,
  loadLanguage,
  loadVolume,
  saveFavorites,
  saveLanguage,
  saveVolume,
  toggleFavorite,
} from './persist'
import {
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  getMessages,
  noiseName,
  type Locale,
} from './i18n'
import { renderToolbar } from './ui/toolbar'
import { renderNoiseList } from './ui/noise-list'

const toolbarSlot = document.getElementById('toolbar-slot')
const listSlot = document.getElementById('list-slot')
if (!toolbarSlot || !listSlot) throw new Error('missing app slots')

const catalog = new SoundCatalog(DEFAULT_NOISES)
const storage = window.localStorage

interface AppState {
  selectedId: string
  isPlaying: boolean
  favorites: Set<string>
  volume: number
  timerConfig: TimerConfig
  locale: Locale
  /** 播放失败文案;非空时显示在工具栏胶囊位 */
  errorText: string | null
}

const state: AppState = {
  selectedId: 'lullaby',
  isPlaying: false,
  favorites: loadFavorites(storage),
  volume: loadVolume(storage),
  timerConfig: { kind: 'off' },
  locale: (loadLanguage(storage) as Locale | null) ?? DEFAULT_LOCALE,
  errorText: null,
}

interface Engine {
  context: AudioContext
  masterGain: GainNode
  player: LoopPlayer
}

let engine: Engine | null = null
let timerHandle: number | null = null
let timerStartedAt = 0

function ensureEngine(): Engine {
  if (engine) return engine
  const context = new AudioContext()
  const masterGain = context.createGain()
  masterGain.connect(context.destination)
  masterGain.gain.value = state.volume / 100
  engine = { context, masterGain, player: new LoopPlayer(context as unknown as AudioContextLike) }
  return engine
}

function selectedEntry(): CatalogEntry {
  return DEFAULT_NOISES.find((e) => e.id === state.selectedId) ?? DEFAULT_NOISES[0]
}

function render(): void {
  document.documentElement.lang = state.locale
  const messages = getMessages(state.locale)
  toolbarSlot!.innerHTML = ''
  listSlot!.innerHTML = ''
  toolbarSlot!.append(
    renderToolbar(
      {
        nowPlaying: { ...selectedEntry(), name: noiseName(state.locale, selectedEntry().id, selectedEntry().name) },
        isPlaying: state.isPlaying,
        volume: state.volume,
        messages,
        errorText: state.errorText,
      },
      {
        onPrev: () => stepNoise(-1),
        onTogglePlay: () => void togglePlay(),
        onNext: () => stepNoise(1),
        onVolumeChange: (volume) => {
          state.volume = volume
          saveVolume(storage, volume)
          applyVolume()
          // 此处不可 render():拖动中重建 DOM 会销毁滑块并丢失鼠标捕获
        },
        onTimerClick: (anchor) => showTimerPopover(anchor),
        onLanguageClick: (anchor) => showLanguagePopover(anchor),
      },
    ),
  )
  listSlot!.append(
    renderNoiseList(
      {
        entries: DEFAULT_NOISES,
        selectedId: state.selectedId,
        favorites: state.favorites,
        locale: state.locale,
      },
      {
        onSelect: (entry) => {
          state.selectedId = entry.id
          render()
          void startPlayback()
        },
        onToggleFavorite: (id) => {
          state.favorites = toggleFavorite(state.favorites, id)
          saveFavorites(storage, state.favorites)
          render()
        },
      },
    ),
  )
}

async function togglePlay(): Promise<void> {
  if (state.isPlaying) {
    stopPlayback()
    state.errorText = null
    render()
  } else {
    await startPlayback() // 内部保证收尾 render,失败信息上屏
  }
}

function stepNoise(direction: -1 | 1): void {
  const visible = catalog.availableSounds()
  const index = visible.findIndex((n) => n.id === state.selectedId)
  const nextIndex = (index + direction + visible.length) % visible.length
  state.selectedId = visible[nextIndex].id
  render()
  if (state.isPlaying) void startPlayback()
}

/** 超时包装:音频上下文 resume 在缺失 GStreamer 插件的环境会永久挂起,不能让 UI 无响应 */
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/** 启动请求序号:快速连点/连选时只有最后一次生效 */
let startGeneration = 0

async function startPlayback(): Promise<void> {
  const generation = ++startGeneration
  const messages = getMessages(state.locale)
  try {
    const entry = selectedEntry()
    // ensureEngine/resume 必须在 try 内:WebKitGTK 缺 GStreamer 插件时会在这里抛出
    const { context, masterGain, player } = ensureEngine()
    await withTimeout(context.resume(), 3_000, messages.audioError)

    const url = audioUrl(entry)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`${messages.loadError}: ${response.status} ${url}`)
    const data = await response.arrayBuffer()
    let audioBuffer: AudioBuffer
    try {
      audioBuffer = await context.decodeAudioData(data)
    } catch {
      throw new Error(`${messages.decodeError} ${url}`)
    }
    if (generation !== startGeneration) return // 已被更新的启动请求取代

    const channels = Array.from({ length: audioBuffer.numberOfChannels }, (_, ch) =>
      audioBuffer.getChannelData(ch).slice(),
    )
    const loop = entry.crossFade
      ? buildLoopBuffer(
          segmentForCrossfade(channels, {
            fadeInSeconds: 0.03,
            fadeOutSeconds: 0.03,
            sampleRate: audioBuffer.sampleRate,
            mode: 'linear',
          }),
        )
      : { channels, sampleRate: audioBuffer.sampleRate }

    const offsetSeconds = entry.randomStart
      ? Math.random() * (loop.channels[0].length / loop.sampleRate)
      : 0

    applyVolume()
    player.play(loop, { offsetSeconds, destination: masterGain })
    state.isPlaying = true
    state.errorText = null
    startTimerLoop()
  } catch (error) {
    if (generation !== startGeneration) return
    state.isPlaying = false
    state.errorText = error instanceof Error ? error.message : String(error)
  }
  render()
}

function stopPlayback(): void {
  engine?.player.stop()
  state.isPlaying = false
  if (timerHandle !== null) {
    window.clearInterval(timerHandle)
    timerHandle = null
  }
  state.timerConfig = { kind: 'off' }
}

function applyVolume(): void {
  if (!engine) return
  const { fadeGain } = evaluateTimer(
    state.timerConfig,
    state.timerConfig.kind === 'off' ? 0 : 10_000,
    Date.now(),
    timerStartedAt,
  )
  engine.masterGain.gain.value = (state.volume / 100) * fadeGain
}

function startTimerLoop(): void {
  if (timerHandle !== null) window.clearInterval(timerHandle)
  timerStartedAt = Date.now()
  timerHandle = window.setInterval(() => {
    applyVolume()
    const timerState = evaluateTimer(state.timerConfig, 10_000, Date.now(), timerStartedAt)
    if (timerState.isFinished && state.timerConfig.kind !== 'off') {
      stopPlayback()
      render()
    }
  }, 500)
}

function showTimerPopover(anchor: HTMLElement): void {
  document.querySelector('.popover')?.remove()
  const popover = document.createElement('div')
  popover.className = 'popover'
  const messages = getMessages(state.locale)
  const options: Array<{ label: string; value: number }> = [
    { label: messages.timerOff, value: 0 },
    { label: messages.timer5, value: 300_000 },
    { label: messages.timer10, value: 600_000 },
    { label: messages.timer30, value: 1_800_000 },
  ]
  for (const option of options) {
    const button = document.createElement('button')
    button.textContent = option.label
    const isCurrent =
      (option.value === 0 && state.timerConfig.kind === 'off') ||
      (state.timerConfig.kind === 'duration' && state.timerConfig.durationMs === option.value)
    if (isCurrent) button.className = 'selected'
    button.addEventListener('click', () => {
      state.timerConfig =
        option.value === 0 ? { kind: 'off' } : { kind: 'duration', durationMs: option.value }
      if (state.isPlaying) startTimerLoop()
      popover.remove()
    })
    popover.append(button)
  }
  document.body.append(popover)
  const rect = anchor.getBoundingClientRect()
  popover.style.top = `${rect.bottom + 8}px`
  popover.style.left = `${Math.max(8, rect.right - popover.offsetWidth)}px`

  const dismiss = (event: MouseEvent): void => {
    if (!popover.contains(event.target as Node)) {
      popover.remove()
      document.removeEventListener('mousedown', dismiss)
    }
  }
  document.addEventListener('mousedown', dismiss)
}

function showLanguagePopover(anchor: HTMLElement): void {
  document.querySelector('.popover')?.remove()
  const popover = document.createElement('div')
  popover.className = 'popover'
  for (const { locale, label } of LOCALE_LABELS) {
    const button = document.createElement('button')
    button.textContent = label
    if (locale === state.locale) button.className = 'selected'
    button.addEventListener('click', () => {
      state.locale = locale
      saveLanguage(storage, locale)
      popover.remove()
      render()
    })
    popover.append(button)
  }
  document.body.append(popover)
  const rect = anchor.getBoundingClientRect()
  popover.style.top = `${rect.bottom + 8}px`
  popover.style.left = `${Math.max(8, rect.right - popover.offsetWidth)}px`

  const dismiss = (event: MouseEvent): void => {
    if (!popover.contains(event.target as Node)) {
      popover.remove()
      document.removeEventListener('mousedown', dismiss)
    }
  }
  document.addEventListener('mousedown', dismiss)
}


// 噪音模型满足 NoiseModel 约束(CatalogEntry 是其超集)
const _typeCheck: NoiseModel = DEFAULT_NOISES[0]
void _typeCheck

render()

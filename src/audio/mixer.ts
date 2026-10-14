/**
 * 多轨混音(每轨独立音量)。
 *
 * 离线混音等式:out[ch][i] = clamp(Σ track[ch][i] × track.volume) × masterVolume)
 * Web Audio 实时层只是同一等式的 GainNode 版本。
 * 纯函数实现,零 Web Audio 依赖。
 */

export interface MixTrack {
  /** 每声道 PCM 数据(各轨可不等长) */
  channels: Float32Array[]
  /** 轨音量 [0, 1] */
  volume: number
}

export interface MixOptions {
  /** 主音量 [0, 1],默认 1 */
  masterVolume?: number
  /** 采样率(透传给输出),默认 44100 */
  sampleRate?: number
}

export interface MixedBuffer {
  channels: Float32Array[]
  sampleRate: number
}

const DEFAULT_SAMPLE_RATE = 44100

export function mixDown(tracks: readonly MixTrack[], options: MixOptions = {}): MixedBuffer {
  const { masterVolume = 1, sampleRate = DEFAULT_SAMPLE_RATE } = options

  if (tracks.length === 0) {
    return { channels: [new Float32Array(0)], sampleRate }
  }

  const channelCount = Math.max(...tracks.map((t) => t.channels.length))
  const frameCount = Math.max(
    ...tracks.flatMap((t) => t.channels.map((c) => c.length)),
  )

  const channels: Float32Array[] = []
  for (let ch = 0; ch < channelCount; ch++) {
    const out = new Float32Array(frameCount)
    for (const track of tracks) {
      const data = track.channels[ch]
      if (!data) continue
      for (let i = 0; i < data.length; i++) {
        out[i] += data[i] * track.volume
      }
    }
    for (let i = 0; i < frameCount; i++) {
      out[i] = clampUnit(out[i]) * masterVolume
    }
    channels.push(out)
  }

  return { channels, sampleRate }
}

/** 硬钳制到 [-1, 1],防削波 */
function clampUnit(value: number): number {
  if (value > 1) return 1
  if (value < -1) return -1
  return value
}

/**
 * 无缝循环播放。
 *
 * 循环单元 = [middle | crossfade],crossfade[i] = head[i] + tail[i]:
 * tail(文件尾、淡出)与 head(文件头、淡入)在循环边界逐样本叠加。
 * 线性淡变下两者增益和恒为 1,恒幅输入在接缝处振幅连续。
 *
 * buildLoopBuffer / resampleTo 为纯函数;LoopPlayer 仅做 Web Audio 薄封装。
 */

import type { SegmentedBuffer } from './crossfade-loop'

export interface LoopBuffer {
  channels: Float32Array[]
  sampleRate: number
}

/**
 * 由分段缓冲合成可无缝循环的单缓冲。
 * head/tail 长度不等时线性重采样到交叉区长度 max(head, tail)。
 */
export function buildLoopBuffer(seg: SegmentedBuffer): LoopBuffer {
  const { head, middle, tail } = seg

  if (!head && !tail) {
    return { channels: middle.map((c) => new Float32Array(c)), sampleRate: seg.sampleRate }
  }

  const headCh = head ?? tail!.map((c) => new Float32Array(c.length)) // 缺段补零
  const tailCh = tail ?? head!.map((c) => new Float32Array(c.length))
  const crossLen = Math.max(headCh[0]?.length ?? 0, tailCh[0]?.length ?? 0)

  const channels = middle.map((mid, ch) => {
    const h = resampleTo(headCh[ch] ?? new Float32Array(0), crossLen)
    const t = resampleTo(tailCh[ch] ?? new Float32Array(0), crossLen)
    const out = new Float32Array(mid.length + crossLen)
    out.set(mid, 0)
    for (let i = 0; i < crossLen; i++) {
      out[mid.length + i] = h[i] + t[i]
    }
    return out
  })

  return { channels, sampleRate: seg.sampleRate }
}

/** 线性插值重采样;等长时恒等。 */
export function resampleTo(src: Float32Array, length: number): Float32Array {
  if (length <= 0 || src.length === 0) return new Float32Array(0)
  if (src.length === length) return new Float32Array(src)
  if (length === 1) return Float32Array.from([src[0]])

  const out = new Float32Array(length)
  const last = src.length - 1
  for (let i = 0; i < length; i++) {
    const pos = (i / (length - 1)) * last
    const lo = Math.floor(pos)
    const hi = Math.min(lo + 1, last)
    out[i] = src[lo] + (src[hi] - src[lo]) * (pos - lo)
  }
  return out
}

/** Web Audio 上下文的最小接口(便于测试注入 fake) */
export interface AudioContextLike {
  sampleRate: number
  createBufferSource(): {
    buffer: unknown
    loop: boolean
    connect(node: unknown): void
    start(when?: number, offset?: number): void
    stop(when?: number): void
    onended: (() => void) | null
  }
  createBuffer(channels: number, length: number, sampleRate: number): unknown
  destination: unknown
}

/**
 * 循环播放器:将 LoopBuffer 装入 AudioBuffer 并以 loop=true 播放。
 * 保持极薄 —— 算法全部在纯函数层。
 */
export class LoopPlayer {
  private source: ReturnType<AudioContextLike['createBufferSource']> | null = null
  private readonly context: AudioContextLike

  constructor(context: AudioContextLike) {
    this.context = context
  }

  play(
    loop: LoopBuffer,
    options: { offsetSeconds?: number; destination?: unknown } = {},
  ): void {
    this.stop()
    const maxLen = Math.max(...loop.channels.map((c) => c.length), 1)
    const audioBuffer = this.context.createBuffer(
      loop.channels.length,
      maxLen,
      loop.sampleRate,
    ) as {
      copyToChannel?(data: Float32Array, channel: number): void
      getChannelData?(channel: number): Float32Array
    }
    loop.channels.forEach((data, ch) => {
      if (audioBuffer.copyToChannel) {
        audioBuffer.copyToChannel(data, ch)
      } else if (audioBuffer.getChannelData) {
        audioBuffer.getChannelData(ch).set(data)
      }
    })

    const source = this.context.createBufferSource()
    source.buffer = audioBuffer
    source.loop = true
    source.connect((options.destination ?? this.context.destination) as never)
    source.start(0, options.offsetSeconds ?? 0)
    this.source = source
  }

  stop(): void {
    this.source?.stop()
    this.source = null
  }

  get isPlaying(): boolean {
    return this.source !== null
  }
}

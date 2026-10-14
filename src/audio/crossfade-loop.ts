/**
 * 无缝循环的缓冲分段。
 *
 * 将 PCM 缓冲切成 head/middle/tail 三段:
 *   head = fadeInSeconds × sampleRate 帧(施加淡入)
 *   tail = fadeOutSeconds × sampleRate 帧(施加淡出)
 *   middle = 总长 - head - tail(原样)
 *
 * 播放层在循环边界重叠调度 head 与 tail,形成交叉过渡。
 * 短文件(head+tail > 总长)按比例压缩两段,绝不凭空产生帧。
 *
 * 纯函数实现,复用 fade.ts 的逐样本增益。
 */

import { applyFades, type FadeMode } from './fade'

export interface SegmentOptions {
  fadeInSeconds: number
  fadeOutSeconds: number
  sampleRate: number
  mode: FadeMode
}

export interface SegmentedBuffer {
  /** 淡入段(已施加淡入);未请求淡入时为 null */
  head: Float32Array[] | null
  /** 中段,原样数据 */
  middle: Float32Array[]
  /** 淡出段(已施加淡出);未请求淡出时为 null */
  tail: Float32Array[] | null
  sampleRate: number
}

export function segmentForCrossfade(
  channels: readonly Float32Array[],
  options: SegmentOptions,
): SegmentedBuffer {
  const { fadeInSeconds, fadeOutSeconds, sampleRate, mode } = options
  const frameCount = channels[0]?.length ?? 0

  if (frameCount === 0) {
    return {
      head: null,
      middle: channels.map((c) => new Float32Array(c)),
      tail: null,
      sampleRate,
    }
  }

  let headFrames = framesFor(fadeInSeconds, sampleRate)
  let tailFrames = framesFor(fadeOutSeconds, sampleRate)

  // 短文件回退:head+tail 不超过总长,超出部分按比例压缩
  if (headFrames + tailFrames > frameCount) {
    const scale = frameCount / (headFrames + tailFrames)
    headFrames = Math.floor(headFrames * scale)
    tailFrames = frameCount - headFrames
  }

  const middleFrames = frameCount - headFrames - tailFrames

  const headSrc = sliceChannels(channels, 0, headFrames)
  const middle = sliceChannels(channels, headFrames, headFrames + middleFrames)
  const tailSrc = sliceChannels(channels, headFrames + middleFrames, frameCount)

  return {
    head:
      headFrames > 0
        ? applyFades(headSrc, {
            fadeInSeconds,
            fadeOutSeconds: 0,
            sampleRate,
            mode,
          })
        : null,
    middle,
    tail:
      tailFrames > 0
        ? applyFades(tailSrc, {
            fadeInSeconds: 0,
            fadeOutSeconds,
            sampleRate,
            mode,
          })
        : null,
    sampleRate,
  }
}

function framesFor(seconds: number, sampleRate: number): number {
  if (seconds <= 0 || sampleRate <= 0) return 0
  return Math.round(seconds * sampleRate)
}

function sliceChannels(
  channels: readonly Float32Array[],
  start: number,
  end: number,
): Float32Array[] {
  return channels.map((c) => c.slice(start, end))
}

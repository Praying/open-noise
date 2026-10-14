/**
 * 交叉淡化循环的逐样本增益引擎。
 *
 * - 线性模式:增益先步进后乘样本(淡入 += step,淡出 -= step)
 * - 指数模式:逐样本几何增益(淡入 *= fadeInPower,淡出 *= fadeOutPower)
 * - 淡变时长 <= 0 的段跳过;两者皆 <= 0 时原样返回
 *
 * 纯函数实现,不触碰 Web Audio API,便于 100% 单测。
 */

/** 指数模式的增益下限(对数域均匀衰减终点) */
export const GAIN_FLOOR = 0.01

export type FadeMode = 'linear' | 'exponential'

export interface FadeOptions {
  /** 淡入时长(秒),<= 0 表示不淡入 */
  fadeInSeconds: number
  /** 淡出时长(秒),<= 0 表示不淡出 */
  fadeOutSeconds: number
  sampleRate: number
  mode: FadeMode
}

/**
 * 对多通道 PCM 数据施加淡入/淡出,返回新的通道数组(输入不变)。
 *
 * 增益约定(先更新增益、再乘样本):
 * - 线性淡入:gain[i] = (i+1)/N
 * - 线性淡出:gain[j] = 1 - (j+1)/M
 * - 指数淡入:几何序列 floor → 1;指数淡出:1 → floor
 *
 * 淡入区与淡出区重叠时淡入优先。
 */
export function applyFades(
  channels: readonly Float32Array[],
  options: FadeOptions,
): Float32Array[] {
  const { fadeInSeconds, fadeOutSeconds, sampleRate, mode } = options

  if (fadeInSeconds <= 0 && fadeOutSeconds <= 0) {
    return channels.map((c) => new Float32Array(c))
  }

  const frameCount = channels[0]?.length ?? 0
  if (frameCount === 0) {
    return channels.map((c) => new Float32Array(c))
  }

  const fadeInFrames = clampFadeFrames(fadeInSeconds, sampleRate, frameCount)
  const fadeOutFrames = clampFadeFrames(fadeOutSeconds, sampleRate, frameCount)

  const gains = buildGains(frameCount, fadeInFrames, fadeOutFrames, mode)

  return channels.map((channel) => {
    const out = new Float32Array(channel.length)
    for (let i = 0; i < channel.length; i++) {
      out[i] = channel[i] * gains[i]
    }
    return out
  })
}

function clampFadeFrames(seconds: number, sampleRate: number, frameCount: number): number {
  if (seconds <= 0 || sampleRate <= 0) return 0
  return Math.min(Math.round(seconds * sampleRate), frameCount)
}

function buildGains(
  frameCount: number,
  fadeInFrames: number,
  fadeOutFrames: number,
  mode: FadeMode,
): Float32Array {
  const gains = new Float32Array(frameCount).fill(1)

  if (mode === 'linear') {
    buildLinearGains(gains, fadeInFrames, fadeOutFrames)
  } else {
    buildExponentialGains(gains, fadeInFrames, fadeOutFrames)
  }
  return gains
}

function buildLinearGains(
  gains: Float32Array,
  fadeInFrames: number,
  fadeOutFrames: number,
): void {
  const n = gains.length
  for (let i = 0; i < fadeInFrames; i++) {
    gains[i] = (i + 1) / fadeInFrames
  }
  // 淡入优先:淡出区从 max(n - fadeOutFrames, fadeInFrames) 起
  const outStart = Math.max(n - fadeOutFrames, fadeInFrames)
  for (let j = outStart; j < n; j++) {
    const step = j - outStart + 1
    gains[j] = 1 - step / fadeOutFrames
  }
}

function buildExponentialGains(
  gains: Float32Array,
  fadeInFrames: number,
  fadeOutFrames: number,
): void {
  const n = gains.length
  // N 个采样点均匀覆盖 floor ↔ 1(含两端):比值 r = (1/floor)^(1/(N-1))
  if (fadeInFrames > 0) {
    const r = fadeInFrames === 1 ? 0 : Math.pow(1 / GAIN_FLOOR, 1 / (fadeInFrames - 1))
    for (let i = 0; i < fadeInFrames; i++) {
      gains[i] = fadeInFrames === 1 ? 1 : GAIN_FLOOR * Math.pow(r, i)
    }
    gains[fadeInFrames - 1] = 1 // 消除浮点累积误差
  }
  const outStart = Math.max(n - fadeOutFrames, fadeInFrames)
  if (fadeOutFrames > 0 && outStart < n) {
    const r = fadeOutFrames === 1 ? 0 : Math.pow(GAIN_FLOOR, 1 / (fadeOutFrames - 1))
    for (let j = outStart; j < n; j++) {
      const i = j - outStart
      gains[j] = fadeOutFrames === 1 ? GAIN_FLOOR : Math.pow(r, i)
    }
    gains[n - 1] = GAIN_FLOOR // 消除浮点累积误差
  }
}

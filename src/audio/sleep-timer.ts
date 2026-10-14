/**
 * 睡眠定时器。
 *
 * 三种模式:关 | 时长倒计时 | 指定时刻。
 * 淡出语义:结束前 fadeDurationMs 窗口内增益线性 1 → 0;淡出时长长于总时长时从起点即渐弱。
 * 纯函数,时间由调用方注入(now/startedAt),便于确定性测试。
 */

export type TimerConfig =
  | { kind: 'off' }
  | { kind: 'duration'; durationMs: number }
  | { kind: 'until'; endTime: number }

export interface TimerState {
  /** 剩余毫秒;off 模式为 Infinity */
  remainingMs: number
  /** 当前应施加的音量增益 [0, 1] */
  fadeGain: number
  /** 倒计时是否已结束 */
  isFinished: boolean
}

export function evaluateTimer(
  config: TimerConfig,
  fadeDurationMs: number,
  nowMs: number,
  startedAtMs: number,
): TimerState {
  if (config.kind === 'off') {
    return {
      remainingMs: Number.POSITIVE_INFINITY,
      fadeGain: 1,
      isFinished: false,
    }
  }

  const endMs =
    config.kind === 'until' ? config.endTime : startedAtMs + config.durationMs
  const remainingMs = Math.max(0, endMs - nowMs)
  const isFinished = remainingMs <= 0

  if (isFinished) {
    return { remainingMs: 0, fadeGain: 0, isFinished: true }
  }

  const fadeGain =
    fadeDurationMs <= 0 ? 1 : clamp01(remainingMs / fadeDurationMs)

  return { remainingMs, fadeGain, isFinished: false }
}

function clamp01(value: number): number {
  if (value > 1) return 1
  if (value < 0) return 0
  return value
}

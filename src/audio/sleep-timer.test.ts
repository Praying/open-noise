import { describe, expect, test } from 'vitest'
import { evaluateTimer, type TimerConfig } from './sleep-timer'

// 三种定时模式(时长 | 指定时刻 | 关)与渐弱:进入淡出窗口后增益线性 1 → 0。

const SEC = 1000
const START = 1_000_000

describe('evaluateTimer — 时长模式', () => {
  test('倒计时剩余时间正确', () => {
    // Arrange
    const config: TimerConfig = { kind: 'duration', durationMs: 60 * SEC }

    // Act
    const state = evaluateTimer(config, 10 * SEC, START + 20 * SEC, START)

    // Assert
    expect(state.remainingMs).toBe(40 * SEC)
    expect(state.isFinished).toBe(false)
    expect(state.fadeGain).toBe(1) // 尚未进入淡出窗口
  })

  test('进入淡出窗口:增益线性下降', () => {
    // Arrange:60s 定时,10s 淡出,已过 55s → 剩 5s = 窗口中点
    const config: TimerConfig = { kind: 'duration', durationMs: 60 * SEC }

    // Act
    const state = evaluateTimer(config, 10 * SEC, START + 55 * SEC, START)

    // Assert
    expect(state.remainingMs).toBe(5 * SEC)
    expect(state.fadeGain).toBeCloseTo(0.5, 6)
  })

  test('时间到:增益归零且标记完成', () => {
    // Arrange
    const config: TimerConfig = { kind: 'duration', durationMs: 60 * SEC }

    // Act
    const state = evaluateTimer(config, 10 * SEC, START + 61 * SEC, START)

    // Assert
    expect(state.remainingMs).toBe(0)
    expect(state.fadeGain).toBe(0)
    expect(state.isFinished).toBe(true)
  })

  test('淡出时长长于总时长:从起点即开始渐弱', () => {
    // Arrange:5s 定时 + 10s 淡出
    const config: TimerConfig = { kind: 'duration', durationMs: 5 * SEC }

    // Act
    const state = evaluateTimer(config, 10 * SEC, START + 2.5 * SEC, START)

    // Assert:剩 2.5s,窗口 10s → 增益 0.25
    expect(state.fadeGain).toBeCloseTo(0.25, 6)
  })
})

describe('evaluateTimer — 指定时刻模式', () => {
  test('按结束时间倒计时', () => {
    // Arrange
    const config: TimerConfig = { kind: 'until', endTime: START + 30 * SEC }

    // Act
    const state = evaluateTimer(config, 5 * SEC, START + 10 * SEC, START)

    // Assert
    expect(state.remainingMs).toBe(20 * SEC)
    expect(state.fadeGain).toBe(1)
  })

  test('到达结束时间:完成', () => {
    // Arrange
    const config: TimerConfig = { kind: 'until', endTime: START + 30 * SEC }

    // Act
    const state = evaluateTimer(config, 5 * SEC, START + 30 * SEC, START)

    // Assert
    expect(state.isFinished).toBe(true)
    expect(state.fadeGain).toBe(0)
  })
})

describe('evaluateTimer — 关闭与边界', () => {
  test('off 模式:恒定增益、永不结束', () => {
    // Arrange
    const config: TimerConfig = { kind: 'off' }

    // Act
    const state = evaluateTimer(config, 10 * SEC, START + 999 * SEC, START)

    // Assert
    expect(state.isFinished).toBe(false)
    expect(state.fadeGain).toBe(1)
    expect(state.remainingMs).toBe(Number.POSITIVE_INFINITY)
  })

  test('淡出时长为 0:窗口外增益 1,结束时直接归零', () => {
    // Arrange
    const config: TimerConfig = { kind: 'duration', durationMs: 10 * SEC }

    // Act & Assert
    expect(evaluateTimer(config, 0, START + 9 * SEC, START).fadeGain).toBe(1)
    expect(evaluateTimer(config, 0, START + 10 * SEC, START).fadeGain).toBe(0)
  })

  test('增益恒在 [0,1] 区间(浮点安全)', () => {
    // Arrange
    const config: TimerConfig = { kind: 'duration', durationMs: 3 * SEC }

    // Act & Assert:对窗口内外多个采样点
    for (const t of [0, 1, 2.5, 3, 4]) {
      const { fadeGain } = evaluateTimer(config, 2 * SEC, START + t * SEC, START)
      expect(fadeGain).toBeGreaterThanOrEqual(0)
      expect(fadeGain).toBeLessThanOrEqual(1)
    }
  })
})

import { describe, expect, test } from 'vitest'
import { applyFades, GAIN_FLOOR } from './fade'

// 约定:
// - 线性模式:增益先步进后乘样本(淡入 gain[i] = (i+1)/N,淡出 gain[j] = 1 - (j+1)/M)
// - 指数模式:逐样本几何增益,时长内遍历 GAIN_FLOOR ↔ 1
// - fadeIn/out <= 0 时该段不处理;两者皆 <= 0 时原样返回

const SAMPLE_RATE = 8 // 低采样率便于手算期望值

function nSamples(seconds: number): number {
  return Math.round(seconds * SAMPLE_RATE)
}

describe('applyFades — 线性模式', () => {
  test('淡入:增益从 1/N 线性升至 1', () => {
    // Arrange
    const frames = nSamples(1) // 8 帧
    const input = new Float32Array(frames).fill(1)
    const channels = [input]

    // Act
    const [out] = applyFades(channels, {
      fadeInSeconds: 1,
      fadeOutSeconds: 0,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(Array.from(out)).toEqual([0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1])
  })

  test('淡出:增益从 1-1/M 线性降至 0', () => {
    // Arrange
    const frames = nSamples(1)
    const input = new Float32Array(frames).fill(1)

    // Act
    const [out] = applyFades([input], {
      fadeInSeconds: 0,
      fadeOutSeconds: 1,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert:先减后乘 —— [1-1/M, ..., 0]
    expect(Array.from(out)).toEqual([0.875, 0.75, 0.625, 0.5, 0.375, 0.25, 0.125, 0])
  })

  test('淡入淡出叠加:中段保持原始增益', () => {
    // Arrange:12 帧,各淡变 2 帧(0.25s)
    const input = new Float32Array(12).fill(0.5)

    // Act
    const [out] = applyFades([input], {
      fadeInSeconds: 0.25,
      fadeOutSeconds: 0.25,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(out[0]).toBeCloseTo(0.5 * 0.5, 6) // 1/2
    expect(out[1]).toBeCloseTo(0.5 * 1.0, 6)
    expect(out[5]).toBeCloseTo(0.5, 6) // 中段
    expect(out[10]).toBeCloseTo(0.5 * 0.5, 6) // 淡出第 1 帧:1-1/2
    expect(out[11]).toBeCloseTo(0, 6)
  })

  test('输入数据不可变:不修改原数组', () => {
    // Arrange
    const input = new Float32Array(nSamples(1)).fill(1)

    // Act
    applyFades([input], {
      fadeInSeconds: 1,
      fadeOutSeconds: 0,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(Array.from(input)).toEqual(new Array(8).fill(1))
  })
})

describe('applyFades — 指数模式', () => {
  test('淡入:几何递增,首帧 = floor+ 末帧 = 1', () => {
    // Arrange
    const frames = nSamples(1)
    const input = new Float32Array(frames).fill(1)

    // Act
    const [out] = applyFades([input], {
      fadeInSeconds: 1,
      fadeOutSeconds: 0,
      sampleRate: SAMPLE_RATE,
      mode: 'exponential',
    })

    // Assert
    expect(out[0]).toBeCloseTo(GAIN_FLOOR, 4)
    expect(out[frames - 1]).toBeCloseTo(1, 4)
    // 几何序列:相邻比值恒定
    const ratio = out[1] / out[0]
    for (let i = 2; i < frames; i++) {
      expect(out[i] / out[i - 1]).toBeCloseTo(ratio, 5)
    }
  })

  test('淡出:几何递减,末帧 = floor', () => {
    // Arrange
    const frames = nSamples(1)
    const input = new Float32Array(frames).fill(1)

    // Act
    const [out] = applyFades([input], {
      fadeInSeconds: 0,
      fadeOutSeconds: 1,
      sampleRate: SAMPLE_RATE,
      mode: 'exponential',
    })

    // Assert
    expect(out[0]).toBeCloseTo(1, 4)
    expect(out[frames - 1]).toBeCloseTo(GAIN_FLOOR, 4)
    for (let i = 1; i < frames; i++) {
      expect(out[i]).toBeLessThan(out[i - 1])
    }
  })
})

describe('applyFades — 边界情况', () => {
  test('淡变时长皆为 0:原样返回且不改变数据', () => {
    // Arrange
    const input = new Float32Array([1, -0.5, 0.25])

    // Act
    const [out] = applyFades([input], {
      fadeInSeconds: 0,
      fadeOutSeconds: 0,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(Array.from(out)).toEqual([1, -0.5, 0.25])
    expect(out).not.toBe(input) // 保持不可变约定:返回新数组
  })

  test('淡变时长超过缓冲长度:被钳制到帧数,不越界', () => {
    // Arrange:4 帧,却请求 10 秒淡变
    const input = new Float32Array(4).fill(1)

    // Act
    const [out] = applyFades([input], {
      fadeInSeconds: 10,
      fadeOutSeconds: 10,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(out).toHaveLength(4)
    expect(Array.from(out)).toEqual([0.25, 0.5, 0.75, 1])
    for (const v of out) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })

  test('空缓冲:原样返回', () => {
    // Arrange
    const input = new Float32Array(0)

    // Act
    const [out] = applyFades([input], {
      fadeInSeconds: 1,
      fadeOutSeconds: 1,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(out).toHaveLength(0)
  })

  test('负时长按 0 处理(返回原缓冲)', () => {
    // Arrange
    const input = new Float32Array([0.5, 0.5, 0.5, 0.5])

    // Act
    const [out] = applyFades([input], {
      fadeInSeconds: -1,
      fadeOutSeconds: -1,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(Array.from(out)).toEqual([0.5, 0.5, 0.5, 0.5])
  })

  test('多通道:各通道独立应用相同增益曲线', () => {
    // Arrange
    const left = new Float32Array(nSamples(1)).fill(1)
    const right = new Float32Array(nSamples(1)).fill(0.5)

    // Act
    const [l, r] = applyFades([left, right], {
      fadeInSeconds: 1,
      fadeOutSeconds: 0,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    for (let i = 0; i < l.length; i++) {
      expect(r[i]).toBeCloseTo(l[i] * 0.5, 6)
    }
  })
})

import { describe, expect, test } from 'vitest'
import { segmentForCrossfade, type SegmentedBuffer } from './crossfade-loop'

// head=fadeIn×sr、tail=fadeOut×sr、middle=len-head-tail,
// 对 head/tail 施加淡变、middle 保持原样。

const SAMPLE_RATE = 8

describe('segmentForCrossfade', () => {
  test('按淡变时长切出 head/middle/tail', () => {
    // Arrange:20 帧,head=2 帧(0.25s)、tail=4 帧(0.5s)
    const input = new Float32Array(20).fill(1)

    // Act
    const seg = segmentForCrossfade([input], {
      fadeInSeconds: 0.25,
      fadeOutSeconds: 0.5,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(seg.head?.[0]).toHaveLength(2)
    expect(seg.middle[0]).toHaveLength(14)
    expect(seg.tail?.[0]).toHaveLength(4)
  })

  test('head/tail 已施加淡变,middle 保持原样', () => {
    // Arrange
    const input = new Float32Array(20).fill(1)

    // Act
    const seg = segmentForCrossfade([input], {
      fadeInSeconds: 0.25,
      fadeOutSeconds: 0.5,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert:head 淡入至 1
    expect(seg.head?.[0][0]).toBeCloseTo(0.5, 6) // 1/2
    expect(seg.head?.[0][1]).toBeCloseTo(1, 6)
    // tail 淡出至 0
    expect(seg.tail?.[0][3]).toBeCloseTo(0, 6)
    // middle 未改动
    expect(Array.from(seg.middle[0])).toEqual(new Array(14).fill(1))
  })

  test('未指定淡入时长:无 head 段', () => {
    // Arrange
    const input = new Float32Array(10).fill(1)

    // Act
    const seg = segmentForCrossfade([input], {
      fadeInSeconds: 0,
      fadeOutSeconds: 0.5,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(seg.head).toBeNull()
    expect(seg.middle[0]).toHaveLength(6)
    expect(seg.tail?.[0]).toHaveLength(4)
  })

  test('短文件:head+tail 超过总长时按比例压缩,回退为单一 middle', () => {
    // Arrange:8 帧,却各要 1 秒(8 帧)head+tail
    const input = new Float32Array(8).fill(1)

    // Act
    const seg = segmentForCrossfade([input], {
      fadeInSeconds: 1,
      fadeOutSeconds: 1,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert:不能凭空产生帧 —— 各段之和 = 总长
    const total =
      (seg.head?.[0].length ?? 0) + seg.middle[0].length + (seg.tail?.[0].length ?? 0)
    expect(total).toBe(8)
    expect(seg.middle[0].length).toBeGreaterThanOrEqual(0)
  })

  test('多通道同步分段', () => {
    // Arrange:左右声道不同幅值
    const left = new Float32Array(16).fill(1)
    const right = new Float32Array(16).fill(0.5)

    // Act
    const seg = segmentForCrossfade([left, right], {
      fadeInSeconds: 0.25,
      fadeOutSeconds: 0.25,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(seg.head?.[0]).toHaveLength(2)
    expect(seg.head?.[1]).toHaveLength(2)
    expect(seg.middle[1][0]).toBeCloseTo(0.5, 6)
    expect(seg.tail?.[1][0]).toBeCloseTo(0.25, 6) // 0.5 × 淡出首帧增益 0.5
  })

  test('空缓冲:各段为空且不抛错', () => {
    // Arrange
    const input = new Float32Array(0)

    // Act
    const seg = segmentForCrossfade([input], {
      fadeInSeconds: 1,
      fadeOutSeconds: 1,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(seg.head).toBeNull()
    expect(seg.tail).toBeNull()
    expect(seg.middle[0]).toHaveLength(0)
  })

  test('淡变时长为 0:仅 middle,与原数据等长', () => {
    // Arrange
    const input = new Float32Array([1, 2, 3, 4, 5])

    // Act
    const seg = segmentForCrossfade([input], {
      fadeInSeconds: 0,
      fadeOutSeconds: 0,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(seg.head).toBeNull()
    expect(seg.tail).toBeNull()
    expect(Array.from(seg.middle[0])).toEqual([1, 2, 3, 4, 5])
  })

  test('返回类型包含 sampleRate 供播放层使用', () => {
    // Arrange
    const input = new Float32Array(8).fill(1)

    // Act
    const seg: SegmentedBuffer = segmentForCrossfade([input], {
      fadeInSeconds: 0.25,
      fadeOutSeconds: 0.25,
      sampleRate: SAMPLE_RATE,
      mode: 'linear',
    })

    // Assert
    expect(seg.sampleRate).toBe(SAMPLE_RATE)
  })
})

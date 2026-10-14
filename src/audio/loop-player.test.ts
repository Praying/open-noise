import { describe, expect, test } from 'vitest'
import { buildLoopBuffer, resampleTo, type LoopBuffer } from './loop-player'
import type { SegmentedBuffer } from './crossfade-loop'

// 循环单元 = [middle | crossfade],crossfade[i] = head[i] + tail[i]。
// 线性淡变下 head 增益 + tail 增益 ≡ 1,恒幅输入在接缝处振幅连续。

const SAMPLE_RATE = 8

function segOf(
  head: number[] | null,
  middle: number[],
  tail: number[] | null,
): SegmentedBuffer {
  const wrap = (a: number[]) => [Float32Array.from(a)]
  return {
    head: head ? wrap(head) : null,
    middle: wrap(middle),
    tail: tail ? wrap(tail) : null,
    sampleRate: SAMPLE_RATE,
  }
}

describe('buildLoopBuffer', () => {
  test('循环单元 = middle + (head+tail 逐样本叠加)', () => {
    // Arrange:middle 2 帧,head/tail 各 2 帧(已淡变)
    const seg = segOf([0.5, 1], [1, 1], [0.5, 0])

    // Act
    const buf: LoopBuffer = buildLoopBuffer(seg)

    // Assert
    expect(Array.from(buf.channels[0])).toEqual([1, 1, 1, 1]) // [middle | 0.5+0.5, 1+0]
  })

  test('恒幅输入的线性交叉淡化:接缝区振幅恒定(增益和 = 1)', () => {
    // Arrange:模拟真实分割 —— head 淡入 [0.25,0.5,0.75,1],tail 淡出 [0.75,0.5,0.25,0]
    const seg = segOf([0.25, 0.5, 0.75, 1], [1, 1], [0.75, 0.5, 0.25, 0])

    // Act
    const buf = buildLoopBuffer(seg)

    // Assert:全 buffer 皆为 1(振幅连续,无接缝跌落)
    for (const v of buf.channels[0]) {
      expect(v).toBeCloseTo(1, 6)
    }
  })

  test('无 head/tail:循环单元即 middle', () => {
    // Arrange
    const seg = segOf(null, [0.3, 0.6, 0.9], null)

    // Act
    const buf = buildLoopBuffer(seg)

    // Assert(Float32 容差)
    const out = buf.channels[0]
    expect(out).toHaveLength(3)
    expect(out[0]).toBeCloseTo(0.3, 6)
    expect(out[1]).toBeCloseTo(0.6, 6)
    expect(out[2]).toBeCloseTo(0.9, 6)
  })

  test('head/tail 长度不等:resample 至等长后叠加', () => {
    // Arrange:head 2 帧、tail 4 帧 → 交叉区取 4 帧(head 拉伸)
    const seg = segOf([1, 1], [1, 1, 1], [1, 1, 1, 1])

    // Act
    const buf = buildLoopBuffer(seg)

    // Assert:middle 3 + crossfade 4 = 7
    expect(buf.channels[0]).toHaveLength(7)
    // head 拉伸后 + tail = 2.x?不 —— 恒值 1+1=2
    for (let i = 3; i < 7; i++) {
      expect(buf.channels[0][i]).toBeCloseTo(2, 6)
    }
  })

  test('多通道独立合成', () => {
    // Arrange
    const seg: SegmentedBuffer = {
      head: [Float32Array.from([1, 1]), Float32Array.from([0.5, 0.5])],
      middle: [Float32Array.from([1, 1]), Float32Array.from([0.5, 0.5])],
      tail: [Float32Array.from([1, 1]), Float32Array.from([0.5, 0.5])],
      sampleRate: SAMPLE_RATE,
    }

    // Act
    const buf = buildLoopBuffer(seg)

    // Assert
    expect(buf.channels).toHaveLength(2)
    expect(buf.channels[0][2]).toBeCloseTo(2, 6) // 1+1
    expect(buf.channels[1][2]).toBeCloseTo(1, 6) // 0.5+0.5
  })

  test('保留 sampleRate', () => {
    const seg = segOf([1], [1], [1])
    expect(buildLoopBuffer(seg).sampleRate).toBe(SAMPLE_RATE)
  })
})

describe('resampleTo', () => {
  test('等长时恒等', () => {
    const src = Float32Array.from([1, 2, 3, 4])
    expect(Array.from(resampleTo(src, 4))).toEqual([1, 2, 3, 4])
  })

  test('拉伸:线性插值覆盖首尾', () => {
    const src = Float32Array.from([0, 1])
    const out = resampleTo(src, 3)
    expect(out[0]).toBeCloseTo(0, 6)
    expect(out[1]).toBeCloseTo(0.5, 6)
    expect(out[2]).toBeCloseTo(1, 6)
  })

  test('空源或目标长 0:返回空', () => {
    expect(resampleTo(new Float32Array(0), 3)).toHaveLength(0)
    expect(resampleTo(Float32Array.from([1, 2]), 0)).toHaveLength(0)
  })
})

import { describe, expect, test } from 'vitest'
import { mixDown, type MixTrack } from './mixer'

// 多轨按各自音量叠加,主音量缩放。
// 纯函数离线混音;Web Audio 层(每轨 GainNode)是同一等式的实时版本。

function track(channels: number[][], volume: number): MixTrack {
  return { channels: channels.map((c) => Float32Array.from(c)), volume }
}

describe('mixDown', () => {
  test('两轨按音量加权叠加', () => {
    // Arrange:同幅值两轨,各 50% 音量
    const tracks = [track([[1, 1, 1]], 0.5), track([[1, 1, 1]], 0.5)]

    // Act
    const out = mixDown(tracks)

    // Assert
    for (const v of out.channels[0]) {
      expect(v).toBeCloseTo(1, 6) // 0.5 + 0.5
    }
  })

  test('主音量整体缩放', () => {
    // Arrange
    const tracks = [track([[1, 1]], 1)]

    // Act
    const out = mixDown(tracks, { masterVolume: 0.25 })

    // Assert
    expect(out.channels[0][0]).toBeCloseTo(0.25, 6)
  })

  test('超出 [-1,1] 软钳制,防削波', () => {
    // Arrange:两轨满幅
    const tracks = [track([[1]], 1), track([[1]], 1)]

    // Act
    const out = mixDown(tracks)

    // Assert
    expect(out.channels[0][0]).toBeLessThanOrEqual(1)
    expect(out.channels[0][0]).toBeGreaterThanOrEqual(-1)
  })

  test('轨道长度不齐:以最长轨为准,短轨缺省为 0', () => {
    // Arrange
    const tracks = [track([[1, 1]], 1), track([[1]], 1)]

    // Act
    const out = mixDown(tracks)

    // Assert
    expect(out.channels[0]).toHaveLength(2)
    expect(out.channels[0][0]).toBeCloseTo(1, 6) // 1+1 钳制到 1
    expect(out.channels[0][1]).toBeCloseTo(1, 6) // 1+0
  })

  test('空轨道列表:返回空缓冲', () => {
    const out = mixDown([])
    expect(out.channels[0]).toHaveLength(0)
    expect(out.sampleRate).toBe(44100)
  })

  test('多声道:声道数取各轨最大值', () => {
    // Arrange:单声道轨 + 立体声轨
    const tracks = [track([[1, 1]], 1), track([[1, 1], [0.5, 0.5]], 1)]

    // Act
    const out = mixDown(tracks)

    // Assert
    expect(out.channels).toHaveLength(2)
    expect(out.channels[1][0]).toBeCloseTo(0.5, 6) // 短轨缺省 0 + 0.5
  })

  test('输入轨道数据不可变', () => {
    // Arrange
    const t = track([[1, 1]], 1)

    // Act
    mixDown([t])

    // Assert
    expect(Array.from(t.channels[0])).toEqual([1, 1])
  })
})

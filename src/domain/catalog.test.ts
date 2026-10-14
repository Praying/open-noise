import { describe, expect, test } from 'vitest'
import { SoundCatalog } from './catalog'
import type { NoiseModel } from './noise'
import { DEFAULT_NOISES } from '../catalog/default-noises'

// 全部音频直接开放 —— 目录无门禁,availableSounds 恒为全量。

function noise(id: string): NoiseModel {
  return {
    id,
    name: id,
    fileName: id,
    fileExtension: 'mp3',
    crossFade: true,
    randomStart: true,
  }
}

describe('SoundCatalog', () => {
  test('availableSounds 返回全部噪音', () => {
    // Arrange
    const catalog = new SoundCatalog([noise('a'), noise('b'), noise('c')])

    // Act
    const visible = catalog.availableSounds()

    // Assert
    expect(visible.map((n) => n.id)).toEqual(['a', 'b', 'c'])
  })

  test('sound(id) 查找存在项,未知 id 返回 null', () => {
    // Arrange
    const catalog = new SoundCatalog([noise('a')])

    // Act & Assert
    expect(catalog.sound('a')?.id).toBe('a')
    expect(catalog.sound('missing')).toBeNull()
  })

  test('allSounds 返回副本,不暴露内部数组', () => {
    // Arrange
    const catalog = new SoundCatalog([noise('a')])

    // Act
    const all = catalog.allSounds()
    all.push(noise('injected'))

    // Assert
    expect(catalog.allSounds()).toHaveLength(1)
  })
})

describe('内置目录数据', () => {
  const catalog = new SoundCatalog(DEFAULT_NOISES)

  test('包含 White Noise 与 Lullaby 的播放策略元数据', () => {
    const w = catalog.sound('white-noise')!
    expect(w.crossFade).toBe(false)
    expect(w.randomStart).toBe(true)

    const l = catalog.sound('lullaby')!
    expect(l.randomStart).toBe(false)
  })

  test('54 个噪音全部可播(无门禁)', () => {
    expect(catalog.availableSounds()).toHaveLength(DEFAULT_NOISES.length)
  })
})

import { describe, expect, test } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { DEFAULT_NOISES, groupEntriesByCategory } from './default-noises'
import { audioUrl } from '../domain/noise'

// 资源完整性回归测试:每个目录项都必须对应 public/audio 下真实存在、
// 且浏览器可解码的文件(WAV/MP3)。

const PUBLIC_AUDIO = resolve(__dirname, '../../public/audio')

describe('目录资源完整性', () => {
  test('每个噪音都有对应的音频文件', () => {
    const missing = DEFAULT_NOISES.filter(
      (n) => !existsSync(resolve(PUBLIC_AUDIO, `${n.fileName}.${n.fileExtension}`)),
    )
    expect(missing.map((n) => n.id)).toEqual([])
  })

  test('仅使用浏览器可解码的容器(wav/mp3/m4a)', () => {
    const allowed = new Set(['wav', 'mp3', 'm4a'])
    const bad = DEFAULT_NOISES.filter((n) => !allowed.has(n.fileExtension))
    expect(bad.map((n) => `${n.id}:.${n.fileExtension}`)).toEqual([])
  })

  test('audioUrl 与磁盘路径一致', () => {
    const n = DEFAULT_NOISES[0]
    expect(audioUrl(n)).toBe(`/audio/${n.fileName}.${n.fileExtension}`)
  })

  test('每个噪音的图标文件都存在', () => {
    const publicDir = resolve(__dirname, '../../public')
    const missing = DEFAULT_NOISES.filter(
      (n) => !existsSync(resolve(publicDir, n.icon.replace(/^\//, ''))),
    )
    expect(missing.map((n) => `${n.id}:${n.icon}`)).toEqual([])
  })
})

describe('目录结构', () => {
  test('共 54 个目录项,分组后无条目丢失', () => {
    const groups = groupEntriesByCategory(DEFAULT_NOISES)
    const total = groups.reduce((sum, g) => sum + g.members.length, 0)
    expect(DEFAULT_NOISES).toHaveLength(54)
    expect(total).toBe(54)
  })

  test('九个分类的数量与顺序', () => {
    const groups = groupEntriesByCategory(DEFAULT_NOISES)
    expect(groups.map((g) => [g.category.name, g.members.length])).toEqual([
      ['Noises', 5],
      ['Water', 13],
      ['Appliances', 6],
      ['Nature', 8],
      ['Fire', 3],
      ['Vehicles', 6],
      ['Urban', 9],
      ['Sleepy', 2],
      ['Classics', 2],
    ])
  })

  test('显示名与排序', () => {
    const groups = groupEntriesByCategory(DEFAULT_NOISES)
    const byId = Object.fromEntries(groups.map((g) => [g.category.id, g.members.map((m) => m.name)]))
    expect(byId.vehicles).toEqual([
      'Airplane Interior',
      'Car',
      'Spaceship Engine',
      'Steam Train',
      'Freight Train',
      'Ship Deck',
    ])
    expect(byId.urban).toEqual([
      'Coffee Shop',
      'City Street',
      'Office',
      'Train Station',
      'Construction',
      'Keyboard',
      'Laptop Fans',
      'Lawn Mower',
      'Flag',
    ])
    expect(byId.fire).toEqual(['Campfire', 'Fireplace', 'Fireworks'])
  })

})

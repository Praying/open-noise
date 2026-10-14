import { describe, expect, test } from 'vitest'
import {
  loadFavorites,
  loadLanguage,
  loadVolume,
  saveFavorites,
  saveLanguage,
  saveVolume,
  toggleFavorite,
  type PersistStorage,
} from './persist'

function memoryStorage(): PersistStorage & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  }
}

describe('persist', () => {
  test('收藏:保存后可读回', () => {
    // Arrange
    const storage = memoryStorage()

    // Act
    saveFavorites(storage, new Set(['white-noise', 'lullaby']))

    // Assert
    expect(loadFavorites(storage)).toEqual(new Set(['white-noise', 'lullaby']))
  })

  test('收藏:无数据返回空集合,坏 JSON 容错', () => {
    // Arrange
    const storage = memoryStorage()
    expect(loadFavorites(storage).size).toBe(0)

    // Act
    storage.setItem('opennoise.favorites', '{oops')

    // Assert
    expect(loadFavorites(storage).size).toBe(0)
  })

  test('toggleFavorite:返回新集合,不改输入', () => {
    // Arrange
    const original = new Set(['a'])

    // Act
    const added = toggleFavorite(original, 'b')
    const removed = toggleFavorite(original, 'a')

    // Assert
    expect(added).toEqual(new Set(['a', 'b']))
    expect(removed).toEqual(new Set())
    expect(original).toEqual(new Set(['a']))
  })


  test('音量:读写与钳制', () => {
    // Arrange
    const storage = memoryStorage()

    // Act & Assert
    expect(loadVolume(storage)).toBe(80) // 默认值
    saveVolume(storage, 55)
    expect(loadVolume(storage)).toBe(55)
    saveVolume(storage, 200)
    expect(loadVolume(storage)).toBe(100)
  })

  test('语言:读写与非法值回退 null(调用方用默认语言)', () => {
    // Arrange
    const storage = memoryStorage()

    // Act & Assert
    expect(loadLanguage(storage)).toBeNull()
    saveLanguage(storage, 'en')
    expect(loadLanguage(storage)).toBe('en')
    saveLanguage(storage, 'zh-Hans')
    expect(loadLanguage(storage)).toBe('zh-Hans')
    saveLanguage(storage, 'fr')
    expect(loadLanguage(storage)).toBeNull()
  })
})

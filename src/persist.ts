/**
 * 轻量持久化(收藏 / 音量 / 语言偏好)。
 * 注入 Storage 便于测试;不可变 API,各函数返回新值,不改输入。
 */

const KEY_FAVORITES = 'opennoise.favorites'
const KEY_VOLUME = 'opennoise.volume'
const KEY_LANGUAGE = 'opennoise.language'

export interface PersistStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function loadFavorites(storage: PersistStorage): Set<string> {
  const raw = storage.getItem(KEY_FAVORITES)
  if (!raw) return new Set()
  try {
    const parsed: unknown = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [])
  } catch {
    return new Set()
  }
}

export function saveFavorites(storage: PersistStorage, favorites: ReadonlySet<string>): void {
  storage.setItem(KEY_FAVORITES, JSON.stringify([...favorites]))
}

/** 返回更新后的新集合(不修改入参) */
export function toggleFavorite(
  favorites: ReadonlySet<string>,
  id: string,
): Set<string> {
  const next = new Set(favorites)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  return next
}

export function loadVolume(storage: PersistStorage): number {
  const raw = storage.getItem(KEY_VOLUME)
  if (raw === null) return 80
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 && value <= 100 ? value : 80
}

export function saveVolume(storage: PersistStorage, volume: number): void {
  storage.setItem(KEY_VOLUME, String(Math.min(100, Math.max(0, volume))))
}

/** 语言偏好读写;无效值回退 null 由调用方使用默认语言 */
export function loadLanguage(storage: PersistStorage): string | null {
  const raw = storage.getItem(KEY_LANGUAGE)
  return raw === 'zh-Hans' || raw === 'en' ? raw : null
}

export function saveLanguage(storage: PersistStorage, language: string): void {
  storage.setItem(KEY_LANGUAGE, language)
}

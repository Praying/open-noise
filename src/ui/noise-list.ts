/** 分类噪音列表:区块标题 + 行(图标块/名称/收藏心) */

import type { CatalogEntry } from '../catalog/default-noises'
import { groupEntriesByCategory } from '../catalog/default-noises'
import { categoryName, noiseName, type Locale } from '../i18n'
import { iconHeart } from './icons'

export interface NoiseListState {
  entries: readonly CatalogEntry[]
  selectedId: string
  favorites: ReadonlySet<string>
  locale: Locale
}

export interface NoiseListHandlers {
  onSelect(entry: CatalogEntry): void
  onToggleFavorite(id: string): void
}

export function renderNoiseList(state: NoiseListState, handlers: NoiseListHandlers): HTMLElement {
  const root = document.createElement('div')
  root.className = 'list'

  for (const { category, members } of groupEntriesByCategory(state.entries)) {
    const header = document.createElement('div')
    header.className = 'section-header'
    header.textContent = categoryName(state.locale, category.id, category.name)
    root.append(header)

    for (const entry of members) {
      root.append(renderRow(entry, state, handlers))
    }
  }
  return root
}

function renderRow(
  entry: CatalogEntry,
  state: NoiseListState,
  handlers: NoiseListHandlers,
): HTMLElement {
  const row = document.createElement('div')
  row.className = `row${entry.id === state.selectedId ? ' active' : ''}`

  const tile = document.createElement('div')
  tile.className = 'tile'
  const img = document.createElement('img')
  img.src = entry.icon
  img.alt = ''
  tile.append(img)

  const name = document.createElement('div')
  name.className = 'name'
  name.textContent = noiseName(state.locale, entry.id, entry.name)

  const trailing = document.createElement('div')
  trailing.className = 'trailing'
  const favored = state.favorites.has(entry.id)
  trailing.innerHTML = iconHeart(favored)

  row.addEventListener('click', () => {
    handlers.onSelect(entry)
  })

  trailing.addEventListener('click', (event) => {
    event.stopPropagation()
    handlers.onToggleFavorite(entry.id)
  })

  row.append(tile, name, trailing)
  return row
}

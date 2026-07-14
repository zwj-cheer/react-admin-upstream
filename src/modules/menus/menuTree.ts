import type { MenuItem } from '@/core/services/contracts'

export interface MenuTreeRow extends MenuItem {
  depth: number
  first: boolean
  last: boolean
}

function compareSiblings(left: MenuItem, right: MenuItem): number {
  return left.order - right.order || left.id.localeCompare(right.id)
}

export function flattenMenuTree(menus: readonly MenuItem[]): MenuTreeRow[] {
  const childrenByParent = new Map<string | null, MenuItem[]>()
  const knownIds = new Set(menus.map((menu) => menu.id))

  for (const menu of menus) {
    const parentId = menu.parentId && knownIds.has(menu.parentId) ? menu.parentId : null
    const siblings = childrenByParent.get(parentId) ?? []
    siblings.push(menu)
    childrenByParent.set(parentId, siblings)
  }

  for (const siblings of childrenByParent.values()) {
    siblings.sort(compareSiblings)
  }

  const rows: MenuTreeRow[] = []
  const visited = new Set<string>()

  const appendChildren = (parentId: string | null, depth: number) => {
    const siblings = (childrenByParent.get(parentId) ?? []).filter((menu) => !visited.has(menu.id))

    siblings.forEach((menu, index) => {
      visited.add(menu.id)
      rows.push({
        ...menu,
        depth,
        first: index === 0,
        last: index === siblings.length - 1,
      })
      appendChildren(menu.id, depth + 1)
    })
  }

  appendChildren(null, 0)

  for (const menu of [...menus].sort(compareSiblings)) {
    if (!visited.has(menu.id)) {
      visited.add(menu.id)
      rows.push({ ...menu, depth: 0, first: true, last: true })
      appendChildren(menu.id, 1)
    }
  }

  return rows
}

export function getDescendantIds(menus: readonly MenuItem[], menuId: string): Set<string> {
  const descendants = new Set<string>()
  const pending = [menuId]

  while (pending.length) {
    const parentId = pending.shift()
    for (const menu of menus) {
      if (menu.parentId === parentId && menu.id !== menuId && !descendants.has(menu.id)) {
        descendants.add(menu.id)
        pending.push(menu.id)
      }
    }
  }

  return descendants
}

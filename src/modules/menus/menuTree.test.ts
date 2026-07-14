import { describe, expect, it } from 'vitest'
import type { MenuItem } from '@/core/services/contracts'
import { flattenMenuTree, getDescendantIds } from './menuTree'

const menus: MenuItem[] = [
  {
    id: 'root-later',
    parentId: null,
    name: 'Later',
    routeKey: 'later',
    icon: 'menu',
    status: 'active',
    order: 2,
  },
  {
    id: 'child-later',
    parentId: 'root-first',
    name: 'Child later',
    routeKey: 'child-later',
    icon: 'menu',
    status: 'active',
    order: 2,
  },
  {
    id: 'grandchild',
    parentId: 'child-first',
    name: 'Grandchild',
    routeKey: 'grandchild',
    icon: 'menu',
    status: 'active',
    order: 1,
  },
  {
    id: 'root-first',
    parentId: null,
    name: 'First',
    routeKey: 'first',
    icon: 'menu',
    status: 'active',
    order: 1,
  },
  {
    id: 'child-first',
    parentId: 'root-first',
    name: 'Child first',
    routeKey: 'child-first',
    icon: 'menu',
    status: 'active',
    order: 1,
  },
]

describe('menuTree', () => {
  it('flattens hierarchy in sibling order and records depth and sibling boundaries', () => {
    expect(
      flattenMenuTree(menus).map(({ id, depth, first, last }) => ({ id, depth, first, last })),
    ).toEqual([
      { id: 'root-first', depth: 0, first: true, last: false },
      { id: 'child-first', depth: 1, first: true, last: false },
      { id: 'grandchild', depth: 2, first: true, last: true },
      { id: 'child-later', depth: 1, first: false, last: true },
      { id: 'root-later', depth: 0, first: false, last: true },
    ])
  })

  it('returns all descendants without including the selected menu', () => {
    expect([...getDescendantIds(menus, 'root-first')]).toEqual([
      'child-later',
      'child-first',
      'grandchild',
    ])
  })
})

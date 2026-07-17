import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

type AxeResults = Awaited<ReturnType<AxeBuilder['analyze']>>

/** 统一启用 WCAG 2.0/2.1 A/AA 与 axe 提供的 WCAG 2.2 AA 新规则。 */
export function createAxeBuilder(page: Page): AxeBuilder {
  return new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
}

/** 以可读摘要报告全部 axe 违规，不按 impact 丢弃问题。 */
export function expectNoA11yViolations(results: AxeResults): void {
  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    nodes: violation.nodes.map((node) => ({ html: node.html, target: node.target })),
  }))

  expect(violations, JSON.stringify(violations, null, 2)).toEqual([])
}

/** 等待页面自身的有限入场动画结束，避免祖先临时 opacity 让 axe 误报整页对比度。 */
export async function waitForPageEnterAnimation(page: Page): Promise<void> {
  const pageEnter = page.locator('.page-enter')
  await expect(pageEnter).toBeVisible()
  await pageEnter.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  )
}

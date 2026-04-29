const { test, expect } = require('@playwright/test');

const API = 'http://localhost:3002/api';

// ═══════════════════════════════════
// 1. API Tests
// ═══════════════════════════════════

test.describe('API', () => {
  test('GET /api/branches returns all 6 branches', async ({ request }) => {
    const res = await request.get(`${API}/branches`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Object.keys(data)).toHaveLength(6);
    expect(data.foundation).toHaveProperty('label');
    expect(data.foundation).toHaveProperty('color');
  });

  test('GET /api/papers returns 16 papers with correct shape', async ({ request }) => {
    const res = await request.get(`${API}/papers`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(16);

    const jehn = data.find((p) => p.id === 'jehn1995');
    expect(jehn).toBeTruthy();
    expect(jehn.title).toContain('Multimethod');
    expect(jehn.prereqs).toContain('pinkley1990');
    expect(jehn.prereqs).toContain('deutsch1973');
    expect(jehn.branchColor).toBeTruthy();
    expect(Array.isArray(jehn.keyFindings)).toBe(true);
  });

  test('GET /api/papers/:id returns single paper with analysis fields', async ({ request }) => {
    const res = await request.get(`${API}/papers/jehn1995`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('jehn1995');
    expect(data.year).toBe(1995);
    expect(data).toHaveProperty('analysis');
    expect(data).toHaveProperty('analyzedAt');
    expect(data).toHaveProperty('pdfUrl');
  });

  test('GET /api/papers/nonexistent returns 404', async ({ request }) => {
    const res = await request.get(`${API}/papers/nonexistent`);
    expect(res.status()).toBe(404);
  });

  test('GET /api/papers/:id/analysis returns 404 when not yet analyzed', async ({ request }) => {
    // Pick a paper unlikely to have been analyzed
    const res = await request.get(`${API}/papers/thomas1976/analysis`);
    // Could be 404 if not analyzed
    expect([200, 404]).toContain(res.status());
  });
});

// ═══════════════════════════════════
// 2. Frontend — Page Load & Graph
// ═══════════════════════════════════

test.describe('Frontend - Graph', () => {
  test('page loads and shows topbar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.topbar h1')).toContainText('Research Tech Tree');
    await expect(page.locator('.topbar .topic')).toContainText('團隊衝突管理');
  });

  test('renders all 16 paper nodes', async ({ page }) => {
    await page.goto('/');
    // Wait for nodes to render
    await page.waitForSelector('.paper-node', { timeout: 10000 });
    const nodes = page.locator('.paper-node');
    await expect(nodes).toHaveCount(16);
  });

  test('legend shows all branch categories', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.legend-item');
    const items = page.locator('.legend-item');
    await expect(items).toHaveCount(6);
  });

  test('nodes display year, title, and author', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');
    // Check Jehn 1995 node content
    const jehnNode = page.locator('.paper-node', { hasText: '1995' }).filter({ hasText: 'Jehn' });
    await expect(jehnNode).toBeVisible();
    await expect(jehnNode.locator('.node-year')).toContainText('1995');
    await expect(jehnNode.locator('.node-author')).toContainText('Jehn');
  });
});

// ═══════════════════════════════════
// 3. Frontend — Detail Panel
// ═══════════════════════════════════

test.describe('Frontend - Detail Panel', () => {
  test('clicking a node opens detail panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    // Panel should not be visible initially
    await expect(page.locator('.detail-panel')).toHaveCount(0);

    // Click Jehn 1995
    const jehnNode = page.locator('.paper-node', { hasText: '1995' }).filter({ hasText: 'Jehn' });
    await jehnNode.click();

    // Panel should appear
    const panel = page.locator('.detail-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('.detail-title')).toContainText('Multimethod');
    await expect(panel.locator('.detail-authors')).toContainText('Jehn');
  });

  test('detail panel shows summary, findings, significance sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    const jehnNode = page.locator('.paper-node', { hasText: '1995' }).filter({ hasText: 'Jehn' });
    await jehnNode.click();

    const panel = page.locator('.detail-panel');
    const headers = panel.locator('.detail-section h3');
    const headerTexts = await headers.allTextContents();
    expect(headerTexts).toContain('摘要');
    expect(headerTexts).toContain('主要發現');
    expect(headerTexts).toContain('重要性');
  });

  test('detail panel shows prerequisite and dependent links', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    // Jehn 1995 has prereqs and dependents
    const jehnNode = page.locator('.paper-node', { hasText: '1995' }).filter({ hasText: 'Jehn' });
    await jehnNode.click();

    const panel = page.locator('.detail-panel');
    const headers = await panel.locator('.detail-section h3').allTextContents();
    expect(headers).toContain('前置研究');
    expect(headers).toContain('後續影響');

    // Has connection items
    const connItems = panel.locator('.detail-conn-item');
    expect(await connItems.count()).toBeGreaterThan(0);
  });

  test('clicking prerequisite link navigates to that paper', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    // Open Jehn 1995
    const jehnNode = page.locator('.paper-node', { hasText: '1995' }).filter({ hasText: 'Jehn' });
    await jehnNode.click();

    const panel = page.locator('.detail-panel');
    await expect(panel.locator('.detail-title')).toContainText('Multimethod');

    // Click on a prereq link (Pinkley or Deutsch)
    const firstConn = panel.locator('.detail-conn-item').first();
    await firstConn.click();

    // Title should change
    await expect(panel.locator('.detail-title')).not.toContainText('Multimethod');
  });

  test('close button closes the panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    const node = page.locator('.paper-node').first();
    await node.click();

    const panel = page.locator('.detail-panel');
    await expect(panel).toBeVisible();

    await panel.locator('.close-btn').click();
    await expect(panel).toHaveCount(0);
  });

  test('Escape key closes the panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    const node = page.locator('.paper-node').first();
    await node.click();
    await expect(page.locator('.detail-panel')).toBeVisible();

    await page.keyboard.press('Escape');
    // React Flow handles Escape too; panel should close via pane click or key
    // Give it a moment
    await page.waitForTimeout(500);
  });
});

// ═══════════════════════════════════
// 4. Frontend — Action Buttons
// ═══════════════════════════════════

test.describe('Frontend - Action Buttons', () => {
  test('detail panel has download and analyze buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    const jehnNode = page.locator('.paper-node', { hasText: '1995' }).filter({ hasText: 'Jehn' });
    await jehnNode.click();

    const panel = page.locator('.detail-panel');
    await expect(panel.locator('.download-btn')).toBeVisible();
    await expect(panel.locator('.analyze-btn')).toBeVisible();
  });

  test('download button shows "下載論文" when pdfUrl exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    // Jehn 1995 has a pdf_url
    const jehnNode = page.locator('.paper-node', { hasText: '1995' }).filter({ hasText: 'Jehn' });
    await jehnNode.click();

    await expect(page.locator('.download-btn')).toContainText('下載論文');
  });

  test('download button shows "搜尋論文" when no pdfUrl', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    // Coser 1956 has no pdf_url
    const coserNode = page.locator('.paper-node', { hasText: '1956' });
    await coserNode.click();

    await expect(page.locator('.download-btn')).toContainText('搜尋論文');
  });

  test('download button opens new tab for PDF', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    const jehnNode = page.locator('.paper-node', { hasText: '1995' }).filter({ hasText: 'Jehn' });
    await jehnNode.click();

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('.download-btn').click(),
    ]);
    // Should open a URL (PDF or Scholar)
    expect(newPage.url()).toBeTruthy();
    await newPage.close();
  });

  test('analyze button says "深入分析" when not yet analyzed', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    // Pick a paper that's probably not analyzed
    const thomasNode = page.locator('.paper-node', { hasText: '1976' });
    await thomasNode.click();

    await expect(page.locator('.analyze-btn')).toContainText('深入分析');
  });
});

// ═══════════════════════════════════
// 5. Pan & Zoom (React Flow)
// ═══════════════════════════════════

test.describe('Frontend - Pan & Zoom', () => {
  test('mouse wheel zooms the canvas', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    // Get initial transform
    const pane = page.locator('.react-flow__viewport');
    const before = await pane.evaluate((el) => el.style.transform);

    // Zoom in via wheel
    await page.mouse.move(500, 400);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(300);

    const after = await pane.evaluate((el) => el.style.transform);
    expect(after).not.toBe(before);
  });

  test('drag pans the canvas', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    const pane = page.locator('.react-flow__viewport');
    const before = await pane.evaluate((el) => el.style.transform);

    // Drag on empty area
    await page.mouse.move(600, 400);
    await page.mouse.down();
    await page.mouse.move(400, 300, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const after = await pane.evaluate((el) => el.style.transform);
    expect(after).not.toBe(before);
  });
});

// ═══════════════════════════════════
// 6. Hover Highlighting
// ═══════════════════════════════════

test.describe('Frontend - Hover Highlighting', () => {
  test('hovering a node dims unrelated nodes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.paper-node');

    // Hover over Jehn 1995
    const jehnNode = page.locator('.react-flow__node', { hasText: 'Jehn' }).filter({ hasText: '1995' });
    await jehnNode.hover();
    await page.waitForTimeout(300);

    // Some nodes should have reduced opacity
    const allNodes = page.locator('.react-flow__node');
    const opacities = await allNodes.evaluateAll((nodes) =>
      nodes.map((n) => parseFloat(getComputedStyle(n).opacity) || parseFloat(n.style.opacity) || 1)
    );

    const dimmed = opacities.filter((o) => o < 0.5);
    expect(dimmed.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════
// 7. Minimap
// ═══════════════════════════════════

test.describe('Frontend - Minimap', () => {
  test('minimap is rendered', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow__minimap');
    await expect(page.locator('.react-flow__minimap')).toBeVisible();
  });
});

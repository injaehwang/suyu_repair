// Playwright 로그아웃 테스트 스크립트
// 실행: npx playwright test logout.spec.ts --headed

import { test, expect } from '@playwright/test';

test('logout functionality test', async ({ page }) => {
    // 1. 사이트 접속
    await page.goto('https://suyu.ai.kr');
    await page.waitForTimeout(3000);

    // 2. 로그인 상태 확인
    const isLoggedIn = await page.locator('button[title="로그아웃"]').isVisible();

    if (!isLoggedIn) {
        console.log('❌ Not logged in, cannot test logout');
        return;
    }

    console.log('✅ User is logged in');

    // 3. Console 메시지 수집
    const consoleMessages: string[] = [];
    page.on('console', msg => {
        if (msg.text().includes('[LOGOUT]')) {
            consoleMessages.push(msg.text());
            console.log('Console:', msg.text());
        }
    });

    // 4. 로그아웃 버튼 클릭
    await page.locator('button[title="로그아웃"]').click();

    // 5. 리다이렉트 대기
    await page.waitForTimeout(3000);

    // 6. 결과 확인
    const stillLoggedIn = await page.locator('button[title="로그아웃"]').isVisible();

    console.log('\n=== Test Results ===');
    console.log('Console messages:', consoleMessages);
    console.log('Still logged in:', stillLoggedIn);
    console.log('Current URL:', page.url());

    // 7. 쿠키 확인
    const cookies = await page.context().cookies();
    console.log('Remaining cookies:', cookies.map(c => c.name));

    // 8. 스크린샷
    await page.screenshot({ path: 'logout-result.png', fullPage: true });

    // 9. 검증
    expect(stillLoggedIn).toBe(false);
    expect(consoleMessages.length).toBeGreaterThan(0);
});

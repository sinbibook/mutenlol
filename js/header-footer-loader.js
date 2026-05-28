/**
 * Header and Footer Loader
 * header.html / footer.html을 페이지에 동적으로 로드하고
 * header.html에 포함된 스크립트를 추출하여 실행 후
 * HeaderFooterMapper를 초기화
 */

(function() {
    'use strict';

    let headerLoaded = false;
    let footerLoaded = false;

    // 이미 로드된 스크립트 추적 (중복 로드 방지)
    const loadedScripts = new Set();

    // 스크립트 동적 로드 (Promise)
    function loadScript(src) {
        // 이미 로드됐거나 페이지에 존재하면 스킵
        if (loadedScripts.has(src)) return Promise.resolve();
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            loadedScripts.add(src);
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                loadedScripts.add(src);
                resolve();
            };
            script.onerror = () => {
                console.error('Script load error:', src);
                resolve(); // 에러여도 계속 진행
            };
            document.body.appendChild(script);
        });
    }

    // 헤더/푸터 모두 로드 완료 후 mapper 초기화
    async function tryInitializeMapper() {
        if (!headerLoaded || !footerLoaded) return;
        if (!window.HeaderFooterMapper) return;

        // 프리뷰 환경(iframe)이면 PreviewHandler가 처리하므로 스킵
        const isPreview = window.parent !== window;
        if (isPreview) return;

        const mapper = new window.HeaderFooterMapper();
        await mapper.initialize();
    }

    // Header 로드
    async function loadHeader() {
        const headerContainer = document.getElementById('header-container');
        if (!headerContainer) {
            headerLoaded = true;
            await tryInitializeMapper();
            return;
        }

        try {
            const response = await fetch('./common/header.html', { cache: 'no-cache' });
            const html = await response.text();

            // 임시 DOM에서 script 태그 추출
            const temp = document.createElement('div');
            temp.innerHTML = html;

            const scriptEls = temp.querySelectorAll('script[src]');
            const scriptSrcs = Array.from(scriptEls).map(s => s.getAttribute('src'));
            scriptEls.forEach(s => s.remove());

            // HTML 주입 (스크립트 제외)
            headerContainer.innerHTML = temp.innerHTML;

            // 스크립트 순차 로드
            for (const src of scriptSrcs) {
                await loadScript(src);
            }

            headerLoaded = true;
            await tryInitializeMapper();
        } catch (error) {
            console.error('Error loading header:', error);
            headerLoaded = true;
            await tryInitializeMapper();
        }
    }

    // Footer nav 모바일 아코디언: 타이틀 클릭 시 .footer-nav-tab에 .is-open 토글
    function setupFooterAccordion(root) {
        const tabs = root.querySelectorAll('.footer-nav-tab');
        tabs.forEach(tab => {
            const item = tab.querySelector('.footer-nav-item');
            if (!item) return;
            item.addEventListener('click', () => {
                tab.classList.toggle('is-open');
            });
        });
    }

    // Footer 로드
    async function loadFooter() {
        const footerContainer = document.getElementById('footer-container');
        if (!footerContainer) {
            footerLoaded = true;
            await tryInitializeMapper();
            return;
        }

        try {
            const response = await fetch('./common/footer.html', { cache: 'no-cache' });
            const html = await response.text();
            footerContainer.innerHTML = html;

            setupFooterAccordion(footerContainer);

            footerLoaded = true;
            await tryInitializeMapper();
        } catch (error) {
            console.error('Error loading footer:', error);
            footerLoaded = true;
            await tryInitializeMapper();
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        loadHeader();
        loadFooter();
    });

})();

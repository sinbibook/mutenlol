/**
 * Header and Footer Loader
 * Dynamically loads header and footer templates into pages
 */

(function() {
    'use strict';

    // Track if header and footer are both loaded
    let headerLoaded = false;
    let footerLoaded = false;

    // Initialize mapper after both header and footer are loaded
    async function tryInitializeMapper() {
        if (headerLoaded && footerLoaded && window.HeaderFooterMapper) {
            // 프리뷰 환경인지 확인 (iframe 내부)
            const isPreview = window.parent !== window;

            if (!isPreview) {
                // 일반 페이지: 기본 데이터로 매핑
                const mapper = new window.HeaderFooterMapper();
                await mapper.initialize();

                // 매핑 완료 후 헤더/사이드바 표시
                if (window.showHeaders) window.showHeaders();
            }
            // 프리뷰 환경: PreviewHandler가 처리하므로 여기서는 매핑하지 않음
        }
    }

    // Load CSS
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    // Load Header
    async function loadHeader() {
        try {
            // Load header CSS first
            loadCSS('styles/header.css');

            const response = await fetch('common/header.html', { cache: 'no-cache' });
            const html = await response.text();

            // Create a temporary container
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Find side header and top header directly from temp
            const sideHeader = temp.querySelector('.side-header');
            const topHeader = temp.querySelector('.top-header');

            // Insert side header first (so it appears before top-header in DOM)
            if (sideHeader) {
                document.body.insertBefore(sideHeader, document.body.firstChild);
            }

            // Insert top header (hamburger-button is already inside)
            if (topHeader) {
                document.body.insertBefore(topHeader, document.body.firstChild);
            }

            // Load header JavaScript
            const script = document.createElement('script');
            script.src = 'js/common/header.js';
            script.onload = function() {
                // Re-initialize hamburger button after script loads
                setTimeout(() => {
                    const hamburgerButton = document.getElementById('hamburger-button');
                    if (hamburgerButton && window.toggleSideHeader) {
                        hamburgerButton.addEventListener('click', window.toggleSideHeader);
                    }
                }, 100);

                // Mark header as loaded after script is fully loaded
                headerLoaded = true;
                tryInitializeMapper();
            };
            document.body.appendChild(script);

            // Immediately check scroll position after header is loaded
            if (window.scrollY > 50 || window.pageYOffset > 50) {
                const header = document.querySelector('.header');
                if (header) {
                    header.classList.add('scrolled');
                }
            }
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    // Load Footer
    async function loadFooter() {
        try {
            const response = await fetch('common/footer.html', { cache: 'no-cache' });
            if (response.ok) {
                // Load footer CSS
                loadCSS('styles/footer.css');

                const html = await response.text();

                // Create a temporary container
                const temp = document.createElement('div');
                temp.innerHTML = html;

                // Append footer at the end of body
                const footer = temp.querySelector('.footer');
                if (footer) {
                    document.body.appendChild(footer);
                }

                // Load footer JavaScript if exists
                const script = document.createElement('script');
                script.src = 'js/common/footer.js';
                document.body.appendChild(script);

                // Mark footer as loaded and try to initialize mapper
                footerLoaded = true;
                tryInitializeMapper();
            }
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        loadHeader();
        loadFooter();
    });

})();

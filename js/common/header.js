/**
 * Header Component Script
 * - Loads header HTML into the page
 * - Handles header scroll behavior
 */

(function() {
    'use strict';

    // Initialize header behavior (header-footer-loader.js가 HTML 주입 후 이 스크립트를 동적 로드)
    function loadHeader() {
        initHeaderBehavior();
    }

    // Initialize header behavior
    function initHeaderBehavior() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        // 모바일 Menu 버튼 클릭 시 드롭다운 토글
        const menuBtn = header.querySelector('.header-menu-btn');
        const dropdown = header.querySelector('.header-dropdown');
        if (!menuBtn || !dropdown) return;

        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = dropdown.classList.toggle('is-open');
            header.classList.toggle('menu-active', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', function(e) {
            if (!header.contains(e.target)) {
                dropdown.classList.remove('is-open');
                header.classList.remove('menu-active');
                document.body.style.overflow = '';
            }
        });

        // 모바일 아코디언: 타이틀 클릭 시 서브메뉴 접기/펼치기
        var colTitles = dropdown.querySelectorAll('.dropdown-col-title');
        colTitles.forEach(function(title) {
            title.addEventListener('click', function(e) {
                e.stopPropagation();
                var col = title.closest('.dropdown-col');
                col.classList.toggle('is-expanded');
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHeader);
    } else {
        loadHeader();
    }
})();

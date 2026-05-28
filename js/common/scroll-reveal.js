/**
 * 스크롤 Reveal 모션 — 우아하고 절제된 fade-up
 * IntersectionObserver로 viewport에 들어오면 .is-in-view 클래스를 추가해
 * CSS의 [data-reveal] 트랜지션 트리거
 *
 * 사용:
 *  - 자동: 페이지 주요 섹션(.con-2, .con-3, .roomview-section 등)에 자동 부착
 *  - 수동: HTML에 data-reveal 속성 추가
 *  - 순차: data-reveal-delay="1|2|3|4" 로 stagger
 */
(function () {
    'use strict';

    var REVEAL_TARGETS = [
        // main.html
        '.con-2',
        '.con-3',
        '.gangreong-mutenrol-parent',
        '.description-components',
        '.description-components2',
        '.description-components3',
        '.quote-section',
        '.quote-content',
        // index.html
        '.prologue-section',
        '.slider-section',
        '.gallery-section',
        '.roomview-section',
        '.roomview-title',
        // .special-section과 .special-content 제외 — scale 애니메이션이 중첩되어 .special-image가 크게 보이는 문제 회피
        '.specials-detail-section',
        // direction/room/facility/reservation 공통
        '.location-info-wrapper',
        '.frame-main',
        '.bg-parent2',
        '.bg-parent2-content',
        '.facility-inner',
        '.reservation-section',
        '.content-area',
        '.tab-area',
        // 공통 quote
        '.quote-section'
    ];

    function autoAttachRevealAttribute() {
        REVEAL_TARGETS.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (el) {
                if (!el.hasAttribute('data-reveal')) {
                    el.setAttribute('data-reveal', '');
                }
            });
        });
    }

    function initScrollReveal() {
        if (!('IntersectionObserver' in window)) {
            // fallback: 모든 reveal 요소를 즉시 표시
            document.querySelectorAll('[data-reveal]').forEach(function (el) {
                el.classList.add('is-in-view');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in-view');
                    // 한 번만 트리거 (재진입 시 다시 애니메이션 안 함)
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        });

        document.querySelectorAll('[data-reveal]').forEach(function (el) {
            observer.observe(el);
        });
    }

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        autoAttachRevealAttribute();
        // 동적 로드된 헤더/푸터 컨텐츠도 포함되도록 약간 지연
        setTimeout(function () {
            autoAttachRevealAttribute();
            initScrollReveal();
        }, 50);
    });
})();

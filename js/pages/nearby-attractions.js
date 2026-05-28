// Nearby Attractions Page - Hero Slider + Attractions Auto Slider
(function() {
    'use strict';

    // Hero Slider 초기화 (directions.js 패턴 적용)
    window.initNearbyAttractionsHeroSlider = function() {
        var con2 = document.querySelector('.nearby-attractions-page .con-2');
        if (!con2) return;

        var slides = con2.querySelectorAll('.bg-slide');
        if (slides.length === 0) return;

        var currentEl = con2.querySelector('.arrow-num-current');
        var totalEl = con2.querySelector('.arrow-num-total');
        var prevBtn = con2.querySelector('.arrow-prev');
        var nextBtn = con2.querySelector('.arrow-next');

        var current = 0;
        var total = slides.length;
        var AUTO_INTERVAL = 5000;
        var autoTimer = null;

        function pad(n) { return n < 10 ? '0' + n : '' + n; }

        function render() {
            slides.forEach(function(s, i) {
                s.classList.toggle('is-active', i === current);
            });
            if (currentEl) currentEl.textContent = pad(current + 1);
            if (totalEl) totalEl.textContent = pad(total);
        }

        function goTo(idx) {
            current = ((idx % total) + total) % total;
            render();
        }

        function startAuto() {
            stopAuto();
            if (total <= 1) return;
            autoTimer = setInterval(function() {
                goTo(current + 1);
            }, AUTO_INTERVAL);
        }

        function stopAuto() {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        }

        function bindArrow(el, delta) {
            if (!el) return;
            el.style.cursor = 'pointer';
            el.addEventListener('click', function() {
                goTo(current + delta);
                startAuto();
            });
            el.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goTo(current + delta);
                    startAuto();
                }
            });
        }

        bindArrow(prevBtn, -1);
        bindArrow(nextBtn, 1);

        // Hide arrows if only one slide
        if (total === 1) {
            var arrowContainer = con2.querySelector('.arrow-container');
            if (arrowContainer) arrowContainer.style.display = 'none';
        }

        render();
        startAuto();
    };

    // Attractions Auto Slider 초기화 (썸네일 자동 순회)
    window.initAttractionsSlider = function() {
        var container = document.querySelector('[data-nearby-attractions-list]');
        var thumbs = document.querySelectorAll('.nearby-attractions-thumb-wrap');

        if (!container || thumbs.length === 0) return;

        var current = 0;
        var total = thumbs.length;
        var AUTO_INTERVAL = 4000;  // 4초
        var autoTimer = null;

        function goTo(index) {
            current = (index % total + total) % total;

            // 모든 썸네일에서 active 제거
            thumbs.forEach(function(thumb) {
                thumb.classList.remove('is-active');
            });

            // 현재 썸네일에 active 추가
            thumbs[current].classList.add('is-active');

            // 해당 썸네일의 클릭 이벤트 트리거
            thumbs[current].click();
        }

        function startAuto() {
            stopAuto();
            if (total <= 1) return;
            autoTimer = setInterval(function() {
                goTo(current + 1);
            }, AUTO_INTERVAL);
        }

        function stopAuto() {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        }

        // 썸네일 클릭 시 자동 슬라이드 재시작
        thumbs.forEach(function(thumb) {
            thumb.addEventListener('click', function() {
                startAuto();
            });
        });

        // 자동 슬라이더 시작
        startAuto();

        // 전역 함수 노출
        window.attractionSliderNext = function() { goTo(current + 1); };
        window.attractionSliderPrev = function() { goTo(current - 1); };
        window.goToAttraction = goTo;
    };

    // Auto initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof window.initNearbyAttractionsHeroSlider === 'function') {
                window.initNearbyAttractionsHeroSlider();
            }
            if (typeof window.initAttractionsSlider === 'function') {
                window.initAttractionsSlider();
            }
        });
    } else {
        if (typeof window.initNearbyAttractionsHeroSlider === 'function') {
            window.initNearbyAttractionsHeroSlider();
        }
        if (typeof window.initAttractionsSlider === 'function') {
            window.initAttractionsSlider();
        }
    }
})();

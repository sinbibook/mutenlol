// Layout Map Page
(function() {
    'use strict';

    // Hero Slider 초기화 (directions.js 패턴 적용)
    window.initLayoutMapHeroSlider = function() {
        var con2 = document.querySelector('.layout-map-page .con-2');
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

    // Auto initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof window.initLayoutMapHeroSlider === 'function') {
                window.initLayoutMapHeroSlider();
            }
        });
    } else {
        if (typeof window.initLayoutMapHeroSlider === 'function') {
            window.initLayoutMapHeroSlider();
        }
    }
})();

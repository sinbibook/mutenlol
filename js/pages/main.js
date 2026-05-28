// Main page JavaScript
(function() {
    'use strict';

    // ==========================================
    // Main Hero Slideshow (from index.js)
    // ==========================================
    function initMainSlideshow() {
        var slides = document.querySelectorAll('.main-slide');
        if (slides.length === 0) return;

        // 슬라이드 1개: active만 붙이고 화살표 숨김 후 종료
        if (slides.length === 1) {
            slides[0].classList.add('active');
            var arrow = document.querySelector('.main-arrow');
            if (arrow) arrow.style.display = 'none';
            return;
        }

        var bg = document.querySelector('.main-bg');
        var progress = document.querySelector('.title-divider .bar-progress');
        var arrowNums = document.querySelectorAll('.main-arrow .arrow-number');
        var arrowLeft = document.querySelector('.main-arrow .arrow-left');
        var arrowRight = document.querySelector('.main-arrow .arrow-right');
        var current = 0;
        var total = slides.length;

        function padNum(n) {
            return n < 10 ? '0' + n : '' + n;
        }

        function updateNumbers() {
            if (arrowNums.length >= 2) {
                arrowNums[0].textContent = padNum(current + 1);
                arrowNums[1].textContent = padNum(total);
            }
        }

        function isMobileScroll() {
            return bg && bg.scrollWidth > bg.clientWidth;
        }

        function goTo(index) {
            slides[current].classList.remove('active');
            current = (index + total) % total;
            slides[current].classList.add('active');
            updateNumbers();
            if (isMobileScroll()) {
                bg.scrollTo({ left: current * bg.offsetWidth, behavior: 'smooth' });
            }
        }

        function restartProgress() {
            if (!progress) return;
            progress.style.animation = 'none';
            progress.offsetHeight;
            progress.style.animation = '';
        }

        updateNumbers();

        slides[0].classList.add('active');

        if (progress) {
            progress.addEventListener('animationiteration', function() {
                goTo(current + 1);
            });
        }

        if (bg) {
            var scrollTimer;
            bg.addEventListener('scroll', function() {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(function() {
                    var snapped = Math.round(bg.scrollLeft / bg.offsetWidth);
                    if (snapped !== current && snapped >= 0 && snapped < total) {
                        slides[current].classList.remove('active');
                        current = snapped;
                        slides[current].classList.add('active');
                        updateNumbers();
                        restartProgress();
                    }
                }, 150);
            });
        }

        if (arrowLeft) {
            arrowLeft.style.cursor = 'pointer';
            arrowLeft.addEventListener('click', function() {
                goTo(current - 1);
                restartProgress();
            });
        }

        if (arrowRight) {
            arrowRight.style.cursor = 'pointer';
            arrowRight.addEventListener('click', function() {
                goTo(current + 1);
                restartProgress();
            });
        }
    }

    // ==========================================
    // Gallery Interaction (Accordion / Mobile Rolling)
    // ==========================================
    function initGalleryInteraction() {
        var isMobile = window.innerWidth <= 768;

        document.querySelectorAll('.img-grid').forEach(function(grid) {
            var items = grid.querySelectorAll('.img-item');

            if (isMobile) {
                // 모바일: 자동 롤링 슬라이드
                var current = 0;
                var total = items.length;
                var itemWidth = grid.offsetWidth;

                setInterval(function() {
                    current = (current + 1) % total;
                    grid.scrollTo({
                        left: current * itemWidth,
                        behavior: 'smooth'
                    });
                }, 3000);
            } else {
                // 데스크톱: hover + click 아코디언 (항상 1개 active 유지)
                function setActive(target) {
                    items.forEach(function(i) { i.classList.remove('is-active'); });
                    target.classList.add('is-active');
                }

                items.forEach(function(item) {
                    item.addEventListener('mouseenter', function() {
                        setActive(item);
                    });
                    item.addEventListener('click', function() {
                        setActive(item);
                    });
                });
            }
        });
    }

    // ==========================================
    // con-1 Hero Slider (.bg-slides crossfade + auto-rotate)
    // ==========================================
    function initCon1HeroSlider() {
        var con1 = document.querySelector('.con-1');
        if (!con1) return;
        var slides = con1.querySelectorAll('.bg-slide');
        if (slides.length === 0) return;

        var currentEl = con1.querySelector('.arrow-num-current');
        var totalEl = con1.querySelector('.arrow-num-total');
        var prevBtn = con1.querySelector('.arrow-prev');
        var nextBtn = con1.querySelector('.arrow-next');

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

        render();
        startAuto();
    }

    // 매퍼에서 재초기화 시 사용
    window.initHeroSlider = initMainSlideshow;
    window.initGallery = initGalleryInteraction;
    window.initCon1HeroSlider = initCon1HeroSlider;

    // DOM ready event
    document.addEventListener('DOMContentLoaded', function() {

        // 메인 슬라이드쇼 초기화
        initMainSlideshow();

        // 갤러리 인터랙션 초기화
        initGalleryInteraction();

        // con-1 HERO 슬라이더 초기화
        initCon1HeroSlider();

    });
})();
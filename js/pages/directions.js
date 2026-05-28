// Directions page JavaScript
(function() {
    'use strict';

    // ==========================================
    // Main Hero Slideshow (index.html과 동일)
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
    // 수동 스크롤 애니메이션 함수
    // ==========================================
    function setupManualScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('hero-content')) {
                        entry.target.classList.add('animate-fade-in');
                    } else if (entry.target.classList.contains('logo-line-container')) {
                        entry.target.classList.add('animate-slide-up');
                    } else if (entry.target.classList.contains('map-section')) {
                        entry.target.classList.add('animate-fade-in');
                    } else if (entry.target.classList.contains('location-details')) {
                        entry.target.classList.add('animate-slide-left');
                    } else if (entry.target.classList.contains('location-note-section')) {
                        entry.target.classList.add('animate-slide-up');
                    } else {
                        entry.target.classList.add('animate-fade-in');
                    }

                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        const animateElements = document.querySelectorAll('.animate-element, .animate-hero, .hero-content, .logo-line-container');

        animateElements.forEach(element => {
            observer.observe(element);
        });

        return observer;
    }

    // ==========================================
    // con-2 Hero Slider (.bg-slides crossfade + auto-rotate)
    // main.html의 initCon1HeroSlider와 동일 로직
    // ==========================================
    function initCon2HeroSlider() {
        var con2 = document.querySelector('.direction .con-2');
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

    // DOM ready event
    document.addEventListener('DOMContentLoaded', function() {

        // 메인 슬라이드쇼 초기화
        initMainSlideshow();

        // con-2 hero 슬라이더 초기화
        initCon2HeroSlider();

        // DirectionsMapper가 데이터를 로드한 후에 애니메이션 초기화
        setTimeout(function() {

            // Full-banner fade 애니메이션
            const fullBannerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            const fullBanner = document.querySelector('.full-banner');
            if (fullBanner) {
                fullBannerObserver.observe(fullBanner);
            }

            // 수동으로 스크롤 애니메이션 설정
            setupManualScrollAnimations();

            // Handle typing animation
            const typingText = document.querySelector('.typing-text');
            if (typingText) {
                setTimeout(() => {
                    typingText.classList.add('typed');
                }, 2700);
            }

            // Location note section 애니메이션
            const locationNoteObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            const locationNote = document.querySelector('.location-note-section');
            if (locationNote) {
                locationNoteObserver.observe(locationNote);
            }

        }, 1000);
    });

    // 매퍼에서 재초기화 시 사용
    window.initHeroSlider = initMainSlideshow;
    window.initCon2HeroSlider = initCon2HeroSlider;

    // Global function for reinitializing scroll animations (called by DirectionsMapper)
    window.setupScrollAnimations = function() {
        setupManualScrollAnimations();
    };

    // Global function for initializing location notes (called by DirectionsMapper)
    window.initializeLocationNotes = function() {
    };
})();

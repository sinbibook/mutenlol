// Room 페이지 JavaScript
(function() {
    'use strict';

    // ==========================================
    // Main Hero Slideshow
    // ==========================================
    function initMainSlideshow() {
        var slides = document.querySelectorAll('.main-slide');
        if (slides.length === 0) return;

        // 슬라이드 1개: active만 붙이고 화살표 숨김
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
    // Room Exterior Slider (이미지 + 탭 연동)
    // ==========================================
    function initRoomSlider() {
        var slides = document.querySelectorAll('.img-frame .room-slide');
        var tabs = document.querySelectorAll('.slider-tabs .tab-item');
        var progress = document.querySelector('.section-room .bar-progress');
        var prevBtn = document.querySelector('.room-prev');
        var nextBtn = document.querySelector('.room-next');

        if (slides.length === 0) return;

        // 슬라이드 1개: 화살표/프로그레스 숨김
        if (slides.length === 1) {
            slides[0].classList.add('active');
            if (tabs[0]) tabs[0].classList.add('active');
            var specialBar = document.querySelector('.special-bar');
            if (specialBar) specialBar.style.display = 'none';
            return;
        }

        var current = 0;
        var total = slides.length;

        function goTo(index) {
            slides[current].classList.remove('active');
            if (tabs[current]) tabs[current].classList.remove('active');
            current = (index + total) % total;
            slides[current].classList.add('active');
            if (tabs[current]) tabs[current].classList.add('active');
        }

        function restartProgress() {
            if (!progress) return;
            progress.style.animation = 'none';
            progress.offsetHeight;
            progress.style.animation = '';
        }

        if (progress) {
            progress.addEventListener('animationiteration', function() {
                goTo(current + 1);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                goTo(current - 1);
                restartProgress();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                goTo(current + 1);
                restartProgress();
            });
        }

        tabs.forEach(function(tab, index) {
            tab.addEventListener('click', function() {
                goTo(index);
                restartProgress();
            });
        });
    }

    // ==========================================
    // Room Preview Carousel (무한 루프)
    // ==========================================
    function initRoomPreviewCarousel() {
        var track = document.querySelector('.room-scroll-track');
        if (!track) return;

        var prevBtn = document.querySelector('.nav-btn.prev');
        var nextBtn = document.querySelector('.nav-btn.next');

        var speed = 60; // px per second
        var position = 0;
        var halfWidth = 0;
        var cardWidth = 0;
        var isManualMoving = false;
        var isRolling = false;
        var animFrameId = null;
        var lastTime = null;

        function shouldRoll() {
            var roomCount = parseInt(track.dataset.roomCount || '1', 10);
            var isSmallScreen = window.innerWidth <= 1000;
            // 1000px 이하: 2개 이상일 때 롤링, PC: 4개 이상일 때 롤링
            if (isSmallScreen) {
                return roomCount >= 2;
            }
            return roomCount >= 4;
        }

        function measure() {
            halfWidth = track.scrollWidth / 2;
            var firstCard = track.querySelector('.room-card');
            if (firstCard) {
                cardWidth = firstCard.offsetWidth + 40;
            }
        }

        measure();

        function tick(time) {
            if (!lastTime) lastTime = time;
            var delta = (time - lastTime) / 1000;
            lastTime = time;
            if (delta > 0.1) delta = 0.016; // 탭 비활성 복귀 시 점프 방지
            if (!isManualMoving) {
                position -= speed * delta;
                if (position <= -halfWidth) {
                    position += halfWidth;
                }
                track.style.transform = 'translateX(' + position + 'px)';
            }
            animFrameId = requestAnimationFrame(tick);
        }

        function hideDuplicateCards() {
            var roomCount = parseInt(track.dataset.roomCount || '1', 10);
            var cards = track.querySelectorAll('.room-card');
            for (var i = 0; i < cards.length; i++) {
                cards[i].style.display = i >= roomCount ? 'none' : '';
            }
        }

        function showAllCards() {
            var cards = track.querySelectorAll('.room-card');
            for (var i = 0; i < cards.length; i++) {
                cards[i].style.display = '';
            }
        }

        function startRolling() {
            if (isRolling) return;
            isRolling = true;
            track.closest('.room-grid').classList.remove('no-rolling');
            showAllCards();
            track.style.transform = '';
            position = 0;
            lastTime = null;
            measure();
            animFrameId = requestAnimationFrame(tick);
        }

        function stopRolling() {
            if (!isRolling) return;
            isRolling = false;
            if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
            }
            position = 0;
            track.style.transform = '';
            track.closest('.room-grid').classList.add('no-rolling');
            hideDuplicateCards();
        }

        function updateRollingState() {
            measure();
            if (shouldRoll()) {
                startRolling();
            } else {
                if (isRolling) {
                    stopRolling();
                } else {
                    track.closest('.room-grid').classList.add('no-rolling');
                    hideDuplicateCards();
                }
            }
        }

        updateRollingState();

        function manualMove(direction) {
            if (!isRolling) return;
            isManualMoving = true;
            var target = position + (direction * cardWidth);
            var start = position;
            var distance = target - start;
            var duration = 400;
            var startTime = null;

            function animate(time) {
                if (!startTime) startTime = time;
                var elapsed = time - startTime;
                var progress = Math.min(elapsed / duration, 1);
                /* cubic-bezier(0.25, 1, 0.5, 1) JS 근사 — ease-out-quart (1 - (1-x)^4) */
                var t = 1 - progress;
                var ease = 1 - t * t * t * t;

                position = start + distance * ease;

                if (position <= -halfWidth) {
                    position += halfWidth;
                } else if (position > 0) {
                    position -= halfWidth;
                }

                track.style.transform = 'translateX(' + position + 'px)';

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    isManualMoving = false;
                }
            }

            requestAnimationFrame(animate);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (!isManualMoving) manualMove(1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (!isManualMoving) manualMove(-1);
            });
        }

        window.addEventListener('resize', function() {
            updateRollingState();
        });
    }

    // ==========================================
    // Info Accordion (모바일 전용)
    // ==========================================
    function initInfoAccordion() {
        if (window.innerWidth > 768) return;

        var blocks = document.querySelectorAll('.section-info .info-block');
        blocks.forEach(function(block) {
            block.classList.add('active');
        });

        var titles = document.querySelectorAll('.section-info .block-title');
        titles.forEach(function(title) {
            title.addEventListener('click', function() {
                var block = this.closest('.info-block');
                block.classList.toggle('active');
            });
        });
    }

    // ==========================================
    // Room Info 썸네일 ↔ Feature 이미지 슬라이더
    // - .room-info-thumb 클릭 시 .room-info-feature-img src 교체
    // - 5초 자동 롤링 (수동 클릭 시 타이머 리셋)
    // ==========================================
    function initRoomInfoFeatureSlider() {
        var thumbs = document.querySelectorAll('.room-info-thumb');
        var wraps = document.querySelectorAll('.room-info-thumb-wrap');
        var feature = document.querySelector('.room-info-feature-img');
        if (thumbs.length === 0 || !feature) return;

        var current = 0;
        var AUTO_INTERVAL = 3000;     /* 3초 자동 롤링 */
        var FADE_MS = 250;
        var autoTimer = null;

        function render(idx) {
            current = ((idx % thumbs.length) + thumbs.length) % thumbs.length;
            var nextSrc = thumbs[current].getAttribute('src');

            // is-active는 wrapper에 적용 (검정 outline은 wrapper에 그려짐)
            wraps.forEach(function (w, i) {
                w.classList.toggle('is-active', i === current);
            });

            feature.classList.add('is-fading');
            setTimeout(function () {
                feature.setAttribute('src', nextSrc);
                requestAnimationFrame(function () {
                    feature.classList.remove('is-fading');
                });
            }, FADE_MS);
        }

        function startAuto() {
            stopAuto();
            if (thumbs.length <= 1) return;
            autoTimer = setInterval(function () {
                render(current + 1);
            }, AUTO_INTERVAL);
        }
        function stopAuto() {
            if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        }

        // 클릭은 wrapper에 (img/wrap 어디 클릭해도 동작)
        wraps.forEach(function (wrap, i) {
            wrap.addEventListener('click', function () {
                render(i);
                startAuto();
            });
        });

        render(0);
        startAuto();
    }

    // 매퍼에서 재초기화 시 사용
    window.initHeroSlider = initMainSlideshow;
    window.initRoomSlider = initRoomSlider;
    window.initRoomPreviewCarousel = initRoomPreviewCarousel;
    window.initRoomInfoFeatureSlider = initRoomInfoFeatureSlider;

    // DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        initMainSlideshow();
        initRoomSlider();
        initRoomPreviewCarousel();
        initInfoAccordion();
        initRoomInfoFeatureSlider();
    });
})();

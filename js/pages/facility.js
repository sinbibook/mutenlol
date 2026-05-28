// Main Hero Slideshow
function initMainSlideshow() {
    var slides = document.querySelectorAll('.main-slide');
    if (!slides.length) return;

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

// Section-Con1 Slider
function initCon1Slider() {
    var imgSlides = document.querySelectorAll('.main-img-slide');
    var textSlides = document.querySelectorAll('.slider-text-slide');
    if (!imgSlides.length) return;

    var prevBtn = document.querySelector('.slider-btn-prev');
    var nextBtn = document.querySelector('.slider-btn-next');
    var current = 0;
    var total = imgSlides.length;

    function goTo(index) {
        imgSlides[current].classList.remove('active');
        if (textSlides[current]) textSlides[current].classList.remove('active');
        current = (index + total) % total;
        imgSlides[current].classList.add('active');
        if (textSlides[current]) textSlides[current].classList.add('active');
    }

    var autoTimer = setInterval(function() {
        goTo(current + 1);
    }, 4000);

    function resetTimer() {
        clearInterval(autoTimer);
        autoTimer = setInterval(function() {
            goTo(current + 1);
        }, 4000);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            goTo(current - 1);
            resetTimer();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            goTo(current + 1);
            resetTimer();
        });
    }
}

// Section-Con2 롤링 갤러리 (RAF 기반)
function initRollingGallery() {
    var track = document.querySelector('.rolling-track');
    if (!track) return;

    if (window._rollingRafId) {
        cancelAnimationFrame(window._rollingRafId);
        window._rollingRafId = null;
    }

    track.style.animation = 'none';
    track.style.transform = 'translateX(0)';

    var setEl = track.querySelector('.rolling-set');
    var setWidth = setEl ? setEl.offsetWidth : 2440;

    var PX_PER_SEC_DESKTOP = 50;
    var PX_PER_SEC_MOBILE  = 80;

    var position  = 0;
    var dragging  = false;
    var dragStartX = 0;
    var dragStartPos = 0;
    var lastTime  = null;
    var DRAG_THRESHOLD = 8;
    var dragThresholdPassed = false;

    function getPxPerSec() {
        return window.innerWidth <= 768 ? PX_PER_SEC_MOBILE : PX_PER_SEC_DESKTOP;
    }

    function tick(ts) {
        if (lastTime !== null) {
            var delta = Math.min((ts - lastTime) / 1000, 0.1);
            if (!dragging) {
                position += getPxPerSec() * delta;
                position = position % setWidth;
                track.style.transform = 'translateX(-' + Math.round(position) + 'px)';
            }
        }
        lastTime = ts;
        window._rollingRafId = requestAnimationFrame(tick);
    }

    window._rollingRafId = requestAnimationFrame(tick);

    function onDragStart(x) {
        dragStartX = x;
        dragStartPos = position;
        dragThresholdPassed = false;
    }

    function onDragMove(x) {
        var diff = x - dragStartX;
        if (!dragThresholdPassed) {
            if (Math.abs(diff) < DRAG_THRESHOLD) return;
            dragThresholdPassed = true;
            dragging = true;
        }
        position = dragStartPos - diff;
        position = ((position % setWidth) + setWidth) % setWidth;
        track.style.transform = 'translateX(-' + Math.round(position) + 'px)';
    }

    function onDragEnd() {
        dragging = false;
        dragThresholdPassed = false;
        lastTime = null;
    }

    track.addEventListener('touchstart', function(e) {
        onDragStart(e.touches[0].clientX);
    }, { passive: true });

    track.addEventListener('touchmove', function(e) {
        onDragMove(e.touches[0].clientX);
    }, { passive: true });

    track.addEventListener('touchend', onDragEnd);
    track.addEventListener('touchcancel', onDragEnd);

    track.addEventListener('mousedown', function(e) {
        e.preventDefault();
        onDragStart(e.clientX);
        track.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', function(e) {
        if (!dragThresholdPassed && !dragging) return;
        onDragMove(e.clientX);
    });

    window.addEventListener('mouseup', function() {
        if (!dragging && !dragThresholdPassed) return;
        track.style.cursor = 'grab';
        onDragEnd();
    });

    track.style.cursor = 'grab';
}

// Special Slideshow (Content-3)
function initSpecialSlideshow() {
    var content3 = document.querySelector('.content-3');
    if (!content3) return;

    var slides = content3.querySelectorAll('.meditation-image .facility-slide');
    var total = slides.length;
    if (total === 0) return;

    var current = 0;
    var progress = content3.querySelector('.bar-progress');
    var barBtns = content3.querySelectorAll('.bar-controls button');

    function showSlide(index) {
        var containers = ['.meditation-image', '.meditation-info', '.special-right-image'];
        containers.forEach(function(sel) {
            content3.querySelectorAll(sel + ' .facility-slide').forEach(function(el, i) {
                el.classList.toggle('active', i === index);
            });
        });
    }

    showSlide(0);

    if (progress) {
        progress.addEventListener('animationiteration', function() {
            current = (current + 1) % total;
            showSlide(current);
        });
    }

    function restartProgress() {
        if (!progress) return;
        progress.style.animation = 'none';
        progress.offsetHeight;
        progress.style.animation = '';
    }

    if (barBtns.length >= 2) {
        barBtns[0].addEventListener('click', function() {
            current = (current - 1 + total) % total;
            showSlide(current);
            restartProgress();
        });
        barBtns[1].addEventListener('click', function() {
            current = (current + 1) % total;
            showSlide(current);
            restartProgress();
        });
    }
}

// Scroll Animations (IntersectionObserver)
function initFacilityScrollAnimations() {
    var animElements = document.querySelectorAll(
        '.anim-fade-up, .anim-fade-right, .anim-scale-in'
    );
    if (!animElements.length) return;

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });

    animElements.forEach(function(el) {
        observer.observe(el);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initMainSlideshow();
    initCon1Slider();
    initRollingGallery();
    initSpecialSlideshow();
    initFacilityScrollAnimations();
});

// Global expose for mapper reinit
window.initFacilityMainSlider = initMainSlideshow;
window.initFacilityCon1Slider = initCon1Slider;
window.initFacilityRollingTouch = initRollingGallery;
window.initSpecialSlideshow = initSpecialSlideshow;
window.initFacilityScrollAnimations = initFacilityScrollAnimations;

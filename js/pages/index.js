/**
 * Index Page Script (IIFE 제거 — top-level 함수 + DOMContentLoaded)
 * - Prologue 썸네일 슬라이드쇼 (index 전용)
 * - Special 섹션 이미지 롤링 (index + facility 공용)
 * - Slider 섹션 배경 롤링 (index 전용)
 *
 * 페이지에 해당 DOM이 있을 때만 각 모듈 실행 → 다른 JS와 충돌 없음
 */


/* ====================================================================
   1) Prologue 썸네일 슬라이드쇼 (index.html 전용)
   ==================================================================== */
function initPrologueSection() {
    var mainImages = document.querySelectorAll('.prologue-main-img');
    var thumbs = document.querySelectorAll('.prologue-thumbs .thumb-img');
    if (mainImages.length === 0 || thumbs.length === 0) return;

    var current = 0;
    var timer;

    function goTo(index) {
        mainImages[current].classList.remove('active');
        thumbs[current].classList.remove('active');
        current = index % mainImages.length;
        mainImages[current].classList.add('active');
        thumbs[current].classList.add('active');
    }

    function startAuto() {
        clearInterval(timer);
        timer = setInterval(function () { goTo(current + 1); }, 4000);
    }

    thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
            goTo(Number(this.dataset.index));
            startAuto();
        });
    });

    startAuto();
}

/* ====================================================================
   2) Special 섹션 이미지 롤링 (index.html + facility.html 공용)
   ==================================================================== */
function initSpecialSection() {
    var specialRoot = document.querySelector('.special-image');
    if (!specialRoot) return;

    var cardImgs = document.querySelectorAll('.specials-card-img-wrap .specials-card-img');
    var bgSlides = document.querySelectorAll('.special-image .special-image-slide');
    var titleEl = document.querySelector('.specials-card-title');
    var descEl = document.querySelector('.specials-card-desc');
    var linkEl = document.querySelector('.specials-card-body .view-more-link');
    if (cardImgs.length === 0 && bgSlides.length === 0) return;

    var titlesArr = (titleEl && titleEl.dataset.titles)
        ? titleEl.dataset.titles.split('|')
        : [];
    var descsArr = (descEl && descEl.dataset.descs)
        ? descEl.dataset.descs.split('@@').map(function (s) { return s.split('||'); })
        : [];
    var linksArr = (linkEl && linkEl.dataset.links)
        ? linkEl.dataset.links.split('|')
        : [];

    var dotPrev = document.querySelector('.special-image .slide-dots .dot-icon:not(.dot-icon-flip)');
    var dotNext = document.querySelector('.special-image .slide-dots .dot-icon.dot-icon-flip');
    var barFill = document.querySelector('.special-image .bar-icon .bar-fill');

    var total = Math.max(cardImgs.length, bgSlides.length, titlesArr.length, 1);
    var SLIDE_INTERVAL = 4000;
    var idx = 0;
    var timer;

    function updateText(i) {
        try {
            if (titleEl && titlesArr[i] != null) {
                titleEl.classList.add('is-fading');
                setTimeout(function () {
                    titleEl.innerHTML = titlesArr[i];
                    titleEl.classList.remove('is-fading');
                }, 250);
            }
            if (descEl && descsArr[i] && descsArr[i].length) {
                descEl.classList.add('is-fading');
                setTimeout(function () {
                    descEl.innerHTML = descsArr[i].map(function (line) {
                        return '<p>' + line + '</p>';
                    }).join('');
                    descEl.classList.remove('is-fading');
                }, 250);
            }
            if (linkEl && linksArr[i]) {
                linkEl.setAttribute('href', linksArr[i]);
            }
        } catch (e) { /* noop */ }
    }

    function render() {
        cardImgs.forEach(function (img, j) {
            img.classList.toggle('active', j === idx % cardImgs.length);
        });
        bgSlides.forEach(function (s, j) {
            s.classList.toggle('active', j === idx % bgSlides.length);
        });
        updateText(idx % total);
    }

    function restartBar() {
        if (!barFill) return;
        barFill.style.animation = 'none';
        void barFill.offsetWidth;
        barFill.style.animation = '';
    }

    function go(delta) {
        idx = (idx + delta + total) % total;
        render();
        restartBar();
    }

    function startAuto() {
        clearInterval(timer);
        timer = setInterval(function () { go(1); }, SLIDE_INTERVAL);
    }

    if (dotPrev) {
        dotPrev.style.cursor = 'pointer';
        dotPrev.addEventListener('click', function () { go(-1); startAuto(); });
    }
    if (dotNext) {
        dotNext.style.cursor = 'pointer';
        dotNext.addEventListener('click', function () { go(1); startAuto(); });
    }

    render();
    restartBar();
    startAuto();
}

/* ====================================================================
   3) Slider 섹션 배경 롤링 (index.html 전용)
   ==================================================================== */
function initSliderSection() {
    var slides = document.querySelectorAll('.slider-bg-wrap .slider-bg');
    if (slides.length === 0) return;

    var arrowPrev = document.querySelector('.slider-arrows .arrow-line:not(.arrow-line-flip)');
    var arrowNext = document.querySelector('.slider-arrows .arrow-line.arrow-line-flip');
    var nums = document.querySelectorAll('.slider-arrows .arrow-num');
    var curNum = nums[0] || null;
    var totalNum = nums[1] || null;

    var idx = 0;
    var timer;

    function pad2(n) { return String(n).padStart(2, '0'); }

    function render() {
        slides.forEach(function (s, i) { s.classList.toggle('active', i === idx); });
        if (curNum) curNum.textContent = pad2(idx + 1);
    }

    function go(delta) {
        idx = (idx + delta + slides.length) % slides.length;
        render();
    }

    function startAuto() {
        clearInterval(timer);
        timer = setInterval(function () { go(1); }, 5000);
    }

    if (totalNum) totalNum.textContent = pad2(slides.length);
    if (arrowPrev) {
        arrowPrev.style.cursor = 'pointer';
        arrowPrev.addEventListener('click', function () { go(-1); startAuto(); });
    }
    if (arrowNext) {
        arrowNext.style.cursor = 'pointer';
        arrowNext.addEventListener('click', function () { go(1); startAuto(); });
    }

    render();
    startAuto();
}

/* ====================================================================
   DOM 준비 시 모든 모듈 일괄 초기화
   ==================================================================== */
function initAllIndexModules() {
    initPrologueSection();
    initSpecialSection();
    initSliderSection();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllIndexModules);
} else {
    initAllIndexModules();
}

// 외부(데이터 매퍼)에서 재호출 가능
window.initSpecialSection = initSpecialSection;
window.initPrologueSection = initPrologueSection;
window.initSliderSection = initSliderSection;

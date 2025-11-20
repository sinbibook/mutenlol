// Gallery Slide Functionality - One by One Movement
let currentSlide = 0;
const gallerySlider = document.querySelector('.gallery-slider');
let originalCards = [];
let allCards = [];
let autoSlideInterval;
const slideDuration = 3000; // 3초마다 슬라이드

// 무한 슬라이딩을 위한 카드 복사
window.setupInfiniteSlider = function setupInfiniteSlider() {
    const cards = document.querySelectorAll('.gallery-item');

    // 원본 카드들 저장
    originalCards = Array.from(cards);

    // 앞뒤로 충분한 카드 복사
    const copyCount = 2;

    // 뒤쪽에 복사본 추가
    for (let i = 0; i < copyCount; i++) {
        originalCards.forEach(card => {
            const clonedCard = card.cloneNode(true);
            clonedCard.classList.add('swiper-slide-duplicate');
            gallerySlider.appendChild(clonedCard);
        });
    }

    // 앞쪽에 복사본 추가
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < copyCount; i++) {
        [...originalCards].reverse().forEach(card => {
            const clonedCard = card.cloneNode(true);
            clonedCard.classList.add('swiper-slide-duplicate');
            fragment.insertBefore(clonedCard, fragment.firstChild);
        });
    }
    gallerySlider.insertBefore(fragment, gallerySlider.firstChild);

    // 모든 카드 업데이트
    allCards = Array.from(gallerySlider.querySelectorAll('.gallery-item'));

    // 시작 위치를 원본 첫 번째 카드로 설정
    const startOffset = copyCount * originalCards.length;
    currentSlide = startOffset;

    // 처음에는 변환 없이 시작
    updateSlidePosition(false);
}

// 슬라이드 위치 업데이트
function updateSlidePosition(withTransition = true) {
    if (!gallerySlider || allCards.length === 0) return;

    let translateX = 0;
    // 모바일에서는 gap이 18px이므로 조정
    const gap = window.innerWidth <= 768 ? 18 : 30;
    // 모바일에서 중앙 정렬을 위한 초기 오프셋
    const mobileOffset = window.innerWidth <= 768 ? 3 : 0;

    for (let i = 0; i < currentSlide; i++) {
        translateX -= (allCards[i].offsetWidth + gap); // 카드 너비 + gap
    }

    translateX += mobileOffset;

    // 트랜지션 설정
    if (withTransition) {
        gallerySlider.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
        gallerySlider.style.transition = 'none';
    }

    gallerySlider.style.transform = `translateX(${translateX}px)`;
}

// 다음 슬라이드로 이동
function nextSlide() {
    if (!gallerySlider || allCards.length === 0) return;

    currentSlide++;
    updateSlidePosition(true);

    // 무한 루프 체크 - 마지막 복사본에 도달했을 때 처음으로 리셋
    const maxSlides = allCards.length - originalCards.length;
    if (currentSlide >= maxSlides) {
        setTimeout(() => {
            currentSlide = originalCards.length; // 원본 첫 번째 카드 위치로
            updateSlidePosition(false); // 트랜지션 없이 즉시 이동
        }, 1200); // 트랜지션이 끝난 후 리셋
    }
}

// 자동 슬라이드 시작
window.startAutoSlide = function startAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
    autoSlideInterval = setInterval(nextSlide, slideDuration);
}

// 자동 슬라이드 중지
function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

// 마우스 호버시 일시정지 기능 제거
function setupHoverPause() {
    // 호버 일시정지 기능 비활성화
    // 슬라이더가 계속 자동으로 돌아감
}

// 드래그 및 스와이프 기능
window.setupDragAndSwipe = function setupDragAndSwipe() {
    if (!gallerySlider) return;

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let startPosition = 0;
    let dragThreshold = 50; // 최소 드래그 거리

    // 마우스 이벤트
    gallerySlider.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // 터치 이벤트
    gallerySlider.addEventListener('touchstart', handleStart, { passive: true });
    gallerySlider.addEventListener('touchmove', handleMove, { passive: false });
    gallerySlider.addEventListener('touchend', handleEnd);

    function handleStart(e) {
        isDragging = true;
        stopAutoSlide(); // 드래그 중 자동 슬라이드 중지

        if (e.type === 'mousedown') {
            startX = e.clientX;
        } else {
            startX = e.touches[0].clientX;
        }

        gallerySlider.style.transition = 'none'; // 드래그 중 트랜지션 비활성화

        // 현재 위치 저장
        const transform = getComputedStyle(gallerySlider).transform;
        if (transform !== 'none') {
            const matrix = transform.split('(')[1].split(')')[0].split(',');
            startPosition = parseInt(matrix[4]) || 0;
        } else {
            startPosition = 0;
        }
    }

    function handleMove(e) {
        if (!isDragging) return;

        e.preventDefault(); // 터치 스크롤 방지

        if (e.type === 'mousemove') {
            currentX = e.clientX;
        } else {
            currentX = e.touches[0].clientX;
        }

        const deltaX = currentX - startX;
        const newPosition = startPosition + deltaX;

        gallerySlider.style.transform = `translateX(${newPosition}px)`;
    }

    function handleEnd(e) {
        if (!isDragging) return;

        isDragging = false;
        const deltaX = currentX - startX;

        // 트랜지션 다시 활성화
        gallerySlider.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';

        if (Math.abs(deltaX) > dragThreshold) {
            if (deltaX > 0) {
                // 오른쪽으로 드래그 - 이전 슬라이드
                prevSlide();
            } else {
                // 왼쪽으로 드래그 - 다음 슬라이드
                nextSlide();
            }
        } else {
            // 드래그 거리가 충분하지 않으면 원래 위치로 복원
            updateSlidePosition(true);
        }

        // 자동 슬라이드 재시작
        startAutoSlide();
    }

    // 드래그 중 선택 방지
    gallerySlider.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });
}

// 이전 슬라이드로 이동
function prevSlide() {
    if (!gallerySlider || allCards.length === 0) return;

    currentSlide--;
    if (currentSlide < 0) {
        currentSlide = allCards.length - originalCards.length - 1; // 마지막 복사본으로
        updateSlidePosition(false);
        setTimeout(() => {
            currentSlide = originalCards.length * 2 - 1; // 원본 마지막 카드로
            updateSlidePosition(false);
        }, 50);
    } else {
        updateSlidePosition(true);
    }
}

// Initialize gallery
document.addEventListener('DOMContentLoaded', function() {
    if (gallerySlider && document.querySelectorAll('.gallery-item').length > 0) {
        // 무한 슬라이더 설정
        setupInfiniteSlider();

        // 호버 일시정지 기능
        setupHoverPause();

        // 드래그 및 스와이프 기능
        setupDragAndSwipe();

        // 자동 슬라이드는 스크롤 애니메이션에서 시작
    }

    // 스크롤 애니메이션 설정
    setupScrollAnimations();

    // 히어로 슬라이더 초기화
    initHeroSlider();
});

// 스크롤 애니메이션 설정
function setupScrollAnimations() {
    const heroElements = document.querySelectorAll('.hero-title, .hero-description, .hero-slider-container');
    const scrollElements = document.querySelectorAll('.essence-title, .essence-description, .signature-container, .signature-main-image, .signature-title, .signature-description, .gallery-title, .gallery-description, .closing-title, .closing-description');
    const gallerySection = document.querySelector('.gallery-section');
    let gallerySlideStarted = false;

    function checkScroll() {
        // 히어로 요소들 애니메이션 체크
        heroElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 100;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });

        scrollElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');

                // signature-container에 접힘 애니메이션 추가
                if (element.classList.contains('signature-container')) {
                    setTimeout(() => {
                        element.classList.add('fold-animate');
                    }, 800); // signature animation 이후 실행
                }
            }
        });

        // 갤러리 섹션이 화면에 보이면 자동 슬라이드 시작
        if (gallerySection && !gallerySlideStarted) {
            const galleryTop = gallerySection.getBoundingClientRect().top;
            if (galleryTop < window.innerHeight - 100) {
                startAutoSlide();
                gallerySlideStarted = true;
            }
        }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // 초기 실행
}

// Override the existing toggleSideHeader function to add overlay functionality
(function() {
    let overlay = null;
    let originalToggleSideHeader = null;
    let savedScrollPosition = 0;

    function createOverlay() {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'side-header-overlay';
            document.body.appendChild(overlay);

            // 오버레이 클릭 기능 제거 - x 버튼으로만 컨트롤
        }
    }

    function closeSideHeader() {
        const sideHeader = document.getElementById('side-header');
        const hamburgerButton = document.getElementById('hamburger-button');

        if (sideHeader) {
            sideHeader.classList.remove('expanded');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }
        if (hamburgerButton) {
            hamburgerButton.classList.remove('active');
        }

        // 스크롤 복원 - 더 부드럽게
        // 먼저 스크롤을 복원하고 나서 스타일 제거
        if (savedScrollPosition > 0) {
            document.body.style.position = '';
            document.body.style.top = '';

            // 한 프레임 기다린 후 스크롤 설정
            requestAnimationFrame(() => {
                window.scrollTo(0, savedScrollPosition);
                savedScrollPosition = 0; // 초기화

                // 그 다음 프레임에 나머지 스타일 제거
                requestAnimationFrame(() => {
                    document.body.style.overflow = '';
                    document.body.style.width = '';
                });
            });
        } else {
            // 스크롤이 없다면 바로 스타일 제거
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
        }
    }

    function enhancedToggleSideHeader() {
        const sideHeader = document.getElementById('side-header');
        const hamburgerButton = document.getElementById('hamburger-button');

        if (sideHeader && hamburgerButton) {
            // Create overlay if it doesn't exist
            createOverlay();

            const isCurrentlyExpanded = sideHeader.classList.contains('expanded');

            if (!isCurrentlyExpanded) {
                // 현재 스크롤 위치 저장
                savedScrollPosition = window.pageYOffset;

                // 사이드 헤더 열기
                sideHeader.classList.add('expanded');
                overlay.classList.add('active');
                hamburgerButton.classList.add('active');

                // body 스크롤 막기
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.top = `-${savedScrollPosition}px`;
                document.body.style.width = '100%';
            } else {
                // 사이드 헤더 닫기
                closeSideHeader();
            }
        }
    }

    // Wait for window.toggleSideHeader to be defined and then override it
    function overrideToggleFunction() {
        if (typeof window.toggleSideHeader === 'function') {
            originalToggleSideHeader = window.toggleSideHeader;
            window.toggleSideHeader = enhancedToggleSideHeader;

            // 외부 클릭 기능도 제거 - 햄버거 버튼으로만 컨트롤

        } else {
            setTimeout(overrideToggleFunction, 100);
        }
    }

    // Start checking for the function
    setTimeout(overrideToggleFunction, 100);
})();

// Hero Slider Functionality
window.initHeroSlider = function initHeroSlider() {
    const heroSlider = document.querySelector('.hero-slider');
    const heroSlides = document.querySelectorAll('.hero-slide');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');

    if (!heroSlider || heroSlides.length === 0) return;

    let currentHeroSlide = 0;
    let heroAutoSlideInterval;

    // 다음 슬라이드로 이동
    function nextHeroSlide() {
        heroSlides[currentHeroSlide].classList.remove('active');
        currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
        heroSlides[currentHeroSlide].classList.add('active');
    }

    // 이전 슬라이드로 이동
    function prevHeroSlide() {
        heroSlides[currentHeroSlide].classList.remove('active');
        currentHeroSlide = (currentHeroSlide - 1 + heroSlides.length) % heroSlides.length;
        heroSlides[currentHeroSlide].classList.add('active');
    }

    // 자동 슬라이드 시작
    function startHeroAutoSlide() {
        heroAutoSlideInterval = setInterval(nextHeroSlide, 4000); // 4초마다
    }

    // 자동 슬라이드 중지
    function stopHeroAutoSlide() {
        if (heroAutoSlideInterval) {
            clearInterval(heroAutoSlideInterval);
            heroAutoSlideInterval = null;
        }
    }

    // 버튼 이벤트 리스너
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopHeroAutoSlide();
            nextHeroSlide();
            startHeroAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopHeroAutoSlide();
            prevHeroSlide();
            startHeroAutoSlide();
        });
    }

    // 마우스 호버시 일시정지
    heroSlider.addEventListener('mouseenter', stopHeroAutoSlide);
    heroSlider.addEventListener('mouseleave', startHeroAutoSlide);

    // 자동 슬라이드 시작
    startHeroAutoSlide();
}
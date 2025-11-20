// Room Page with Slider
document.addEventListener('DOMContentLoaded', function() {
    // Note: Slider는 room-mapper.js의 reinitializeSlider()에서 초기화됨

    // Initialize other room-specific functionality
    initializeRoomAccordion();

    // 초기 애니메이션 트리거
    setTimeout(() => {
        const animateElements = document.querySelectorAll('.animate-element');
        animateElements.forEach(element => {
            element.classList.add('animate');
        });
    }, 300);

    // 스크롤 애니메이션 초기화
    if (typeof window.initializeScrollAnimations === 'function') {
        window.initializeScrollAnimations();
    }

    // 갤러리 순차 애니메이션 초기화
    initializeGalleryAnimations();

    // 동적 갤러리 카운트 설정
    initializeDynamicGallery();

    // 썸네일 클릭 기능 초기화
    if (typeof window.setupRoomThumbnailInteraction === 'function') {
        window.setupRoomThumbnailInteraction();
    }
});

// 스크롤 애니메이션 관찰자 설정
window.initializeScrollAnimations = function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');

                // room-info-section에 접힘 애니메이션 추가
                if (entry.target.classList.contains('room-info-section')) {
                    setTimeout(() => {
                        entry.target.classList.add('fold-animate');
                    }, 400);
                }

                // 썸네일 순차 애니메이션
                if (entry.target.classList.contains('room-thumbnails')) {
                    const thumbs = entry.target.querySelectorAll('.room-thumb');
                    thumbs.forEach((thumb, index) => {
                        setTimeout(() => {
                            thumb.classList.add('animate');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    // 애니메이션을 적용할 요소들 관찰
    const elementsToAnimate = [
        '.room-info-title',
        '.room-info-section',
        '.room-main-image',
        '.room-details-grid',
        '.room-usage-guide',
        '.gallery-title',
        '.room-thumbnails',
        '.room-image-circle'
    ];

    elementsToAnimate.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => observer.observe(element));
    });
}

// 갤러리 이미지 순차 애니메이션
function initializeGalleryAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };

    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const galleryItems = entry.target.querySelectorAll('.gallery-item');

                // 순차적으로 이미지 애니메이션 실행
                galleryItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('animate');
                        // 모바일에서 접힘 애니메이션 추가 (순차적으로)
                        if (window.innerWidth <= 768) {
                            setTimeout(() => {
                                item.classList.add('fold-animate');
                            }, 300);
                        }
                    }, index * 700); // 700ms 간격으로 순차 실행 (더 천천히)
                });
            }
        });
    }, observerOptions);

    // 갤러리 컨테이너 관찰
    const galleryContainer = document.querySelector('.dynamic-gallery');
    if (galleryContainer) {
        galleryObserver.observe(galleryContainer);
    }
}

// 동적 갤러리 카운트 설정
function initializeDynamicGallery() {
    const galleryContainer = document.querySelector('.dynamic-gallery');
    if (!galleryContainer) return;

    // 실제 gallery-item 개수 계산
    function updateGalleryCount() {
        const galleryItems = galleryContainer.querySelectorAll('.gallery-item');
        const visibleItems = Array.from(galleryItems).filter(item => {
            const style = window.getComputedStyle(item);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });

        const count = visibleItems.length;
        galleryContainer.setAttribute('data-count', count.toString());

        return count;
    }

    // 초기 카운트 설정
    updateGalleryCount();

    // MutationObserver로 DOM 변경 감지
    const observer = new MutationObserver(updateGalleryCount);

    observer.observe(galleryContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    // 외부에서 사용할 수 있는 함수 제공
    window.changeGalleryCount = function(count) {
        const items = galleryContainer.querySelectorAll('.gallery-item');

        // 모든 아이템을 먼저 보이게 함
        items.forEach(item => {
            item.style.display = 'block';
        });

        // count보다 많은 아이템들을 숨김
        items.forEach((item, index) => {
            if (index >= count) {
                item.style.display = 'none';
            }
        });

        // data-count 업데이트
        setTimeout(updateGalleryCount, 10);
    };
}

// 썸네일 클릭 기능
window.setupRoomThumbnailInteraction = function initializeThumbnailClicks() {
    const mainImg = document.querySelector('[data-room-main-img]');
    const thumbnails = document.querySelectorAll('.room-thumb');

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // 모든 썸네일에서 active 클래스 제거
            thumbnails.forEach(t => t.classList.remove('active'));

            // 클릭된 썸네일에 active 클래스 추가
            this.classList.add('active');

            // 메인 이미지 변경
            const thumbImg = this.querySelector('img');
            if (mainImg && thumbImg) {
                mainImg.src = thumbImg.src;
                mainImg.alt = thumbImg.alt;
            }
        });
    });
}

// Room accordion functionality
function initializeRoomAccordion() {
    const accordionButtons = document.querySelectorAll('.accordion-close');

    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const accordionItem = this.closest('.accordion-item');

            if (content.style.display === 'none' || content.style.display === '') {
                content.style.display = 'block';
                accordionItem.classList.add('active');
            } else {
                content.style.display = 'none';
                accordionItem.classList.remove('active');
            }
        });
    });
}
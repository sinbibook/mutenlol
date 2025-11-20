// Main Slider with Enhanced Features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the fullscreen slider using the reusable component
    // Store instance globally so mapper can reinitialize it
    window.mainSliderInstance = new FullscreenSlider('.fullscreen-slider-container', {
        slideDuration: 4000,
        autoplay: true,
        enableSwipe: true,
        enableKeyboard: true
    });

    // Initialize scroll animations
    setupScrollAnimations();
});

// 스크롤 애니메이션 체크 함수 (재사용을 위해 전역)
let scrollAnimationHandler = null;

// 스크롤 애니메이션 설정
function setupScrollAnimations() {
    // 기존 이벤트 리스너 제거
    if (scrollAnimationHandler) {
        window.removeEventListener('scroll', scrollAnimationHandler);
        window.removeEventListener('resize', scrollAnimationHandler);
    }

    // 새로운 핸들러 생성
    scrollAnimationHandler = function() {
        const animateElements = document.querySelectorAll('.animate-element');
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    };

    // 초기 체크
    scrollAnimationHandler();

    // 이벤트 리스너 등록
    window.addEventListener('scroll', scrollAnimationHandler);
    window.addEventListener('resize', scrollAnimationHandler);
}

// 전역으로 노출
window.setupScrollAnimations = setupScrollAnimations;
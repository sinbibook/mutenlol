// Reservation Page with Slider
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the fullscreen slider using the reusable component
    const reservationSlider = new FullscreenSlider('.fullscreen-slider-container', {
        slideDuration: 4000,
        autoplay: true,
        enableSwipe: true,
        enableKeyboard: true
    });

    // 스크롤 애니메이션 초기화
    initializeScrollAnimations();
});

// 스크롤 애니메이션 관찰자 설정
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // reservation-box가 포함된 섹션이 뷰포트에 들어오면 순차적으로 애니메이션 실행
                if (entry.target.classList.contains('reservation-details-section')) {
                    const boxes = entry.target.querySelectorAll('.reservation-box');
                    boxes.forEach((box, index) => {
                        setTimeout(() => {
                            box.classList.add('animate');
                            // 접힘 애니메이션은 박스 애니메이션 후에 실행
                            setTimeout(() => {
                                box.classList.add('fold-animate');
                            }, 400);
                        }, index * 200); // 각 박스마다 200ms씩 지연
                    });
                }
                // refund-section의 테이블과 텍스트 섹션 애니메이션
                else if (entry.target.classList.contains('refund-section')) {
                    const tableSection = entry.target.querySelector('.refund-table-section');
                    const textSection = entry.target.querySelector('.refund-text-section');

                    if (tableSection) {
                        setTimeout(() => {
                            tableSection.classList.add('animate');
                        }, 100);
                    }

                    if (textSection) {
                        setTimeout(() => {
                            textSection.classList.add('animate');
                        }, 300);
                    }
                }
                // 일반적인 애니메이션
                else {
                    entry.target.classList.add('animate');
                }
            }
        });
    }, observerOptions);

    // 애니메이션을 적용할 요소들 관찰
    const elementsToAnimate = document.querySelectorAll(
        '.reservation-details-section, .reservation-book-now, .refund-section, ' +
        '.refund-table-section, .refund-text-section, .reservation-content-layout'
    );
    elementsToAnimate.forEach(element => observer.observe(element));
}
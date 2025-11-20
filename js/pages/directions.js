// Directions Page with Slider and Animation
document.addEventListener('DOMContentLoaded', function() {
    // Note: Slider는 directions-mapper.js의 reinitializeSlider()에서 초기화됨

    // Initialize location notes with icons
    initializeLocationNotes();

    // Initialize scroll animations
    setupScrollAnimations();
});

// 위치 안내 사항을 아이콘과 함께 동적으로 생성
window.initializeLocationNotes = function initializeLocationNotes() {
    const noteElement = document.querySelector('[data-directions-notes]');
    if (!noteElement) return;

    // 텍스트 내용을 가져와서 줄바꿈으로 분할
    const noteText = noteElement.textContent.trim();
    if (!noteText) {
        noteElement.style.display = 'none';
        return;
    }

    const noteLines = noteText.split('\n').filter(line => line.trim() !== '');

    // 새로운 HTML 구조 생성 (각 아이템에 애니메이션 지연 시간 추가)
    const noteItemsHTML = noteLines.map((line, index) => {
        const delay = 1.0 + (index * 0.15); // 1.0s, 1.15s, 1.3s 순차 지연
        return `
            <div class="note-item animate-element" style="transition-delay: ${delay}s;">
                ${line.trim()}
            </div>
        `;
    }).join('');

    // 기존 내용을 새로운 구조로 교체
    noteElement.innerHTML = noteItemsHTML;

    // 새로 생성된 요소들을 애니메이션 시스템에 다시 등록
    setTimeout(() => {
        setupScrollAnimations();
    }, 100);
}

// 스크롤 애니메이션 설정
window.setupScrollAnimations = function setupScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-element');

    function checkScroll() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }

    // 초기 실행
    checkScroll();

    // 스크롤 이벤트
    window.addEventListener('scroll', checkScroll);

    // 리사이즈 이벤트
    window.addEventListener('resize', checkScroll);
}

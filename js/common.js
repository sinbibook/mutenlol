// Common JavaScript functions

// 페이지 이동 공통 함수
window.navigateTo = function(page, id) {
    var urls = {
        home: 'index.html',
        main: 'main.html',
        room: 'room.html',
        facility: 'facility.html',
        reservation: 'reservation.html',
        directions: 'directions.html'
    };
    var base = urls[page] || (page + '.html');
    window.location.href = id ? base + '?id=' + id : base;
};

(function() {
    'use strict';

    // Page load animation for main content sections
    function initPageLoadAnimation() {
        // Add fade-in animation to main content elements
        setTimeout(() => {
            const fadeElements = document.querySelectorAll('.main-content-fade-in');
            fadeElements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('animate');
                }, 300 + (index * 150)); // Start after page fade-in
            });
        }, 100);
    }

    // Also trigger animations on scroll for better UX
    function handleScrollAnimations() {
        const fadeElements = document.querySelectorAll('.main-content-fade-in:not(.animate)');

        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 100;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }

    // Scroll to next section function
    window.scrollToNextSection = function() {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const nextSection = heroSection.nextElementSibling;
            if (nextSection) {
                nextSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    };

    // Scroll to content function for page hero sections
    window.scrollToContent = function() {
        const scrollTarget = document.querySelector('.scroll-target');
        if (scrollTarget) {
            scrollTarget.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // ==========================================
    // Header Dropdown Height Sync
    // ==========================================
    function initHeaderDropdownHeight() {
        var observer = new MutationObserver(function() {
            var header = document.querySelector('.site-header');
            var dropdown = document.querySelector('.header-dropdown');
            if (!header || !dropdown) return;

            observer.disconnect();

            header.addEventListener('mouseenter', function() {
                var maxBottom = 0;
                var dropdownTop = dropdown.getBoundingClientRect().top;

                header.querySelectorAll('.dropdown-sub').forEach(function(sub) {
                    var rect = sub.getBoundingClientRect();
                    if (rect.bottom > maxBottom) maxBottom = rect.bottom;
                });

                dropdown.style.minHeight = maxBottom > dropdownTop
                    ? (maxBottom - dropdownTop + 20) + 'px'
                    : '350px';
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Initialize page load animation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initPageLoadAnimation();
            initHeaderDropdownHeight();
            window.addEventListener('scroll', handleScrollAnimations);
        });
    } else {
        initPageLoadAnimation();
        initHeaderDropdownHeight();
        window.addEventListener('scroll', handleScrollAnimations);
    }

})();
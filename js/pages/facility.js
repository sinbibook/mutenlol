// Facility Page with Slider
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the fullscreen slider using the reusable component
    const facilitySlider = new FullscreenSlider('.fullscreen-slider-container', {
        slideDuration: 4000,
        autoplay: true,
        enableSwipe: true,
        enableKeyboard: true
    });

    // Initialize animations
    initializeAnimations();
    initializeGalleryAnimations();
});

function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;

                if (element.classList.contains('facility-intro-section')) {
                    handleFacilityIntroAnimation(element);
                } else if (element.classList.contains('facility-info-section')) {
                    handleFacilityInfoAnimation(element);
                }
            }
        });
    }, observerOptions);

    // Observe elements
    const facilityIntroSection = document.querySelector('.facility-intro-section');
    if (facilityIntroSection) {
        observer.observe(facilityIntroSection);
    }

    const facilityInfoSections = document.querySelectorAll('.facility-info-section');
    facilityInfoSections.forEach(section => {
        observer.observe(section);
    });
}

function handleFacilityIntroAnimation(section) {
    setTimeout(() => {
        section.classList.add('animate');
    }, 100);
}

function handleFacilityInfoAnimation(section) {
    // Section slide up animation
    setTimeout(() => {
        section.classList.add('animate');
    }, 100);

    // Image animation
    const image = section.querySelector('.facility-info-image');
    if (image) {
        setTimeout(() => {
            image.classList.add('animate');
        }, 300);
    }

    // Title animation
    const title = section.querySelector('.facility-info-title');
    if (title) {
        setTimeout(() => {
            title.classList.add('animate');
        }, 500);
    }

    // Detail sections animation
    const detailSections = section.querySelectorAll('.facility-detail-section');
    detailSections.forEach((detailSection, index) => {
        setTimeout(() => {
            detailSection.classList.add('animate');
            // Add paper fold animation
            setTimeout(() => {
                detailSection.classList.add('fold-animate');
            }, 300);
        }, 700 + (index * 200));
    });
}

function initializeGalleryAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const galleryContainer = entry.target;
                const galleryItems = galleryContainer.querySelectorAll('.gallery-item');

                // 순차적으로 갤러리 아이템 애니메이션 실행 (더 부드럽게)
                galleryItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('animate');
                    }, index * 400); // 400ms 간격으로 순차 실행 (더 천천히)
                });
            }
        });
    }, observerOptions);

    // 갤러리 컨테이너 관찰
    const galleryContainer = document.querySelector('.facility-gallery-container');
    if (galleryContainer) {
        observer.observe(galleryContainer);
    }
}


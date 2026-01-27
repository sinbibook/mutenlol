/**
 * Main Page Data Mapper
 * main.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 main 페이지 특화 기능 제공
 */
class MainMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 🏠 MAIN PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * Hero 슬라이더 이미지 매핑
     * homepage.customFields.pages.main.sections[0].hero.images → [data-main-hero-slider]
     */
    mapHeroSlider() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.hero');
        const sliderContainer = this.safeSelect('[data-main-hero-slider]');

        if (!sliderContainer) return;

        // 기존 슬라이드 제거 (placeholder 제외하고 동적 생성된 것만)
        const existingSlides = sliderContainer.querySelectorAll('.fullscreen-slide:not(:first-child)');
        existingSlides.forEach(slide => slide.remove());

        // isSelected: true인 이미지만 필터링하고 sortOrder로 정렬
        const selectedImages = heroData?.images
            ? heroData.images
                .filter(img => img.isSelected === true)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            : [];

        if (selectedImages.length === 0) {
            // 이미지 없으면 첫 번째 슬라이드만 placeholder로 유지
            const firstSlide = sliderContainer.querySelector('.fullscreen-slide');
            if (firstSlide) {
                const img = firstSlide.querySelector('img');
                if (img) {
                    ImageHelpers.applyPlaceholder(img);
                }
            }
            return;
        }

        // 첫 번째 이미지를 기존 슬라이드에 적용
        const firstSlide = sliderContainer.querySelector('.fullscreen-slide');
        if (firstSlide) {
            const img = firstSlide.querySelector('img');
            if (img) {
                img.src = selectedImages[0].url;
                img.alt = this.sanitizeText(selectedImages[0].description, '메인 이미지');
                img.classList.remove('empty-image-placeholder');
            }
        }

        // 나머지 이미지들을 추가 슬라이드로 생성
        for (let i = 1; i < selectedImages.length; i++) {
            const slide = document.createElement('div');
            slide.className = 'fullscreen-slide';

            const img = document.createElement('img');
            img.src = selectedImages[i].url;
            img.alt = this.sanitizeText(selectedImages[i].description, `메인 이미지 ${i + 1}`);

            slide.appendChild(img);
            sliderContainer.appendChild(slide);
        }

        // 네비게이션 총 개수 업데이트
        const navTotal = document.querySelector('.nav-total');
        if (navTotal) {
            navTotal.textContent = String(selectedImages.length).padStart(2, '0');
        }
    }

    /**
     * About 섹션 매핑 (제목 + 설명)
     * customFields.pages.main.sections[0].hero.title → [data-main-about-title]
     * customFields.pages.main.sections[0].hero.description → [data-main-about-description]
     */
    mapAboutSection() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.hero');

        // About 제목 - customFields hero.title 사용
        const aboutTitle = this.safeSelect('[data-main-about-title]');
        if (aboutTitle) {
            aboutTitle.textContent = this.sanitizeText(heroData?.title, '소개 페이지 히어로 타이틀');
        }

        // About 설명 - customFields hero.description 사용
        const aboutDescription = this.safeSelect('[data-main-about-description]');
        if (aboutDescription) {
            aboutDescription.innerHTML = this._formatTextWithLineBreaks(heroData?.description, '소개 페이지 히어로 설명');
        }
    }

    /**
     * Marquee 섹션 매핑 (customFields 우선)
     * customFields.property.nameEn → [data-main-marquee] 내부 span들 (uppercase)
     */
    mapMarqueeSection() {
        if (!this.isDataLoaded) return;

        const marqueeContainer = this.safeSelect('[data-main-marquee]');
        if (!marqueeContainer) return;

        // 기존 span 제거
        marqueeContainer.innerHTML = '';

        // 5개의 span 생성 (customFields 우선)
        const nameEnUpper = this.getPropertyNameEn().toUpperCase();

        for (let i = 0; i < 5; i++) {
            const span = document.createElement('span');
            span.textContent = nameEnUpper;
            marqueeContainer.appendChild(span);
        }
    }

    /**
     * Full Banner 이미지 매핑 (customFields 우선)
     * customFields.property.images (property_exterior) → [data-main-banner] 배경 이미지
     */
    mapFullBanner() {
        if (!this.isDataLoaded) return;

        const banner = this.safeSelect('[data-main-banner]');
        if (!banner) return;

        // customFields에서 property_exterior 카테고리 이미지 가져오기
        const exteriorImages = this.getPropertyImages('property_exterior');

        if (exteriorImages.length > 0) {
            banner.style.backgroundImage = `url('${exteriorImages[0].url}')`;
        } else {
            banner.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
        }

        banner.style.backgroundSize = 'cover';
        banner.style.backgroundPosition = 'center';
        banner.style.backgroundRepeat = 'no-repeat';
    }

    /**
     * Introduction 섹션 매핑 (동적 블록 생성)
     * homepage.customFields.pages.main.sections[0].about[] → [data-main-introduction]
     */
    mapIntroductionSection() {
        if (!this.isDataLoaded) return;

        const aboutBlocks = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.about');
        const introContainer = this.safeSelect('[data-main-introduction]');

        if (!introContainer) return;

        // 기존 gallery-wrap 제거
        introContainer.innerHTML = '';

        // aboutBlocks가 없거나 빈 배열일 때 기본 블록 하나 생성
        if (!aboutBlocks || !Array.isArray(aboutBlocks) || aboutBlocks.length === 0) {
            const defaultBlock = {
                title: '소개 섹션 타이틀',
                description: '소개 섹션 설명',
                images: []
            };
            const galleryWrap = this.createIntroductionBlock(defaultBlock);
            introContainer.appendChild(galleryWrap);
            return;
        }

        // 각 about 블록에 대해 gallery-wrap 생성
        aboutBlocks.forEach((block) => {
            const galleryWrap = this.createIntroductionBlock(block);
            introContainer.appendChild(galleryWrap);
        });
    }

    /**
     * Introduction 블록 생성 헬퍼 함수
     */
    createIntroductionBlock(block) {
        const galleryWrap = document.createElement('div');
        galleryWrap.className = 'gallery-wrap';

        // 이미지 필터링 및 정렬 (최소 2개 필요)
        let selectedImages = [];
        if (block.images && Array.isArray(block.images)) {
            selectedImages = block.images
                .filter(img => img.isSelected === true)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .slice(0, 2); // 최대 2개만
        }

        // 이미지가 부족하면 null로 채움 (placeholder 처리 위해)
        while (selectedImages.length < 2) {
            selectedImages.push(null);
        }

        // img-wrap 생성
        const imgWrap = document.createElement('div');
        imgWrap.className = 'img-wrap animate-element';
        const img1 = document.createElement('img');
        if (selectedImages[0] && selectedImages[0].url) {
            img1.src = selectedImages[0].url;
            img1.alt = this.sanitizeText(selectedImages[0].description, '소개 이미지 1');
            img1.classList.remove('empty-image-placeholder');
        } else {
            ImageHelpers.applyPlaceholder(img1);
        }
        imgWrap.appendChild(img1);

        // txt-wrap 생성
        const txtWrap = document.createElement('div');
        txtWrap.className = 'txt-wrap';

        const title = document.createElement('h2');
        title.className = 'intro-title animate-element';
        title.textContent = this.sanitizeText(block.title, '소개 섹션 타이틀');

        const description = document.createElement('p');
        description.className = 'intro-description animate-element';
        description.innerHTML = this._formatTextWithLineBreaks(block.description, '소개 섹션 설명');

        txtWrap.appendChild(title);
        txtWrap.appendChild(description);

        // view-img 생성
        const viewImg = document.createElement('div');
        viewImg.className = 'view-img animate-element';
        const img2 = document.createElement('img');
        if (selectedImages[1] && selectedImages[1].url) {
            img2.src = selectedImages[1].url;
            img2.alt = this.sanitizeText(selectedImages[1].description, '소개 이미지 2');
            img2.classList.remove('empty-image-placeholder');
        } else {
            ImageHelpers.applyPlaceholder(img2);
        }
        viewImg.appendChild(img2);

        // gallery-wrap에 추가
        galleryWrap.appendChild(imgWrap);
        galleryWrap.appendChild(txtWrap);
        galleryWrap.appendChild(viewImg);

        return galleryWrap;
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Main 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            console.error('Cannot map main page: data not loaded');
            return;
        }

        // Main 페이지 섹션들 순차 매핑
        this.mapHeroSlider();
        this.mapAboutSection();
        this.mapMarqueeSection();
        this.mapFullBanner();
        this.mapIntroductionSection();

        // 메타 태그 업데이트
        this.updateMetaTags();

        // 슬라이더 재초기화
        this.reinitializeSlider();

        // 스크롤 애니메이션 재초기화
        this.reinitializeScrollAnimations();
    }

    /**
     * 스크롤 애니메이션 재초기화
     */
    reinitializeScrollAnimations() {
        // main.js의 setupScrollAnimations() 함수 호출
        if (typeof window.setupScrollAnimations === 'function') {
            window.setupScrollAnimations();
        }

        // 즉시 체크 (화면에 이미 보이는 요소들)
        const animateElements = document.querySelectorAll('.animate-element');
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }

    /**
     * 슬라이더 재초기화
     */
    reinitializeSlider() {
        // 기존 슬라이더 인스턴스가 있으면 제거
        if (window.mainSliderInstance) {
            if (typeof window.mainSliderInstance.destroy === 'function') {
                window.mainSliderInstance.destroy();
            }
            window.mainSliderInstance = null;
        }

        // 슬라이더 재초기화
        setTimeout(() => {
            if (typeof window.FullscreenSlider === 'function') {
                window.mainSliderInstance = new window.FullscreenSlider('.fullscreen-slider-container', {
                    slideDuration: 4000,
                    autoplay: true,
                    enableSwipe: true,
                    enableKeyboard: true
                });
            }
        }, 100);
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

// 페이지 로드 시 자동 초기화
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        const mapper = new MainMapper();
        await mapper.initialize();
    });
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainMapper;
} else {
    window.MainMapper = MainMapper;
}

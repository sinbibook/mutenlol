/**
 * Main Page Data Mapper
 * main.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 main 페이지 특화 기능 제공
 */
class MainMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    async mapPage() {
        if (!this.isDataLoaded) return;

        try {
            this.updateMetaTags();
            this.mapPropertyNameEn();
            this.mapHeroSection();
            this.mapIntroSection();
            this.mapRoomPreviewImage();
            this.mapSpecialsPreviewImage();
            this.mapLocalSightsImage();
            this.mapClosingSection();
            this.reinitializeSliders();
        } catch (error) {
            console.error('MainMapper mapPage error:', error);
        }
    }

    // ============================================================================
    // 🎬 CLOSING SECTION
    // ============================================================================

    /**
     * Closing 섹션 매핑 (index.html closing 데이터 재사용)
     * homepage.customFields.pages.index.sections.0.closing
     * → [data-closing-section] img.quote-bg, [data-closing-title], [data-closing-description]
     */
    mapClosingSection() {
        const closingData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.closing');

        const bgImg = this.safeSelect('[data-closing-section] img.quote-bg');
        if (bgImg) {
            const images = (closingData?.images || [])
                .filter(img => img.isSelected === true)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            bgImg.src = images[0]?.url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            bgImg.classList.toggle('empty-image-placeholder', !images[0]?.url);
        }

        const titleEl = this.safeSelect('[data-closing-title]');
        if (titleEl) titleEl.textContent = this.sanitizeText(closingData?.title, '마무리 섹션 타이틀');

        const descEl = this.safeSelect('[data-closing-description]');
        if (descEl) descEl.innerHTML = this._formatTextWithLineBreaks(closingData?.description, '마무리 섹션 설명');
    }

    reinitializeSliders() {
        if (typeof window.initCon1HeroSlider === 'function') window.initCon1HeroSlider();
        if (typeof window.initGallery === 'function') window.initGallery();
    }

    // ============================================================================
    // 🏷️ PROPERTY NAME EN
    // ============================================================================

    /**
     * 숙소 영문명 매핑
     * property.nameEn → [data-hero-property-name]
     */
    mapPropertyNameEn() {
        const el = this.safeSelect('[data-hero-property-name]');
        if (!el) return;
        el.textContent = this.getPropertyNameEn();
    }

    // ============================================================================
    // 🎯 HERO SECTION
    // ============================================================================

    /**
     * Hero 섹션 이미지 매핑
     * homepage.customFields.pages.main.sections.0.hero.images → [data-main-images]
     * bg-slide div 구조 (background-image inline style)
     */
    mapHeroSection() {
        const container = this.safeSelect('[data-main-images]');
        if (!container) return;

        container.innerHTML = '';

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.hero');
        const images = (heroData?.images || [])
            .filter(img => img.isSelected === true)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        // 슬라이드 총 개수 업데이트
        const totalEl = this.safeSelect('.con-1 .arrow-num-total');
        if (totalEl) {
            totalEl.textContent = String(Math.max(1, images.length)).padStart(2, '0');
        }

        if (images.length === 0) {
            const div = document.createElement('div');
            div.className = 'bg-slide is-active empty-image-placeholder';
            div.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
            container.appendChild(div);
            return;
        }

        images.forEach((img, i) => {
            const div = document.createElement('div');
            div.className = i === 0 ? 'bg-slide is-active' : 'bg-slide';
            div.style.backgroundImage = `url('${img.url}')`;
            container.appendChild(div);
        });
    }

    // ============================================================================
    // 📖 INTRO SECTION
    // ============================================================================

    /**
     * 소개 섹션 매핑
     * pages.main.sections.0.about[0] → 타이틀, 설명, 이미지 4장
     * - [data-main-intro-title] h1          → about[0].title
     * - [data-main-intro-description]        → about[0].description
     * - .quote-container .img1-parent img    → about[0].images[0,1]
     * - .image-overlay-item                  → about[0].images[2]
     * - .image-overlay-inner                 → about[0].images[3]
     */
    mapIntroSection() {
        const aboutData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.about.0');

        // 타이틀
        const titleEl = this.safeSelect('[data-main-intro-title] h1');
        if (titleEl) {
            titleEl.innerHTML = this._formatTextWithLineBreaks(aboutData?.title, '소개 섹션 타이틀');
        }

        // 설명 (.muten-lol 폰트 스타일 유지)
        const descEl = this.safeSelect('[data-main-intro-description]');
        if (descEl) {
            descEl.innerHTML = this._formatTextWithLineBreaks(aboutData?.description, '소개 섹션 설명');
        }

        const images = (aboutData?.images || [])
            .filter(img => img.isSelected === true)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        const getImgSrc = (index) => images[index]?.url || null;

        // 이미지 1,2번째 → .img1-parent 내 img 태그
        const imgParent = this.safeSelect('.quote-container[data-main-intro-images] .img1-parent');
        if (imgParent) {
            const imgTags = imgParent.querySelectorAll('img');
            [0, 1].forEach(i => {
                if (!imgTags[i]) return;
                const url = getImgSrc(i);
                imgTags[i].src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                imgTags[i].classList.toggle('empty-image-placeholder', !url);
            });
        }

        // 이미지 3번째 → .image-overlay-item
        const img3 = this.safeSelect('.image-overlay .image-overlay-item');
        if (img3) {
            const url = getImgSrc(2);
            img3.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img3.classList.toggle('empty-image-placeholder', !url);
        }

        // 이미지 4번째 → .image-overlay-inner
        const img4 = this.safeSelect('.image-overlay .image-overlay-inner');
        if (img4) {
            const url = getImgSrc(3);
            img4.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img4.classList.toggle('empty-image-placeholder', !url);
        }
    }

    // ============================================================================
    // 🏠 PREVIEW IMAGES (Room / Specials / Local Sights)
    // ============================================================================

    /**
     * Room preview 이미지 매핑
     * customFields.roomtypes[0].images → [data-room-images] separator + 하위 img 2장
     */
    mapRoomPreviewImage() {
        const roomtypes = this.safeGet(this.data, 'homepage.customFields.roomtypes');
        const firstRoom = (roomtypes || [])[0];

        // View More 링크 → roomtypes[0].id 기반
        const linkEl = this.safeSelect('[data-room-preview-link]');
        if (linkEl && firstRoom?.id) {
            linkEl.href = `./room.html?id=${firstRoom.id}`;
        }

        // roomtype_interior 0, 1번째 이미지 사용 (isSelected === true 필터)
        const images = this.getRoomImages(firstRoom || {}, 'roomtype_interior');
        const getUrl = (i) => images[i]?.url || null;

        // description-components-child img
        const img1 = this.safeSelect('.description-components .description-components-child');
        if (img1) {
            const url = getUrl(0);
            img1.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img1.classList.toggle('empty-image-placeholder', !url);
        }

        // image-components-child img
        const img2 = this.safeSelect('.description-components .image-components-child');
        if (img2) {
            const url = getUrl(1) || getUrl(0);
            img2.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img2.classList.toggle('empty-image-placeholder', !url);
        }
    }

    /**
     * Specials preview 이미지 매핑
     * property.facilities[0].images → [data-specials-images] img + 하위 img 1장
     */
    mapSpecialsPreviewImage() {
        const facilities = this.safeGet(this.data, 'property.facilities');
        const sorted = [...(facilities || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        const firstFacility = sorted[0];
        const images = (firstFacility?.images || [])
            .filter(img => img.isSelected === true && img.url)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        const getUrl = (i) => images[i]?.url || null;

        // View More 링크 → facilities[0].id 기반
        const linkEl = this.safeSelect('[data-specials-preview-link]');
        if (linkEl && firstFacility?.id) {
            linkEl.href = `./facility.html?id=${firstFacility.id}`;
        }

        // frame-item img (data-specials-images)
        const img1 = this.safeSelect('[data-specials-images]');
        if (img1) {
            const url = getUrl(0);
            img1.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img1.classList.toggle('empty-image-placeholder', !url);
        }

        // description-components-inner img
        const img2 = this.safeSelect('.description-components2 .description-components-inner');
        if (img2) {
            const url = getUrl(1) || getUrl(0);
            img2.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img2.classList.toggle('empty-image-placeholder', !url);
        }
    }

    /**
     * Local sights preview 매핑
     * enabled: false면 .description-components3 전체 숨김
     * pages.nearbyAttractions.sections.0.about.0.images → [data-localsights-images] separator + 하위 img 2장
     */
    mapLocalSightsImage() {
        const section = this.safeSelect('.description-components3');
        if (!section) return;

        const nearbyData = this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0');
        const enabled = nearbyData?.enabled;

        // enabled가 명시적으로 false면 숨김
        if (enabled === false) {
            section.style.display = 'none';
            return;
        }
        section.style.display = '';

        const aboutData = nearbyData?.about?.[0];
        const images = (aboutData?.images || [])
            .filter(img => img.isSelected !== false && img.url)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        const getUrl = (i) => images[i]?.url || null;

        // description-components-child img (0번째)
        const img1 = this.safeSelect('.description-components3 .description-components-child');
        if (img1) {
            const url = getUrl(0);
            img1.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img1.classList.toggle('empty-image-placeholder', !url);
        }

        // image-components-child img (1번째)
        const img2 = this.safeSelect('.description-components3 .image-components-child');
        if (img2) {
            const url = getUrl(1) || getUrl(0);
            img2.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img2.classList.toggle('empty-image-placeholder', !url);
        }
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

if (typeof window !== 'undefined' && window.parent === window) {
    window.addEventListener('DOMContentLoaded', async () => {
        const mapper = new MainMapper();
        await mapper.initialize();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainMapper;
} else {
    window.MainMapper = MainMapper;
}

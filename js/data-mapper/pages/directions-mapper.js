/**
 * Directions Page Data Mapper
 * directions.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 오시는길 페이지 전용 기능 제공
 */
class DirectionsMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    async mapPage() {
        if (!this.isDataLoaded) return;

        try {
            this.updateMetaTags();
            this.mapHeroSection();
            this.mapLocationInfo();
            this.mapClosingSection();
            this.initKakaoMap();
            this.reinitializeSliders();
        } catch (error) {
            console.error('DirectionsMapper mapPage error:', error);
        }
    }

    reinitializeSliders() {
        if (typeof window.initCon2HeroSlider === 'function') window.initCon2HeroSlider();
    }

    // ============================================================================
    // 🎯 HERO SECTION
    // ============================================================================

    /**
     * Hero 슬라이더 매핑
     * homepage.customFields.pages.directions.sections.0.hero.images → [data-directions-images]
     * bg-slide div 구조 (background-image inline style)
     */
    mapHeroSection() {
        const container = this.safeSelect('[data-directions-images]');
        if (!container) return;

        container.innerHTML = '';

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');
        const images = (heroData?.images || [])
            .filter(img => img.isSelected === true)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        // 슬라이드 총 개수 업데이트
        const totalEl = this.safeSelect('.arrow-num-total');
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
            div.setAttribute('role', 'img');
            div.setAttribute('aria-label', this.sanitizeText(img.description, `오시는길 이미지 ${i + 1}`));
            container.appendChild(div);
        });
    }

    // ============================================================================
    // 📍 LOCATION INFO
    // ============================================================================

    /**
     * 주소 매핑
     * property.address → [data-directions-address]
     */
    mapLocationInfo() {
        if (!this.isDataLoaded || !this.data.property) return;

        const addressEl = this.safeSelect('[data-directions-address]');
        if (addressEl) {
            const address = this.data.property?.address;
            addressEl.textContent = this.sanitizeText(address, '숙소 주소');
        }
    }

    // ============================================================================
    // 🗺️ KAKAO MAP
    // ============================================================================

    /**
     * 카카오 지도 초기화
     * property.latitude, property.longitude → #kakao-map
     */
    initKakaoMap() {
        if (!this.isDataLoaded) return;

        const mapContainer = document.getElementById('kakao-map');
        if (!mapContainer) return;

        const lat = this.data?.property?.latitude;
        const lng = this.data?.property?.longitude;

        if (!lat || !lng) {
            const img = document.createElement('img');
            img.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img.alt = '지도';
            img.classList.add('empty-image-placeholder');
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            mapContainer.appendChild(img);
            return;
        }

        if (!window.kakao || !window.kakao.maps) {
            console.warn('[DirectionsMapper] Kakao SDK not loaded');
            return;
        }

        kakao.maps.load(() => {
            this._createKakaoMap(lat, lng, mapContainer);
        });
    }

    _createKakaoMap(lat, lng, container) {
        const coords = new kakao.maps.LatLng(lat, lng);
        const map = new kakao.maps.Map(container, { center: coords, level: 5 });
        const marker = new kakao.maps.Marker({ position: coords });
        marker.setMap(map);
    }

    // ============================================================================
    // 🎬 CLOSING SECTION
    // ============================================================================

    /**
     * Closing 섹션 매핑 (index closing 데이터 재사용)
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
            bgImg.alt = this.sanitizeText(closingData?.title, '마무리 섹션 이미지');
            bgImg.classList.toggle('empty-image-placeholder', !images[0]?.url);
        }

        const titleEl = this.safeSelect('[data-closing-title]');
        if (titleEl) titleEl.textContent = this.sanitizeText(closingData?.title, '마무리 섹션 타이틀');

        const descEl = this.safeSelect('[data-closing-description]');
        if (descEl) descEl.innerHTML = this._formatTextWithLineBreaks(closingData?.description, '마무리 섹션 설명');
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

if (typeof window !== 'undefined' && window.parent === window) {
    window.addEventListener('DOMContentLoaded', async () => {
        const mapper = new DirectionsMapper();
        await mapper.initialize();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DirectionsMapper;
} else {
    window.DirectionsMapper = DirectionsMapper;
}

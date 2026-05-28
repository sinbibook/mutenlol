/**
 * Nearby Attractions Page Data Mapper
 * room.html 구조를 활용한 슬라이더 방식
 */
class NearbyAttractionsMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    /**
     * 주변 관광지 customFields 데이터 가져오기
     */
    getNearbyAttractionsData() {
        return this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0');
    }

    /**
     * 페이지 매핑
     */
    async mapPage() {
        const data = this.getNearbyAttractionsData();

        // enabled 체크 - false면 404로 리다이렉트 (preview 모드 제외)
        if (data?.enabled === false && window.parent === window) {
            window.location.href = './404.html';
            return;
        }

        this.mapHeroSlider();
        this.mapHeroContent();
        this.mapAttractionsSlider();
        this.mapClosingSection();
        this.updateMetaTags({ title: '주변 관광지' });

        // 슬라이더 초기화
        if (typeof window.initNearbyAttractionsHeroSlider === 'function') {
            window.initNearbyAttractionsHeroSlider();
        }

        // 관광지 슬라이더 초기화
        if (typeof window.initAttractionsSlider === 'function') {
            window.initAttractionsSlider();
        }
    }

    /**
     * Hero 슬라이더 이미지 생성
     */
    mapHeroSlider() {
        if (!this.isDataLoaded) return;

        const heroData = this.getNearbyAttractionsData()?.hero;
        const sliderContainer = this.safeSelect('[data-nearby-hero-images]');
        if (!sliderContainer || !heroData) return;

        const images = heroData?.images || [];
        const selectedImages = ImageHelpers.getSelectedImages(images);

        sliderContainer.innerHTML = '';

        if (selectedImages.length === 0) {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'bg-slide is-active';
            slideDiv.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
            sliderContainer.appendChild(slideDiv);
            return;
        }

        selectedImages.forEach((img, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'bg-slide' + (index === 0 ? ' is-active' : '');
            slideDiv.style.backgroundImage = `url('${img.url}')`;
            slideDiv.style.backgroundSize = 'cover';
            slideDiv.style.backgroundPosition = 'center';
            slideDiv.style.backgroundRepeat = 'no-repeat';
            sliderContainer.appendChild(slideDiv);
        });
    }

    /**
     * Hero 콘텐츠 매핑 (타이틀 + 설명)
     */
    mapHeroContent() {
        if (!this.isDataLoaded) return;

        const heroData = this.getNearbyAttractionsData()?.hero;
        const titleEl = this.safeSelect('[data-nearby-hero-title]');
        const sectionTitleEl = this.safeSelect('[data-nearby-attractions-title]');
        const sectionDescEl = this.safeSelect('[data-nearby-attractions-description]');

        if (titleEl && heroData?.title) {
            titleEl.textContent = this.sanitizeText(heroData.title, '주변 관광지 타이틀');
        }

        if (sectionTitleEl && heroData?.title) {
            sectionTitleEl.textContent = this.sanitizeText(heroData.title, '주변 관광지 섹션 타이틀');
        }

        if (sectionDescEl && heroData?.description) {
            sectionDescEl.textContent = this.sanitizeText(heroData.description, '주변 관광지 설명');
        }
    }

    /**
     * 관광지 썸네일 및 설명 생성 (room.html 구조 방식)
     */
    mapAttractionsSlider() {
        if (!this.isDataLoaded) return;

        const aboutData = this.getNearbyAttractionsData()?.about || [];
        const container = this.safeSelect('[data-nearby-attractions-list]');
        const mainImageEl = this.safeSelect('[data-main-image]');
        const titleEl = this.safeSelect('[data-attraction-title]');
        const descEl = this.safeSelect('[data-attraction-description]');

        if (!container || !mainImageEl || !titleEl || !descEl) return;

        container.innerHTML = '';

        // 첫 번째 항목으로 초기화
        if (aboutData.length > 0) {
            const firstAttracting = aboutData[0];
            const firstImages = ImageHelpers.getSelectedImages(firstAttracting?.images || []);

            mainImageEl.src = firstImages.length > 0 ? firstImages[0].url : ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            mainImageEl.alt = this.sanitizeText(firstAttracting?.title, '관광지 이미지');
            titleEl.textContent = this.sanitizeText(firstAttracting?.title, '관광지명');
            descEl.innerHTML = this._formatTextWithLineBreaks(firstAttracting?.description, '관광지 설명');
        }

        // 썸네일 생성 (about 배열 수만큼)
        aboutData.forEach((attraction, index) => {
            const images = ImageHelpers.getSelectedImages(attraction?.images || []);
            if (images.length === 0) return;

            const thumbWrap = document.createElement('div');
            thumbWrap.className = 'nearby-attractions-thumb-wrap';
            if (index === 0) thumbWrap.classList.add('is-active');

            const thumbImg = document.createElement('img');
            thumbImg.className = 'nearby-attractions-thumb';
            thumbImg.src = images[0].url;
            thumbImg.alt = this.sanitizeText(attraction?.title, '썸네일');
            thumbImg.loading = 'lazy';

            thumbWrap.appendChild(thumbImg);

            // 썸네일 클릭 이벤트 - 메인 이미지, 타이틀, 설명 업데이트 (fade 효과)
            thumbWrap.addEventListener('click', () => {
                // 기존 active 제거
                const allThumbs = container.querySelectorAll('.nearby-attractions-thumb-wrap');
                allThumbs.forEach(t => t.classList.remove('is-active'));

                // 현재 active 설정
                thumbWrap.classList.add('is-active');

                // Fade out 효과
                mainImageEl.style.opacity = '0';
                titleEl.style.opacity = '0';
                descEl.style.opacity = '0';

                // 트랜지션 완료 후 콘텐츠 업데이트
                setTimeout(() => {
                    // 메인 이미지, 타이틀, 설명 업데이트
                    mainImageEl.src = images[0].url;
                    mainImageEl.alt = this.sanitizeText(attraction?.title, '관광지 이미지');
                    titleEl.textContent = this.sanitizeText(attraction?.title, '관광지명');
                    descEl.innerHTML = this._formatTextWithLineBreaks(attraction?.description, '관광지 설명');

                    // Fade in 효과
                    mainImageEl.style.opacity = '1';
                    titleEl.style.opacity = '1';
                    descEl.style.opacity = '1';
                }, 250);
            });

            container.appendChild(thumbWrap);
        });
    }

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
        if (titleEl) titleEl.textContent = this.sanitizeText(closingData?.title, '');

        const descEl = this.safeSelect('[data-closing-description]');
        if (descEl) descEl.innerHTML = this._formatTextWithLineBreaks(closingData?.description, '');
    }
}

// 자동 초기화
if (window.parent === window) {
    document.addEventListener('DOMContentLoaded', async () => {
        const mapper = new NearbyAttractionsMapper();
        await mapper.initialize();
    });
}

window.NearbyAttractionsMapper = NearbyAttractionsMapper;

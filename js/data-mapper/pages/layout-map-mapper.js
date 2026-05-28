/**
 * Layout Map Page Data Mapper
 * layout-map.html 전용 매핑 함수들을 포함한 클래스
 */
class LayoutMapMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    /**
     * 배치도 customFields 데이터 가져오기
     */
    getLayoutMapData() {
        return this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0');
    }

    /**
     * 페이지 매핑
     */
    async mapPage() {
        const data = this.getLayoutMapData();

        // enabled 체크 - false면 404로 리다이렉트 (preview 모드 제외)
        if (data?.enabled === false && window.parent === window) {
            window.location.href = './404.html';
            return;
        }

        this.mapHeroSlider();
        this.mapHeroContent();
        this.mapAboutSection();
        this.mapClosingSection();
        this.updateMetaTags({ title: '숙소 배치도' });

        // 슬라이더 초기화
        if (typeof window.initLayoutMapHeroSlider === 'function') {
            window.initLayoutMapHeroSlider();
        }
    }

    /**
     * Hero 슬라이더 이미지 생성
     */
    mapHeroSlider() {
        if (!this.isDataLoaded) return;

        const heroData = this.getLayoutMapData()?.hero;
        const sliderContainer = this.safeSelect('[data-layout-map-hero-images]');
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
     * Hero 콘텐츠 매핑 (타이틀)
     */
    mapHeroContent() {
        if (!this.isDataLoaded) return;

        const heroData = this.getLayoutMapData()?.hero;
        const titleEl = this.safeSelect('[data-layout-map-hero-title]');

        if (titleEl && heroData?.title) {
            titleEl.textContent = this.sanitizeText(heroData.title, '배치도 타이틀');
        }
    }

    /**
     * About 섹션 매핑
     * title, description + 이미지 그리드
     */
    mapAboutSection() {
        if (!this.isDataLoaded) return;

        const aboutData = this.getLayoutMapData()?.about;
        if (!aboutData) return;

        // Title 매핑
        const titleEl = this.safeSelect('[data-layout-map-title]');
        if (titleEl && aboutData.title) {
            titleEl.textContent = this.sanitizeText(aboutData.title, '배치도 제목');
        }

        // Description 매핑
        const descEl = this.safeSelect('[data-layout-map-description]');
        if (descEl && aboutData.description) {
            descEl.innerHTML = this._formatTextWithLineBreaks(aboutData.description, '배치도 설명');
        }

        // 이미지 그리드 매핑
        const imagesContainer = this.safeSelect('[data-layout-map-images]');
        if (!imagesContainer) return;

        const images = ImageHelpers.getSelectedImages(aboutData.images || []);
        imagesContainer.innerHTML = '';

        if (images.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'layout-image-item';
            const emptyImg = document.createElement('img');
            emptyImg.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            emptyImg.alt = '이미지 없음';
            emptyImg.classList.add('empty-image-placeholder');
            emptyItem.appendChild(emptyImg);
            imagesContainer.appendChild(emptyItem);
            return;
        }

        images.forEach((img, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'layout-image-item';
            itemEl.setAttribute('data-reveal', '');
            itemEl.setAttribute('data-reveal-delay', (index % 4) + 1);

            const imgEl = document.createElement('img');
            imgEl.src = img.url;
            imgEl.alt = this.sanitizeText(img.description, '배치도 이미지');
            imgEl.loading = 'lazy';

            const captionEl = document.createElement('p');
            captionEl.className = 'layout-image-caption';
            captionEl.textContent = this.sanitizeText(img.description, '');

            itemEl.appendChild(imgEl);
            itemEl.appendChild(captionEl);
            imagesContainer.appendChild(itemEl);
        });

        // preview(iframe)에서는 scroll-reveal이 트리거 안 되므로 즉시 노출
        if (window.parent !== window) {
            imagesContainer.querySelectorAll('.layout-image-item').forEach(el => {
                el.classList.add('is-in-view');
            });
        }
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
        const mapper = new LayoutMapMapper();
        await mapper.initialize();
    });
}

window.LayoutMapMapper = LayoutMapMapper;

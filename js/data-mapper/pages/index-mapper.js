/**
 * Index Page Data Mapper
 * Extends BaseDataMapper for Index page specific mappings
 */
class IndexMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    async mapPage() {
        if (!this.isDataLoaded) return;

        try {
            this.updateMetaTags();
            this.mapPropertyName();
            this.mapGallerySection();
            this.mapHeroSection();
            this.mapEssenceSection();
            this.mapRoomsSection();
            this.mapFacilitySection();
            this.mapClosingSection();
            this.reinitializeSliders();
        } catch (error) {
            console.error('IndexMapper mapPage error:', error);
        }
    }

    reinitializeSliders() {
        if (typeof window.initSliderSection === 'function') window.initSliderSection();
        if (typeof window.initPrologueSection === 'function') window.initPrologueSection();
        if (typeof window.initSpecialSection === 'function') window.initSpecialSection();
    }

    // ============================================================================
    // 🏷️ PROPERTY NAME
    // ============================================================================

    mapPropertyName() {
        const el = this.safeSelect('[data-hero-property-name]');
        if (!el) return;
        const h1 = el.querySelector('h1') || el;
        h1.textContent = this.getPropertyNameEn();
    }

    // ============================================================================
    // 🖼️ GALLERY SECTION
    // ============================================================================

    /**
     * 갤러리 롤링 이미지 매핑
     * homepage.customFields.pages.index.sections.0.gallery.images → [data-gallery-image]
     * 원본 N장 + 복제 N장 구조 (끊김 없는 루프)
     */
    mapGallerySection() {
        const container = this.safeSelect('[data-gallery-image]');
        if (!container) return;

        const galleryData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.gallery');
        const images = (galleryData?.images || [])
            .filter(img => img.isSelected === true)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        container.innerHTML = '';

        if (images.length === 0) return;

        const makeImg = (imgData, isClone) => {
            const el = document.createElement('img');
            el.className = 'gallery-img';
            el.src = imgData.url;
            el.alt = isClone ? '' : this.sanitizeText(imgData.description, '');
            if (!isClone) el.loading = 'lazy';
            if (isClone) el.setAttribute('aria-hidden', 'true');
            return el;
        };

        // 원본
        images.forEach(img => container.appendChild(makeImg(img, false)));
        // 복제 (끊김 없는 루프용)
        images.forEach(img => container.appendChild(makeImg(img, true)));
    }

    // ============================================================================
    // 🎯 HERO SECTION
    // ============================================================================

    /**
     * Hero 섹션 매핑
     * - [data-hero-images] → slider-bg img 동적 생성 (.slider-bg-wrap)
     * - [data-hero-title]  → hero 타이틀
     * - [data-hero-description] → hero 설명
     */
    mapHeroSection() {
        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.hero');

        // Hero 슬라이더 이미지 ([data-hero-images] = .slider-bg-wrap)
        const sliderWrap = this.safeSelect('[data-hero-images]');
        if (sliderWrap) {
            const images = (heroData?.images || [])
                .filter(img => img.isSelected === true)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

            sliderWrap.innerHTML = '';

            if (images.length === 0) {
                const imgEl = document.createElement('img');
                imgEl.className = 'slider-bg active';
                imgEl.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                imgEl.alt = '';
                imgEl.classList.add('empty-image-placeholder');
                imgEl.setAttribute('data-index', '0');
                sliderWrap.appendChild(imgEl);
            } else {
                images.forEach((img, i) => {
                    const imgEl = document.createElement('img');
                    imgEl.className = i === 0 ? 'slider-bg active' : 'slider-bg';
                    imgEl.src = img.url;
                    imgEl.alt = this.sanitizeText(img.description, '');
                    imgEl.loading = i === 0 ? 'eager' : 'lazy';
                    imgEl.setAttribute('data-index', String(i));
                    sliderWrap.appendChild(imgEl);
                });
            }
        }

        if (!heroData) return;

        const titleEl = this.safeSelect('[data-hero-title]');
        if (titleEl) titleEl.textContent = this.sanitizeText(heroData.title, '메인 히어로 타이틀');

        const descEl = this.safeSelect('[data-hero-description]');
        if (descEl) descEl.innerHTML = this._formatTextWithLineBreaks(heroData.description, '메인 히어로 설명');
    }

    // ============================================================================
    // 💎 ESSENCE SECTION
    // ============================================================================

    /**
     * Essence(Prologue) 섹션 매핑
     * - [data-essence-description] → 영문 헤딩
     * - [data-essence-title]       → 한글 설명
     * - [data-essence-images]      → .prologue-main-img 동적 생성 (최대 3장)
     * - .prologue-thumbs           → .thumb-img 동적 생성 (최대 3장)
     */
    mapEssenceSection() {
        const essenceData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.essence');
        if (!essenceData) return;

        const descEl = this.safeSelect('[data-essence-description]');
        if (descEl) descEl.innerHTML = this._formatTextWithLineBreaks(essenceData.description, '핵심 메시지 섹션 설명');

        const titleEl = this.safeSelect('[data-essence-title]');
        if (titleEl) titleEl.innerHTML = this._formatTextWithLineBreaks(essenceData.title, '핵심 메시지 섹션 타이틀');

        const images = (essenceData.images || [])
            .filter(img => img.isSelected === true)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .slice(0, 3);

        // Main images
        const mainWrap = this.safeSelect('[data-essence-images]');
        if (mainWrap) {
            mainWrap.innerHTML = '';
            if (images.length === 0) {
                const img = this._makeEssenceImg(null, true, false);
                mainWrap.appendChild(img);
            } else {
                images.forEach((imgData, i) => {
                    mainWrap.appendChild(this._makeEssenceImg(imgData, i === 0, false));
                });
            }
        }

        // Thumb images
        const thumbsWrap = this.safeSelect('.prologue-thumbs');
        if (thumbsWrap) {
            thumbsWrap.innerHTML = '';
            if (images.length === 0) {
                const img = this._makeEssenceImg(null, true, true, 0);
                thumbsWrap.appendChild(img);
            } else {
                images.forEach((imgData, i) => {
                    thumbsWrap.appendChild(this._makeEssenceImg(imgData, i === 0, true, i));
                });
            }
        }
    }

    _makeEssenceImg(imgData, isActive, isThumb, index = null) {
        const el = document.createElement('img');
        el.className = isThumb
            ? (isActive ? 'thumb-img active' : 'thumb-img')
            : (isActive ? 'prologue-main-img active' : 'prologue-main-img');
        el.loading = 'lazy';
        el.alt = '';
        el.src = imgData?.url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
        if (!imgData?.url) el.classList.add('empty-image-placeholder');
        if (isThumb && index !== null) el.setAttribute('data-index', String(index));
        return el;
    }

    // ============================================================================
    // 🏠 ROOMS SECTION
    // ============================================================================

    /**
     * 객실 카드 슬라이더 매핑
     * rooms[] → [data-room-section] .room-slider-track
     * 원본 블록 + 복제 블록 구조 (끊김 없는 루프)
     * 룸 수가 적어 블록이 뷰포트보다 좁으면 루프 끝에 빈 공간이 보이므로,
     * 한 블록이 뷰포트의 1.5배 이상 차도록 룸 리스트를 반복.
     */
    mapRoomsSection() {
        const track = this.safeSelect('[data-room-section] .room-slider-track');
        if (!track) return;

        track.innerHTML = '';

        const roomsData = this.safeGet(this.data, 'rooms');
        if (!roomsData || !Array.isArray(roomsData) || roomsData.length === 0) return;

        const sortedRooms = [...roomsData].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        const makeCard = (room, index, isClone) => {
            const thumbnails = this.getRoomImages(room, 'roomtype_thumbnail');
            const thumbUrl = thumbnails[0]?.url || null;

            const a = document.createElement('a');
            a.className = 'room-card';
            a.href = `./room.html?id=${room.id}`;
            if (isClone) {
                a.setAttribute('aria-hidden', 'true');
                a.setAttribute('tabindex', '-1');
            }

            const bgImg = document.createElement('img');
            bgImg.className = 'room-card-bg';
            bgImg.alt = '';
            bgImg.src = './images/bg@2x.png';

            const cardImg = document.createElement('img');
            cardImg.className = 'room-card-img';
            if (!isClone) cardImg.loading = 'lazy';
            cardImg.alt = '';
            if (thumbUrl) {
                cardImg.src = thumbUrl;
            } else {
                cardImg.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                cardImg.classList.add('empty-image-placeholder');
            }

            const info = document.createElement('div');
            info.className = 'room-card-info';

            const label = document.createElement('h3');
            label.className = 'room-card-label';
            label.textContent = this.getRoomName(room);

            const name = document.createElement('h2');
            name.className = 'room-card-name';
            name.textContent = 'Room ' + String((index % sortedRooms.length) + 1).padStart(2, '0');

            info.appendChild(label);
            info.appendChild(name);
            a.appendChild(bgImg);
            a.appendChild(cardImg);
            a.appendChild(info);
            return a;
        };

        // 한 블록이 뷰포트의 약 1.5배 이상 채우도록 룸 리스트 반복 횟수 결정
        // .room-card min-width=420 + gap=22 = 442 (모바일 .room-card width~290 + gap=16 = 306)
        const viewportW = window.innerWidth || 1200;
        const isMobile = viewportW <= 420;
        const cardSlot = isMobile ? 306 : 442;
        const targetBlockW = viewportW * 1.5;
        const cardsPerBlock = Math.max(sortedRooms.length, Math.ceil(targetBlockW / cardSlot));
        const repeat = Math.max(1, Math.ceil(cardsPerBlock / sortedRooms.length));

        const appendBlock = (isClone) => {
            for (let r = 0; r < repeat; r++) {
                sortedRooms.forEach((room, i) => {
                    const idx = r * sortedRooms.length + i;
                    track.appendChild(makeCard(room, idx, isClone));
                });
            }
        };

        appendBlock(false);  // 원본 블록
        appendBlock(true);   // 복제 블록 (끊김 없는 루프)
    }

    // ============================================================================
    // 🏊 FACILITY SECTION
    // ============================================================================

    /**
     * 부대시설 섹션 매핑
     * property.facilities[] → [data-facility-section]
     * - .specials-card-img-wrap 내 좌측 이미지 슬라이드
     * - .special-image 내 우측 bg 슬라이드
     * - data-titles / data-descs / data-links 속성 설정
     */
    mapFacilitySection() {
        const facilities = this.safeGet(this.data, 'property.facilities');
        if (!facilities || !Array.isArray(facilities) || facilities.length === 0) return;

        const sortedFacilities = [...facilities]
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        // 좌측 카드 이미지
        const cardImgWrap = this.safeSelect('[data-facility-section] .specials-card-img-wrap');
        if (cardImgWrap) {
            const border = cardImgWrap.querySelector('.specials-card-img-border');
            cardImgWrap.innerHTML = '';
            if (border) cardImgWrap.appendChild(border);

            sortedFacilities.forEach((facility, i) => {
                const firstImg = this._getFacilityFirstImage(facility);
                const imgEl = document.createElement('img');
                imgEl.className = i === 0 ? 'specials-card-img active' : 'specials-card-img';
                imgEl.loading = 'lazy';
                imgEl.alt = this.sanitizeText(facility.name, '');
                imgEl.setAttribute('data-index', String(i));
                imgEl.src = firstImg ? firstImg.url : ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                if (!firstImg) imgEl.classList.add('empty-image-placeholder');
                cardImgWrap.appendChild(imgEl);
            });
        }

        // 우측 bg 슬라이드
        const specialImage = this.safeSelect('[data-facility-section] .special-image');
        if (specialImage) {
            const slideNav = specialImage.querySelector('.slide');
            specialImage.innerHTML = '';

            sortedFacilities.forEach((facility, i) => {
                const firstImg = this._getFacilityFirstImage(facility);
                const slideDiv = document.createElement('div');
                slideDiv.className = i === 0 ? 'special-image-slide active' : 'special-image-slide';
                slideDiv.setAttribute('data-index', String(i));
                slideDiv.style.backgroundImage = firstImg
                    ? `url('${firstImg.url}')`
                    : `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
                if (!firstImg) slideDiv.classList.add('empty-image-placeholder');
                specialImage.appendChild(slideDiv);
            });

            if (slideNav) specialImage.appendChild(slideNav);
        }

        // data-titles
        const titleEl = this.safeSelect('[data-facility-section] .specials-card-title');
        if (titleEl) {
            const titles = sortedFacilities.map(f => this.sanitizeText(f.name, ''));
            titleEl.setAttribute('data-titles', titles.join('|'));
            if (titles[0]) titleEl.textContent = titles[0];
        }

        // data-descs (각 시설 설명, 줄바꿈은 ||로 구분, 시설 간은 @@로 구분)
        const descEl = this.safeSelect('[data-facility-section] .specials-card-desc');
        if (descEl) {
            const descs = sortedFacilities.map(f =>
                (this.sanitizeText(f.description, '') || '').replace(/\n/g, '||')
            );
            descEl.setAttribute('data-descs', descs.join('@@'));
            const firstDesc = sortedFacilities[0]?.description;
            if (firstDesc) {
                descEl.innerHTML = firstDesc.split('\n').slice(0, 2)
                    .map(line => `<p>${this._escapeHTML(line)}</p>`).join('');
            }
        }

        // data-links
        const linkEl = this.safeSelect('[data-facility-section] .view-more-link');
        if (linkEl) {
            const links = sortedFacilities.map(f => `./facility.html?id=${f.id}`);
            linkEl.setAttribute('data-links', links.join('|'));
            if (links[0]) linkEl.setAttribute('href', links[0]);
        }
    }

    _getFacilityFirstImage(facility) {
        return (facility.images || [])
            .filter(img => img.isSelected !== false && img.url)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))[0] || null;
    }

    // ============================================================================
    // 🎬 CLOSING SECTION
    // ============================================================================

    /**
     * Closing(Quote) 섹션 매핑
     * - [data-closing-section] img.quote-bg → 배경 이미지 src
     * - [data-closing-title]                → 타이틀
     * - [data-closing-description]          → 설명
     */
    mapClosingSection() {
        const closingData = this.safeGet(this.data, 'homepage.customFields.pages.index.sections.0.closing');

        const bgImg = this.safeSelect('[data-closing-section] img.quote-bg');
        if (bgImg) {
            const images = (closingData?.images || [])
                .filter(img => img.isSelected === true)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            if (images.length > 0) {
                bgImg.src = images[0].url;
                bgImg.classList.remove('empty-image-placeholder');
            } else {
                bgImg.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                bgImg.classList.add('empty-image-placeholder');
            }
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
        const mapper = new IndexMapper();
        await mapper.initialize();
        window.dispatchEvent(new CustomEvent('mapperReady'));
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexMapper;
} else {
    window.IndexMapper = IndexMapper;
}

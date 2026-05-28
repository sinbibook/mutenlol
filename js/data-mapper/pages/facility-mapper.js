/**
 * Facility Page Data Mapper
 * facility.html 전용 매핑 함수들을 포함한 클래스
 * URL 파라미터 ?id=... 로 시설을 선택하여 동적으로 매핑
 */
class FacilityMapper extends BaseDataMapper {

    async mapPage() {
        if (!this.isDataLoaded) return;

        try {
            const facility = this.getCurrentFacility();
            if (!facility) return;

            this.updateMetaTags({
                title: `${this.sanitizeText(facility.name, '부대시설')} - ${this.getPropertyName()}`,
                description: facility.description || this.data.property?.description || ''
            });

            this.mapHeroSection();
            this.mapFacilityInfo();
            this.mapGallery();
            this.mapSpecialSection();
            this.reinitializeSliders();
        } catch (error) {
            console.error('FacilityMapper mapPage error:', error);
        }
    }

    reinitializeSliders() {
        if (typeof window.initCon2HeroSlider === 'function') window.initCon2HeroSlider();
        if (typeof window.initSpecialSection === 'function') window.initSpecialSection();
    }

    // ============================================================================
    // 🔧 현재 시설 선택
    // ============================================================================

    getCurrentFacility() {
        if (!this.isDataLoaded || !this.data.property?.facilities) return null;

        const urlParams = new URLSearchParams(window.location.search);
        const facilityId = urlParams.get('id');
        const facilities = this.data.property.facilities;

        if (!facilityId && facilities.length > 0) {
            const sorted = [...facilities].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            navigateTo('facility', sorted[0].id);
            return null;
        }
        if (!facilityId) return null;

        return facilities.find(f => f.id === facilityId) || null;
    }

    getFacilityImages(facility) {
        return (facility.images || [])
            .filter(img => img.isSelected !== false && img.url)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    // ============================================================================
    // 🎯 HERO SECTION
    // ============================================================================

    mapHeroSection() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        const container = this.safeSelect('[data-facility-hero-images]');
        if (!container) return;

        container.innerHTML = '';

        const images = this.getFacilityImages(facility);

        const totalEl = this.safeSelect('.arrow-num-total');
        if (totalEl) {
            totalEl.textContent = String(Math.max(1, images.length)).padStart(2, '0');
        }

        if (images.length === 0) {
            const div = document.createElement('div');
            div.className = 'bg-slide is-active empty-image-placeholder';
            div.style.backgroundImage = `url("${ImageHelpers.EMPTY_IMAGE_WITH_ICON}")`;
            container.appendChild(div);
            return;
        }

        images.forEach((img, i) => {
            const div = document.createElement('div');
            div.className = i === 0 ? 'bg-slide is-active' : 'bg-slide';
            div.style.backgroundImage = `url("${img.url}")`;
            div.setAttribute('role', 'img');
            div.setAttribute('aria-label', this.sanitizeText(img.description, `부대시설 이미지 ${i + 1}`));
            container.appendChild(div);
        });
    }

    // ============================================================================
    // 📋 FACILITY INFO (시설명 / 설명 / 이용안내 / 이미지 3장)
    // ============================================================================

    mapFacilityInfo() {
        const facility = this.getCurrentFacility();
        if (!facility) return;

        // 시설명
        const nameEl = this.safeSelect('[data-facility-name]');
        if (nameEl) nameEl.textContent = this.sanitizeText(facility.name, '시설명');

        // 시설 설명
        const descEl = this.safeSelect('[data-facility-desc]');
        if (descEl) descEl.innerHTML = this._formatTextWithLineBreaks(facility.description, '시설 설명');

        // 이용 안내
        const guideEl = this.safeSelect('[data-facility-usage-guide]');
        if (guideEl) guideEl.innerHTML = this._formatTextWithLineBreaks(facility.usageGuide, '이용 안내');

        // 이미지 3장
        const images = this.getFacilityImages(facility);
        const getUrl = (i) => images[i]?.url || null;

        const img2 = this.safeSelect('.img2-icon');
        if (img2) {
            const url = getUrl(0);
            img2.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img2.classList.toggle('empty-image-placeholder', !url);
        }

        const img1 = this.safeSelect('.img1-icon7');
        if (img1) {
            const url = getUrl(1) || getUrl(0);
            img1.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img1.classList.toggle('empty-image-placeholder', !url);
        }

        const img3 = this.safeSelect('.img3-icon');
        if (img3) {
            const url = getUrl(2) || getUrl(0);
            img3.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            img3.classList.toggle('empty-image-placeholder', !url);
        }
    }

    // ============================================================================
    // 🖼️ GALLERY (Specials 01~05 롤링)
    // ============================================================================

    mapGallery() {
        const facilities = this.safeGet(this.data, 'property.facilities');
        if (!facilities || !Array.isArray(facilities)) return;

        const sorted = [...facilities].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        if (sorted.length === 0) return;

        const con2 = this.safeSelect('.con2');
        if (!con2) return;

        con2.innerHTML = '';

        const createItem = (facility, index, ariaHidden = false) => {
            const firstImg = this.getFacilityImages(facility)[0];
            const url = firstImg?.url || null;
            const div = document.createElement('div');
            div.className = 'img14';
            div.style.backgroundImage = url
                ? `url("${url}")`
                : `url("${ImageHelpers.EMPTY_IMAGE_WITH_ICON}")`;
            if (!url) div.classList.add('empty-image-placeholder');
            if (ariaHidden) {
                div.setAttribute('aria-hidden', 'true');
            } else {
                div.style.cursor = 'pointer';
                div.addEventListener('click', () => {
                    window.location.href = `./facility.html?id=${facility.id}`;
                });
            }
            const label = document.createElement('div');
            label.className = 'specials-01';
            label.textContent = `Specials ${String(index + 1).padStart(2, '0')}`;
            div.appendChild(label);
            return div;
        };

        // 최소 5개 보이도록 순환 반복
        const MIN_ITEMS = 5;
        const displayItems = [];
        while (displayItems.length < MIN_ITEMS) {
            sorted.forEach((f, i) => {
                if (displayItems.length < MIN_ITEMS) displayItems.push({ f, i });
            });
        }

        displayItems.forEach(({ f, i }) => con2.appendChild(createItem(f, i, false)));
        displayItems.forEach(({ f, i }) => con2.appendChild(createItem(f, i, true)));

        // 아이템 수에 맞게 CSS 애니메이션 이동 거리 동적 조정 (360px + gap 20px)
        const totalWidth = displayItems.length * (360 + 20);
        let styleEl = document.getElementById('facility-gallery-anim');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'facility-gallery-anim';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = `@keyframes facility-con2-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-${totalWidth}px); } }`;
    }

    // ============================================================================
    // ✨ SPECIAL SECTION (index-mapper.js mapFacilitySection과 동일 패턴)
    // ============================================================================

    mapSpecialSection() {
        const facilities = this.safeGet(this.data, 'property.facilities');
        if (!facilities || !Array.isArray(facilities) || facilities.length === 0) return;

        const sorted = [...facilities].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        // 좌측 카드 이미지
        const cardImgWrap = this.safeSelect('.facility-page .specials-card-img-wrap');
        if (cardImgWrap) {
            const border = cardImgWrap.querySelector('.specials-card-img-border');
            cardImgWrap.innerHTML = '';
            if (border) cardImgWrap.appendChild(border);

            sorted.forEach((facility, i) => {
                const firstImg = this.getFacilityImages(facility)[0];
                const imgEl = document.createElement('img');
                imgEl.className = i === 0 ? 'specials-card-img active' : 'specials-card-img';
                imgEl.loading = 'lazy';
                imgEl.alt = this.sanitizeText(facility.name, '');
                imgEl.setAttribute('data-index', String(i));
                imgEl.src = firstImg?.url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                if (!firstImg) imgEl.classList.add('empty-image-placeholder');
                cardImgWrap.appendChild(imgEl);
            });
        }

        // 우측 bg 슬라이드
        const specialImage = this.safeSelect('.facility-page .special-image');
        if (specialImage) {
            const slideNav = specialImage.querySelector('.slide');
            specialImage.innerHTML = '';

            sorted.forEach((facility, i) => {
                const firstImg = this.getFacilityImages(facility)[0];
                const div = document.createElement('div');
                div.className = i === 0 ? 'special-image-slide active' : 'special-image-slide';
                div.setAttribute('data-index', String(i));
                div.style.backgroundImage = firstImg
                    ? `url("${firstImg.url}")`
                    : `url("${ImageHelpers.EMPTY_IMAGE_WITH_ICON}")`;
                if (!firstImg) div.classList.add('empty-image-placeholder');
                specialImage.appendChild(div);
            });

            if (slideNav) specialImage.appendChild(slideNav);
        }

        // data-titles
        const titleEl = this.safeSelect('.facility-page .specials-card-title');
        if (titleEl) {
            const titles = sorted.map(f => this.sanitizeText(f.name, ''));
            titleEl.setAttribute('data-titles', titles.join('|'));
            if (titles[0]) titleEl.textContent = titles[0];
        }

        // data-descs
        const descEl = this.safeSelect('.facility-page .specials-card-desc');
        if (descEl) {
            const descs = sorted.map(f =>
                (this.sanitizeText(f.description, '') || '').replace(/\n/g, '||')
            );
            descEl.setAttribute('data-descs', descs.join('@@'));
            const firstDesc = sorted[0]?.description;
            if (firstDesc) {
                descEl.innerHTML = firstDesc.split('\n').slice(0, 2)
                    .map(line => `<p>${this._escapeHTML(line)}</p>`).join('');
            }
        }

        // data-links
        const linkEl = this.safeSelect('.facility-page .view-more-link');
        if (linkEl) {
            const links = sorted.map(f => `./facility.html?id=${f.id}`);
            linkEl.setAttribute('data-links', links.join('|'));
            if (links[0]) linkEl.setAttribute('href', links[0]);
        }
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

if (typeof window !== 'undefined' && window.parent === window) {
    document.addEventListener('DOMContentLoaded', async () => {
        const mapper = new FacilityMapper();
        await mapper.initialize();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FacilityMapper;
} else {
    window.FacilityMapper = FacilityMapper;
}

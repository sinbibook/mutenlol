/**
 * Reservation Page Data Mapper
 * reservation.html 전용 매핑 함수들을 포함한 클래스
 */
class ReservationMapper extends BaseDataMapper {

    async mapPage() {
        if (!this.isDataLoaded) return;

        try {
            this.updateMetaTags({
                title: `예약안내 - ${this.getPropertyName()}`,
                description: this.data.property?.description || ''
            });
            this.mapHeroSection();
            this.mapContentImages();
            this.mapUsageSection();
            this.mapReservationGuideSection();
            this.mapCheckInOutSection();
            this.mapRefundNoticeSection();
            this.mapCancellationTable();
            this.mapClosingSection();
            this.reinitializeSliders();
        } catch (error) {
            console.error('ReservationMapper mapPage error:', error);
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
     * homepage.customFields.pages.reservation.sections.0.hero.images → [data-reservation-hero-images]
     * bg-slide div 구조 (background-image inline style)
     */
    mapHeroSection() {
        const container = this.safeSelect('[data-reservation-hero-images]');
        if (!container) return;

        container.innerHTML = '';

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0.hero');
        const images = (heroData?.images || [])
            .filter(img => img.isSelected === true)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

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
            div.style.backgroundImage = `url("${img.url}")`;
            div.setAttribute('role', 'img');
            div.setAttribute('aria-label', this.sanitizeText(img.description, `예약안내 이미지 ${i + 1}`));
            container.appendChild(div);
        });
    }

    // ============================================================================
    // 🖼️ CONTENT IMAGES
    // ============================================================================

    /**
     * 콘텐츠 이미지 3장 매핑
     * homepage.customFields.pages.reservation.sections.0.about.images → [data-reservation-content-images]
     */
    mapContentImages() {
        const container = this.safeSelect('[data-reservation-content-images]');
        if (!container) return;

        const aboutData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0.about');
        const images = (aboutData?.images || [])
            .filter(img => img.isSelected === true)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        const getUrl = (i) => images[i]?.url || null;
        const imgEls = container.querySelectorAll('img');

        imgEls.forEach((imgEl, i) => {
            const url = getUrl(i);
            imgEl.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            imgEl.classList.toggle('empty-image-placeholder', !url);
        });
    }

    // ============================================================================
    // 📋 TAB SECTIONS
    // ============================================================================

    /**
     * 이용 안내 매핑
     * property.usageGuide → [data-usage-guide]
     */
    mapUsageSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const el = this.safeSelect('[data-usage-guide]');
        if (el && this.data.property.usageGuide) {
            el.innerHTML = this._formatTextWithLineBreaks(this.data.property.usageGuide);
        }
    }

    /**
     * 예약 안내 매핑
     * property.reservationGuide → [data-reservation-guide]
     */
    mapReservationGuideSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const el = this.safeSelect('[data-reservation-guide]');
        if (el && this.data.property.reservationGuide) {
            el.innerHTML = this._formatTextWithLineBreaks(this.data.property.reservationGuide);
        }
    }

    /**
     * 입/퇴실 안내 매핑
     * property.checkInOutInfo + checkin/checkout → [data-checkin-info]
     */
    mapCheckInOutSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const el = this.safeSelect('[data-checkin-info]');
        if (!el) return;

        const checkin = property.checkin || '-';
        const checkout = property.checkout || '-';
        const info = property.checkInOutInfo || '';

        const header = `체크인 ${checkin} / 체크아웃 ${checkout}`;
        const body = info ? `\n${info}` : '';
        el.innerHTML = this._formatTextWithLineBreaks(header + body);
    }

    /**
     * 환불 규정 안내 매핑
     * property.refundSettings.customerRefundNotice → [data-refund-notice]
     */
    mapRefundNoticeSection() {
        if (!this.isDataLoaded) return;

        const refundSettings = this.safeGet(this.data, 'property.refundSettings');
        const el = this.safeSelect('[data-refund-notice]');
        if (el && refundSettings?.customerRefundNotice) {
            el.innerHTML = this._formatTextWithLineBreaks(refundSettings.customerRefundNotice);
        }
    }

    /**
     * 취소수수료 테이블 동적 생성
     * property.refundPolicies[] → [data-cancellation-table] .txt1 / .txt22
     */
    mapCancellationTable() {
        if (!this.isDataLoaded) return;

        const box = this.safeSelect('[data-cancellation-table]');
        if (!box) return;

        const refundPolicies = this.safeGet(this.data, 'property.refundPolicies');
        if (!refundPolicies || !Array.isArray(refundPolicies)) return;

        const sorted = [...refundPolicies]
            .filter(p => p.refundProcessingDays !== undefined && p.refundRate !== undefined)
            .sort((a, b) => b.refundProcessingDays - a.refundProcessingDays);

        if (sorted.length === 0) return;

        const txt1 = box.querySelector('.txt1');
        const txt22 = box.querySelector('.txt22');

        if (txt1) {
            txt1.innerHTML = '<b class="b21"><p class="p6">취소</p><p class="p7">수수료</p></b>';
            sorted.forEach(policy => {
                const b = document.createElement('b');
                b.className = 'b21';
                const day = policy.refundProcessingDays === 0 ? '당일' : `${policy.refundProcessingDays}일 전`;
                b.innerHTML = `<p class="p6">${this.sanitizeText(day)}</p><p class="p7">취소</p>`;
                txt1.appendChild(b);
            });
        }

        if (txt22) {
            txt22.innerHTML = '<b class="b21"><p class="p6">이용일</p><p class="p7">기준</p></b>';
            sorted.forEach(policy => {
                const b = document.createElement('b');
                b.className = 'b21';
                const rate = `${policy.refundRate}%`;
                b.innerHTML = `<p class="p6">${this.sanitizeText(rate)}</p><p class="p7">환불</p>`;
                txt22.appendChild(b);
            });
        }
    }

    // ============================================================================
    // 🎬 CLOSING SECTION
    // ============================================================================

    /**
     * Closing 섹션 매핑 (index closing 데이터 재사용)
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
        const mapper = new ReservationMapper();
        await mapper.initialize();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReservationMapper;
} else {
    window.ReservationMapper = ReservationMapper;
}

/**
 * Reservation Page Data Mapper
 * reservation.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 예약 페이지 전용 기능 제공
 */
class ReservationMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 📅 RESERVATION PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * Hero 섹션 매핑 (Fullscreen Slider)
     */
    mapHeroSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const reservationData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0');
        const sliderInner = document.querySelector('.fullscreen-slider-inner');
        if (!sliderInner) return;

        // Fullscreen Slider 이미지 필터링 및 정렬
        const heroImages = reservationData?.hero?.images;
        const selectedImages = heroImages
            ?.filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];

        sliderInner.innerHTML = '';

        if (selectedImages.length === 0) {
            // 이미지가 없을 때 placeholder 슬라이드 추가
            const slide = document.createElement('div');
            slide.className = 'fullscreen-slide active';
            const img = document.createElement('img');
            ImageHelpers.applyPlaceholder(img);
            slide.appendChild(img);
            sliderInner.appendChild(slide);
            return;
        }

        // 이미지가 있으면 슬라이드 생성
        selectedImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `fullscreen-slide${index === 0 ? ' active' : ''}`;
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.description || '예약안내';
            img.loading = index === 0 ? 'eager' : 'lazy';
            slide.appendChild(img);
            sliderInner.appendChild(slide);
        });

        // Fullscreen Slider 컴포넌트 재초기화
        if (typeof FullscreenSlider !== 'undefined') {
            new FullscreenSlider('.fullscreen-slider');
        }
    }

    /**
     * 예약 정보 섹션 매핑
     */
    mapReservationInfoSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const reservationData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0');

        // CUSTOM FIELD 제목 매핑 (about.title)
        const reservationTitle = this.safeSelect('[data-reservation-title]');
        if (reservationTitle) {
            reservationTitle.textContent = this.sanitizeText(reservationData?.about?.title, '예약정보 타이틀');
        }

        // CUSTOM FIELD 설명 매핑 (about.description)
        const reservationDescription = this.safeSelect('[data-reservation-description]');
        if (reservationDescription) {
            reservationDescription.innerHTML = this._formatTextWithLineBreaks(
                reservationData?.about?.description,
                '예약정보 설명'
            );
        }
    }


    /**
     * 이용안내 섹션 매핑 (data-usage-guide)
     */
    mapUsageSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const usageGuideElement = this.safeSelect('[data-usage-guide]');

        if (usageGuideElement && property.usageGuide) {
            usageGuideElement.innerHTML = this._formatTextWithLineBreaks(property.usageGuide);
        }
    }

    /**
     * 입/퇴실 안내 섹션 매핑
     */
    mapCheckInOutSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // 체크인 시간 매핑
        const checkinTime = this.safeSelect('[data-checkin-time]');
        if (checkinTime && property.checkin) {
            checkinTime.textContent = this.formatTime(property.checkin);
        }

        // 체크아웃 시간 매핑
        const checkoutTime = this.safeSelect('[data-checkout-time]');
        if (checkoutTime && property.checkout) {
            checkoutTime.textContent = this.formatTime(property.checkout);
        }

        // 운영정보 텍스트 매핑
        const operationInfo = this.safeSelect('[data-operation-info]');
        if (operationInfo && property.checkInOutInfo) {
            operationInfo.innerHTML = this._formatTextWithLineBreaks(property.checkInOutInfo);
        }

        // 예약안내 텍스트 매핑
        const reservationGuide = this.safeSelect('[data-reservation-guide]');
        if (reservationGuide && property.reservationGuide) {
            reservationGuide.innerHTML = this._formatTextWithLineBreaks(property.reservationGuide);
        }
    }

    /**
     * 환불규정 섹션 매핑 (data-refund-notes)
     */
    mapRefundSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const refundNotesElement = this.safeSelect('[data-refund-notes]');
        const refundTextSection = this.safeSelect('.refund-text-section');

        if (refundNotesElement) {
            if (property.refundSettings?.customerRefundNotice) {
                refundNotesElement.innerHTML = this._formatTextWithLineBreaks(property.refundSettings.customerRefundNotice);
                if (refundTextSection) refundTextSection.style.display = '';
            } else {
                if (refundTextSection) refundTextSection.style.display = 'none';
            }
        }

        // property.refundPolicies를 취소 수수료 테이블로 매핑
        if (property.refundPolicies) {
            this.mapRefundPolicies(property.refundPolicies);
        }
    }

    /**
     * 환불 정책 테이블 매핑
     */
    mapRefundPolicies(refundPolicies) {
        const tableBody = this.safeSelect('.refund-table-body');
        if (!tableBody || !refundPolicies || !Array.isArray(refundPolicies)) return;

        tableBody.innerHTML = '';
        refundPolicies.forEach(policy => {
            const row = document.createElement('tr');

            // refundProcessingDays를 기반으로 취소 시점 텍스트 생성
            let period;
            if (policy.refundProcessingDays === 0) {
                period = '이용일 당일';
            } else if (policy.refundProcessingDays === 1) {
                period = '이용일 1일 전';
            } else {
                period = `이용일 ${policy.refundProcessingDays}일 전`;
            }

            // refundRate를 기반으로 환불율 텍스트 생성
            const refundRateText = policy.refundRate === 0 ? '환불 불가' : `${policy.refundRate}% 환불`;

            row.innerHTML = `
                <td>${period}</td>
                <td class="${policy.refundRate === 0 ? 'no-refund' : ''}">${refundRateText}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Reservation 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            console.error('Cannot map reservation page: data not loaded');
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapHeroSection();
        this.mapReservationInfoSection();
        this.mapUsageSection();
        this.mapCheckInOutSection();
        this.mapRefundSection();

        // 메타 태그 업데이트 (페이지별 SEO 적용)
        const property = this.data.property;
        const reservationData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0.hero');
        const pageSEO = {
            title: property?.name ? `예약안내 - ${property.name}` : 'SEO 타이틀',
            description: reservationData?.description || property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // OG 이미지 업데이트 (hero 이미지 사용)
        this.updateOGImage(reservationData);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }

    /**
     * OG 이미지 업데이트 (reservation hero 이미지 사용, 없으면 로고)
     * @param {Object} reservationData - reservation hero 섹션 데이터
     */
    updateOGImage(reservationData) {
        if (!this.isDataLoaded) return;

        const ogImage = this.safeSelect('meta[property="og:image"]');
        if (!ogImage) return;

        // 우선순위: hero 이미지 > 로고 이미지
        if (reservationData?.images && reservationData.images.length > 0 && reservationData.images[0]?.url) {
            ogImage.setAttribute('content', reservationData.images[0].url);
        } else {
            const defaultImage = this.getDefaultOGImage();
            if (defaultImage) {
                ogImage.setAttribute('content', defaultImage);
            }
        }
    }

    /**
     * Reservation 페이지 텍스트만 업데이트
     */
    mapReservationText() {
        if (!this.isDataLoaded) return;

        // 순차적으로 각 섹션 텍스트 매핑
        this.mapHeroSection();
        this.mapReservationInfoSection();
        this.mapUsageSection();
        this.mapCheckInOutSection();
        this.mapRefundSection();
    }

    /**
     * 네비게이션 함수 설정
     */
    setupNavigation() {
        // 홈으로 이동 함수 설정
        window.navigateToHome = () => {
            window.location.href = './index.html';
        };
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReservationMapper;
} else {
    window.ReservationMapper = ReservationMapper;
}

// DOMContentLoaded 초기화
document.addEventListener('DOMContentLoaded', async () => {
    const reservationMapper = new ReservationMapper();
    try {
        await reservationMapper.loadData();
        await reservationMapper.mapPage();
    } catch (error) {
        console.error('Error initializing reservation mapper:', error);
    }
});

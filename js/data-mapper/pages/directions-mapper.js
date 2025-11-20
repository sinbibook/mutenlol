/**
 * Directions Page Data Mapper
 * directions.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 오시는길 페이지 전용 기능 제공
 */
class DirectionsMapper extends BaseDataMapper {
    // Kakao Map 설정 상수
    static KAKAO_MAP_ZOOM_LEVEL = 5;
    static SDK_WAIT_INTERVAL = 100; // ms

    constructor() {
        super();
    }

    // ============================================================================
    // 🗺️ DIRECTIONS PAGE MAPPINGS
    // ============================================================================

    /**
     * Fullscreen Slider 섹션 매핑
     */
    mapSliderSection() {
        if (!this.isDataLoaded) return;

        const directionsData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0');
        if (!directionsData) return;

        // 슬라이더 이미지 매핑
        if (directionsData.hero?.images && Array.isArray(directionsData.hero.images)) {
            this.mapSliderImages(directionsData.hero.images);
        }
    }

    /**
     * Slider Images 동적 생성
     */
    mapSliderImages(images) {
        const sliderContainer = this.safeSelect('[data-directions-slider]');
        if (!sliderContainer) return;

        // isSelected가 true인 이미지만 필터링하고 sortOrder로 정렬
        const selectedImages = images
            .filter(img => img.isSelected === true)
            .sort((a, b) => a.sortOrder - b.sortOrder);

        // 슬라이더 초기화
        sliderContainer.innerHTML = '';

        if (selectedImages.length === 0) {
            // 이미지가 없을 경우 placeholder 슬라이드 추가
            const slideDiv = document.createElement('div');
            slideDiv.className = 'fullscreen-slide active';

            const imgElement = document.createElement('img');
            ImageHelpers.applyPlaceholder(imgElement);

            slideDiv.appendChild(imgElement);
            sliderContainer.appendChild(slideDiv);
            return;
        }

        // 이미지 생성
        selectedImages.forEach((img, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'fullscreen-slide';
            if (index === 0) {
                slideDiv.classList.add('active');
            }

            const imgElement = document.createElement('img');
            imgElement.src = img.url;
            imgElement.alt = this.sanitizeText(img.description, '오시는길 이미지');
            imgElement.loading = index === 0 ? 'eager' : 'lazy';

            slideDiv.appendChild(imgElement);
            sliderContainer.appendChild(slideDiv);
        });
    }

    /**
     * Location Info 섹션 매핑 (타이틀, 주소)
     */
    mapLocationInfo() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');

        // 타이틀 매핑 - customFields hero.title 사용
        const titleElement = this.safeSelect('[data-directions-title]');
        if (titleElement) {
            titleElement.textContent = this.sanitizeText(heroData?.title, '오시는길 히어로 타이틀');
        }

        // 주소 매핑
        const addressElement = this.safeSelect('[data-directions-address]');
        if (addressElement) {
            addressElement.textContent = this.sanitizeText(property?.address, '숙소 주소');
        }
    }

    /**
     * Notes 섹션 매핑 (안내사항)
     */
    mapNotesSection() {
        if (!this.isDataLoaded) return;

        const directionsData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0');
        const notesElement = this.safeSelect('[data-directions-notes]');

        if (!notesElement) return;

        // notice 데이터가 있으면 description 사용
        if (directionsData?.notice?.description) {
            notesElement.textContent = this.sanitizeText(directionsData.notice.description);
            notesElement.style.display = '';
        } else {
            // 데이터가 없으면 숨김
            notesElement.style.display = 'none';
        }
    }

    /**
     * 카카오맵 초기화 및 표시
     */
    initKakaoMap() {
        if (!this.isDataLoaded || !this.data.property) {
            return;
        }

        const property = this.data.property;
        const mapContainer = document.getElementById('kakao-map');

        if (!mapContainer || !property.latitude || !property.longitude) {
            return;
        }

        // 지도 생성 함수
        const createMap = () => {
            try {
                // 검색 쿼리 및 URL 생성 (한 번만)
                const searchQuery = property.address || property.name || '선택한 위치';
                const kakaoMapUrl = `https://map.kakao.com/?q=${encodeURIComponent(searchQuery)}`;
                const openKakaoMap = () => window.open(kakaoMapUrl, '_blank');

                // 지도 중심 좌표
                const mapCenter = new kakao.maps.LatLng(property.latitude, property.longitude);

                // 지도 옵션
                const mapOptions = {
                    center: mapCenter,
                    level: DirectionsMapper.KAKAO_MAP_ZOOM_LEVEL,
                    draggable: false,
                    scrollwheel: false,
                    disableDoubleClick: true,
                    disableDoubleClickZoom: true
                };

                // 지도 생성
                const map = new kakao.maps.Map(mapContainer, mapOptions);
                map.setZoomable(false);

                // 마커 생성 및 클릭 이벤트
                const marker = new kakao.maps.Marker({
                    position: mapCenter,
                    map: map
                });
                kakao.maps.event.addListener(marker, 'click', openKakaoMap);

                // 인포윈도우 콘텐츠 DOM 생성 및 이벤트 핸들러 연결
                const infowindowContent = document.createElement('div');
                infowindowContent.style.cssText = 'padding:5px; font-size:14px; cursor:pointer;';
                infowindowContent.innerHTML = `${property.name}<br/><small style="color:#666;">클릭하면 카카오맵으로 이동</small>`;
                infowindowContent.addEventListener('click', openKakaoMap);

                const infowindow = new kakao.maps.InfoWindow({
                    content: infowindowContent
                });
                infowindow.open(map, marker);
            } catch (error) {
                console.error('Failed to create Kakao Map:', error);
            }
        };

        // SDK 로드 확인 및 지도 생성
        const checkSdkAndLoad = (retryCount = 0) => {
            const MAX_RETRIES = 20; // 20 * 100ms = 2초
            if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
                // kakao.maps.load() 공식 API 사용
                window.kakao.maps.load(createMap);
            } else if (retryCount < MAX_RETRIES) {
                // SDK가 아직 로드되지 않았으면 대기
                setTimeout(() => checkSdkAndLoad(retryCount + 1), DirectionsMapper.SDK_WAIT_INTERVAL);
            } else {
                console.error('Failed to load Kakao Map SDK after multiple retries.');
            }
        };

        checkSdkAndLoad();
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Directions 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapSliderSection(); // 풀스크린 슬라이더 매핑
        this.mapLocationInfo(); // 타이틀, 주소 매핑
        this.mapNotesSection(); // 안내사항 매핑
        this.initKakaoMap(); // 카카오맵 초기화 및 표시

        // 메타 태그 업데이트 (페이지별 SEO 적용)
        const property = this.data.property;
        const directionsData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');
        const pageSEO = {
            title: property?.name ? `오시는길 - ${property.name}` : 'SEO 타이틀',
            description: directionsData?.description || property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // OG 이미지 업데이트 (hero 이미지 사용)
        this.updateOGImage(directionsData);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();

        // 슬라이더 재초기화
        this.reinitializeSlider();

        // 페이지 스크립트 재초기화
        this.reinitializePageScripts();
    }

    /**
     * 슬라이더 재초기화
     */
    reinitializeSlider() {
        // FullscreenSlider 재초기화
        if (typeof window.FullscreenSlider === 'function') {
            const sliderContainer = document.querySelector('.fullscreen-slider-container');
            if (sliderContainer && document.querySelectorAll('.fullscreen-slide').length > 0) {
                new window.FullscreenSlider('.fullscreen-slider-container', {
                    slideDuration: 4000,
                    autoplay: true,
                    enableSwipe: true,
                    enableKeyboard: true
                });
            }
        }
    }

    /**
     * 페이지 스크립트 재초기화 (directions.js 함수들 호출)
     */
    reinitializePageScripts() {
        // location notes 초기화 (directions.js에서 정의)
        if (typeof window.initializeLocationNotes === 'function') {
            window.initializeLocationNotes();
        }

        // scroll animations 초기화 (directions.js에서 정의)
        if (typeof window.setupScrollAnimations === 'function') {
            window.setupScrollAnimations();
        }
    }

    /**
     * OG 이미지 업데이트 (directions hero 이미지 사용, 없으면 로고)
     * @param {Object} directionsData - directions hero 섹션 데이터
     */
    updateOGImage(directionsData) {
        if (!this.isDataLoaded) return;

        const ogImage = this.safeSelect('meta[property="og:image"]');
        if (!ogImage) return;

        // 우선순위: hero 이미지 > 로고 이미지
        if (directionsData?.images && directionsData.images.length > 0 && directionsData.images[0]?.url) {
            ogImage.setAttribute('content', directionsData.images[0].url);
        } else {
            const defaultImage = this.getDefaultOGImage();
            if (defaultImage) {
                ogImage.setAttribute('content', defaultImage);
            }
        }
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

// 페이지 로드 시 자동 초기화
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        const mapper = new DirectionsMapper();
        await mapper.initialize();
    });
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DirectionsMapper;
} else {
    window.DirectionsMapper = DirectionsMapper;
}
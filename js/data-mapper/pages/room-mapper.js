/**
 * Room Page Data Mapper
 * room.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 객실 페이지 전용 기능 제공
 * URL 파라미터로 ?index=0,1,2...를 받아서 동적으로 객실 정보 표시
 */
class RoomMapper extends BaseDataMapper {
    constructor() {
        super();
        this.currentRoom = null;
        this.currentRoomIndex = null;
        this.currentRoomPageData = null;
    }

    // ============================================================================
    // 🏠 ROOM PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * 현재 객실 정보 가져오기 (URL 파라미터 기반)
     */
    getCurrentRoom() {
        if (!this.isDataLoaded || !this.data.rooms) {
            console.error('Data not loaded or no rooms data available');
            return null;
        }

        // URL에서 room id 추출
        const urlParams = new URLSearchParams(window.location.search);
        let roomId = urlParams.get('id');

        // id가 없으면 첫 번째 room으로 리다이렉트
        if (!roomId && this.data.rooms.length > 0) {
            console.warn('Room id not specified, redirecting to first room');
            window.location.href = `room.html?id=${this.data.rooms[0].id}`;
            return null;
        }

        if (!roomId) {
            console.error('Room id not specified in URL and no rooms available');
            return null;
        }

        // rooms 배열에서 해당 id의 객실 찾기
        const roomIndex = this.data.rooms.findIndex(room => room.id === roomId);

        if (roomIndex === -1) {
            console.error(`Room with id ${roomId} not found`);
            return null;
        }

        const room = this.data.rooms[roomIndex];
        this.currentRoom = room;
        this.currentRoomIndex = roomIndex; // 인덱스도 저장 (페이지 데이터 접근용)
        return room;
    }

    /**
     * 현재 객실 인덱스 가져오기
     */
    getCurrentRoomIndex() {
        if (this.currentRoomIndex !== undefined) {
            return this.currentRoomIndex;
        }

        // getCurrentRoom()이 호출되지 않았을 경우를 위한 fallback
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('id');

        if (roomId && this.data.rooms) {
            const index = this.data.rooms.findIndex(room => room.id === roomId);
            if (index !== -1) {
                this.currentRoomIndex = index;
                return index;
            }
        }

        return null;
    }

    /**
     * 현재 객실 페이지 데이터 가져오기 (캐시 포함)
     */
    getCurrentRoomPageData() {
        // 현재 room을 먼저 가져와서 캐시가 유효한지 확인
        const room = this.getCurrentRoom();
        if (!room || !room.id) {
            return null;
        }

        // 캐시된 데이터가 있고 같은 room이면 바로 반환
        if (this.currentRoomPageData && this.currentRoomPageData.id === room.id) {
            return this.currentRoomPageData;
        }

        const roomPages = this.safeGet(this.data, 'homepage.customFields.pages.room');
        if (!roomPages || !Array.isArray(roomPages)) {
            return null;
        }

        // pages.room 배열에서 현재 room.id와 일치하는 페이지 데이터 찾기
        const pageData = roomPages.find(page => page.id === room.id);
        if (!pageData) {
            return null;
        }

        // 캐시 저장
        this.currentRoomPageData = {
            id: room.id,
            data: pageData
        };

        return this.currentRoomPageData;
    }

    /**
     * Fullscreen Slider 섹션 매핑 (페이지 상단)
     */
    mapSliderSection() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const sliderContainer = this.safeSelect('[data-room-slider]');
        if (!sliderContainer) return;

        // JSON 구조에 따라 interior 이미지 배열 가져오기
        const interiorImages = room.images?.[0]?.interior;

        // 이미지가 없으면 빈 이미지 표시
        if (!interiorImages || interiorImages.length === 0) {
            sliderContainer.innerHTML = `
                <div class="fullscreen-slide active">
                    <img alt="이미지 없음">
                </div>
            `;
            const img = sliderContainer.querySelector('img');
            ImageHelpers.applyPlaceholder(img);

            // Total 카운트 업데이트
            const navTotal = this.safeSelect('.nav-total');
            if (navTotal) navTotal.textContent = '01';
            return;
        }

        // 기존 슬라이드 제거
        sliderContainer.innerHTML = '';

        // isSelected가 true인 이미지만 필터링하고 sortOrder로 정렬
        const sortedImages = interiorImages
            .filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        // 슬라이드 생성
        sortedImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `fullscreen-slide ${index === 0 ? 'active' : ''}`;

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.description || room.name;
            img.loading = index === 0 ? 'eager' : 'lazy';
            img.setAttribute('data-image-fallback', '');

            slide.appendChild(img);
            sliderContainer.appendChild(slide);
        });

        // Total 카운트 업데이트
        const navTotal = this.safeSelect('.nav-total');
        if (navTotal) {
            navTotal.textContent = String(sortedImages.length).padStart(2, '0');
        }

        // Fullscreen Slider 재초기화
        this.reinitializeSlider();
    }

    /**
     * Fullscreen Slider 재초기화
     */
    reinitializeSlider() {
        const sliderContainer = this.safeSelect('.fullscreen-slider-container');
        if (!sliderContainer || typeof FullscreenSlider !== 'function') {
            return;
        }

        // 기존 슬라이더 인스턴스 제거
        if (window.fullscreenSlider) {
            window.fullscreenSlider = null;
        }

        // 새 슬라이더 인스턴스 생성 (selector 문자열 전달)
        window.fullscreenSlider = new FullscreenSlider('.fullscreen-slider-container');
    }

    /**
     * 기본 정보 섹션 매핑 (객실명, 썸네일, 설명)
     */
    mapBasicInfo() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 객실명 매핑 (시스템 데이터)
        const roomName = this.safeSelect('[data-room-name]');
        if (roomName) {
            roomName.textContent = room.name;
        }

        // 썸네일 이미지 매핑 (시스템 데이터)
        const roomThumbnail = this.safeSelect('[data-room-thumbnail]');
        if (roomThumbnail) {
            const thumbnailImages = room.images?.[0]?.thumbnail;
            const selectedThumbnail = thumbnailImages?.find(img => img.isSelected);

            if (selectedThumbnail) {
                roomThumbnail.src = selectedThumbnail.url;
                roomThumbnail.alt = selectedThumbnail.description || room.name;
                roomThumbnail.setAttribute('data-image-fallback', '');
            } else {
                ImageHelpers.applyPlaceholder(roomThumbnail);
            }
        }

        // 객실 설명 매핑 (CUSTOM FIELD)
        const roomDescription = this.safeSelect('[data-room-description]');
        if (roomDescription) {
            const roomPageData = this.getCurrentRoomPageData();
            const heroTitle = roomPageData?.data?.sections?.[0]?.hero?.title;
            roomDescription.innerHTML = this._formatTextWithLineBreaks(heroTitle, '객실 히어로 타이틀');
        }
    }

    /**
     * 객실 정보 섹션 매핑 (Room Information 섹션)
     */
    mapRoomInfoSection() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 시스템 데이터: 객실 설명 매핑
        const roomInfoDescription = this.safeSelect('[data-room-info-description]');
        if (roomInfoDescription) {
            roomInfoDescription.innerHTML = this._formatTextWithLineBreaks(room.description, `${room.name}의 상세 정보입니다.`);
        }

        // 객실 내부 이미지 4장 끝에서부터 순서대로 매핑
        this.mapRoomMainImage();
        this.mapRoomThumbnails();
    }

    /**
     * 메인 이미지 매핑 (썸네일 0번째 이미지와 동일)
     */
    mapRoomMainImage() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const mainImg = this.safeSelect('[data-room-main-img]');
        if (!mainImg) return;

        const interiorImages = room.images?.[0]?.interior;
        const sortedImages = interiorImages
            ?.filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];

        // 인덱스 2번부터 4개 이미지 (2, 3, 4, 5번)
        const selectedImages = sortedImages.slice(2, 6);
        const mainImage = selectedImages[0]; // 2번 인덱스 이미지

        if (mainImage) {
            mainImg.src = mainImage.url;
            mainImg.alt = mainImage.description || room.name; // 시스템 데이터
            mainImg.setAttribute('data-image-fallback', '');
        } else {
            ImageHelpers.applyPlaceholder(mainImg);
        }
    }

    /**
     * 썸네일 이미지들 매핑 (인덱스 2번부터 4개 interior 이미지)
     */
    mapRoomThumbnails() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const thumbnailsContainer = this.safeSelect('[data-room-thumbnails]');
        if (!thumbnailsContainer) return;

        const interiorImages = room.images?.[0]?.interior;
        const sortedImages = interiorImages
            ?.filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];

        // 인덱스 2번부터 4개 이미지 가져오기 (2, 3, 4, 5번)
        let lastFourImages = sortedImages.slice(2, 6);

        // 4개가 안 되면 null로 채움 (UI 구조 유지 위해)
        while (lastFourImages.length < 4) {
            lastFourImages.push(null);
        }

        // 기존 썸네일 제거
        thumbnailsContainer.innerHTML = '';

        // 썸네일 생성 (항상 4개)
        lastFourImages.forEach((image, index) => {
            const thumbDiv = document.createElement('div');
            thumbDiv.className = 'room-thumb animate-element';
            thumbDiv.setAttribute('data-index', index);

            // 첫 번째 썸네일에 active 클래스 추가
            if (index === 0) {
                thumbDiv.classList.add('active');
            }

            const img = document.createElement('img');
            if (image && image.url) {
                img.src = image.url;
                img.alt = image.description || room.name;
                img.loading = 'lazy';
                img.setAttribute('data-image-fallback', '');
                img.classList.remove('empty-image-placeholder');
            } else {
                ImageHelpers.applyPlaceholder(img);
            }

            thumbDiv.appendChild(img);
            thumbnailsContainer.appendChild(thumbDiv);
        });

        // 썸네일이 화면에 보이는 경우 바로 animate 클래스 추가 (프리뷰 업데이트 시)
        const thumbnails = thumbnailsContainer.querySelectorAll('.room-thumb');
        thumbnails.forEach((thumb, index) => {
            setTimeout(() => {
                thumb.classList.add('animate');
            }, index * 100);
        });

        // 썸네일 클릭 이벤트 재설정 (room.js의 함수 호출)
        if (typeof window.setupRoomThumbnailInteraction === 'function') {
            window.setupRoomThumbnailInteraction();
        }
    }

    /**
     * 객실 상세 정보 매핑
     */
    mapRoomDetails() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 객실 크기 (시스템 데이터)
        const roomSize = this.safeSelect('[data-room-size]');
        if (roomSize) {
            roomSize.textContent = room.size || '-';
        }

        // 침대 타입 (시스템 데이터)
        const roomBedTypes = this.safeSelect('[data-room-bed-types]');
        if (roomBedTypes) {
            const bedTypes = room.bedTypes || [];
            roomBedTypes.textContent = bedTypes.length > 0 ? bedTypes.join(', ') : '-';
        }

        // 객실 구성 (시스템 데이터)
        const roomComposition = this.safeSelect('[data-room-composition]');
        if (roomComposition) {
            const roomStructures = room.roomStructures || [];
            roomComposition.textContent = roomStructures.length > 0 ? roomStructures.join(', ') : '-';
        }

        // 인원 (시스템 데이터)
        const roomCapacity = this.safeSelect('[data-room-capacity]');
        if (roomCapacity) {
            const capacity = `기준 ${room.baseOccupancy || 2}인 / 최대 ${room.maxOccupancy || 4}인`;
            roomCapacity.textContent = capacity;
        }

        // 체크인 (시스템 데이터)
        const roomCheckin = this.safeSelect('[data-room-checkin]');
        if (roomCheckin) {
            const checkinTime = this.data.property?.checkinTime || '15:00';
            roomCheckin.textContent = checkinTime;
        }

        // 체크아웃 (시스템 데이터)
        const roomCheckout = this.safeSelect('[data-room-checkout]');
        if (roomCheckout) {
            const checkoutTime = this.data.property?.checkoutTime || '11:00';
            roomCheckout.textContent = checkoutTime;
        }

        // 객실 이용규칙/안내사항 (시스템 데이터)
        const roomGuide = this.safeSelect('[data-room-guide]');
        if (roomGuide) {
            const roomInfo = room.roomInfo || '편안한 휴식 공간';
            roomGuide.innerHTML = this._formatTextWithLineBreaks(roomInfo);
        }
    }

    /**
     * 객실 편의시설/특징 매핑
     */
    mapRoomAmenities() {
        const room = this.getCurrentRoom();
        if (!room || !room.amenities || room.amenities.length === 0) {
            return;
        }

        const amenitiesGrid = this.safeSelect('[data-room-amenities-grid]');
        if (!amenitiesGrid) {
            return;
        }

        // 기존 어메니티 제거
        amenitiesGrid.innerHTML = '';

        // JSON 데이터의 실제 어메니티들에 맞춘 아이콘 매핑 (기존 방식 유지)
        const amenityIcons = {
            // JSON에서 나오는 실제 어메니티들
            '간이 주방': 'M3 6h18M3 6l3-3h12l3 3M3 6v15a2 2 0 002 2h14a2 2 0 002-2V6M10 12h4',
            '냉장고': 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM12 8h.01M12 16h.01',
            '전자레인지': 'M3 7h18v10H3V7zM7 7V3a1 1 0 011-1h8a1 1 0 011 1v4M9 12h6',
            '인덕션': 'M8 12a4 4 0 118 0 4 4 0 01-8 0zM12 8v8M8 12h8',
            '조리도구': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
            '그릇': 'M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9zM8 12h8',
            '정수기': 'M12 2v20M8 5h8M6 12h12M8 19h8',
            '와이파이': 'M2 7h20M2 12h20M2 17h20',
            '에어컨': 'M3 12h18M3 8h18M3 16h18M12 3v18',
            '침구류': 'M3 7h18v10H3V7zM7 3h10v4H7V3z',
            '수건': 'M3 12h18M6 7h12M6 17h12',
            '어메니티': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            '청소용품': 'M6 2l3 6 5-4-8 13 4-7 6 2z',
            '헤어드라이어': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            '기본': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        };

        // 어메니티 아이템들 생성 (기존 방식과 동일)
        room.amenities.forEach(amenity => {
            const amenityDiv = document.createElement('div');
            amenityDiv.className = 'feature-item';

            const amenityName = amenity.name?.ko || amenity.name || amenity;
            const iconPath = amenityIcons[amenityName] || amenityIcons['기본'];

            amenityDiv.innerHTML = `
                <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}"/>
                </svg>
                <span class="text-base md:text-lg text-gray-600">${amenityName}</span>
            `;

            amenitiesGrid.appendChild(amenityDiv);
        });
    }

    /**
     * 숙소 영문명 마키 텍스트 매핑
     */
    mapMarquee() {
        const marqueeContainer = this.safeSelect('[data-room-marquee]');
        if (!marqueeContainer) return;

        const propertyNameEn = this.data.property?.nameEn || 'Property Name';

        // 기존 내용 제거
        marqueeContainer.innerHTML = '';

        // 반복할 텍스트 생성 (3번 반복)
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            span.textContent = propertyNameEn;
            marqueeContainer.appendChild(span);
        }
    }

    /**
     * 객실 배너 이미지 매핑 (thumbnail 0번째)
     */
    mapBanner() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const bannerSection = this.safeSelect('[data-room-banner]');
        if (!bannerSection) return;

        const thumbnailImages = room.images?.[0]?.thumbnail;
        const sortedThumbnails = thumbnailImages
            ?.filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];

        const firstThumbnail = sortedThumbnails[0];

        if (firstThumbnail) {
            bannerSection.style.backgroundImage = `url('${firstThumbnail.url}')`;
            bannerSection.style.backgroundSize = 'cover';
            bannerSection.style.backgroundPosition = 'center';
            bannerSection.style.backgroundRepeat = 'no-repeat';
        } else {
            // 이미지 없을 때 placeholder 배경
            bannerSection.style.backgroundImage = `url('${ImageHelpers.EMPTY_IMAGE_WITH_ICON}')`;
            bannerSection.style.backgroundSize = 'cover';
            bannerSection.style.backgroundPosition = 'center';
            bannerSection.style.backgroundRepeat = 'no-repeat';
        }
    }

    /**
     * 외부 갤러리 섹션 매핑 (exterior 이미지 최대 5장)
     */
    mapExteriorGallery() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 갤러리 제목 매핑 (CUSTOM FIELD)
        const galleryTitle = this.safeSelect('[data-room-gallery-title]');
        if (galleryTitle) {
            const roomPageData = this.getCurrentRoomPageData();
            const galleryTitleText = roomPageData?.data?.sections?.[0]?.gallery?.title;
            galleryTitle.innerHTML = this._formatTextWithLineBreaks(galleryTitleText || 'Gallery');
        }

        // 갤러리 이미지 매핑 (시스템 데이터)
        const galleryContainer = this.safeSelect('[data-room-gallery]');
        if (!galleryContainer) return;

        const exteriorImages = room.images?.[0]?.exterior;
        const sortedImages = exteriorImages
            ?.filter(img => img.isSelected)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];

        // 최대 5개 이미지만 사용
        const galleryImages = sortedImages.slice(0, 5);

        // 기존 갤러리 제거
        galleryContainer.innerHTML = '';

        if (galleryImages.length === 0) {
            // 이미지가 0개일 때만 5개 placeholder UI 생성
            for (let i = 0; i < 5; i++) {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';

                const img = document.createElement('img');
                ImageHelpers.applyPlaceholder(img);

                galleryItem.appendChild(img);
                galleryContainer.appendChild(galleryItem);
            }
            galleryContainer.setAttribute('data-count', 5);
            return;
        }

        // 이미지가 있으면 실제 이미지 개수만큼만 생성
        galleryImages.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.description || room.name;
            img.loading = index === 0 ? 'eager' : 'lazy';
            img.setAttribute('data-image-fallback', '');

            galleryItem.appendChild(img);
            galleryContainer.appendChild(galleryItem);
        });

        // data-count 속성 설정 (CSS에서 레이아웃 결정에 사용)
        galleryContainer.setAttribute('data-count', galleryImages.length);
    }



    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Room 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            console.error('Cannot map room page: data not loaded');
            return;
        }

        const room = this.getCurrentRoom();
        if (!room) {
            console.error('Cannot map room page: room not found');
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapSliderSection();        // Fullscreen slider at top
        this.mapBasicInfo();             // Room name, thumbnail, description
        this.mapRoomInfoSection();       // Room info description + main image + thumbnails
        this.mapRoomDetails();           // Size, bed types, composition, capacity, checkin, checkout, guide
        this.mapRoomAmenities();         // Amenities grid (if exists)
        this.mapMarquee();               // Property English name marquee
        this.mapBanner();                // Exterior banner image
        this.mapExteriorGallery();       // Exterior gallery section

        // 메타 태그 업데이트 (페이지별 SEO 적용)
        const property = this.data.property;
        const pageSEO = {
            title: (room?.name && property?.name) ? `${room.name} - ${property.name}` : 'SEO 타이틀',
            description: room?.description || property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // OG 이미지 업데이트 (객실 이미지 사용)
        this.updateOGImage(room);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }


    /**
     * OG 이미지 업데이트 (객실 이미지 사용, 없으면 로고)
     * @param {Object} room - 현재 객실 데이터
     */
    updateOGImage(room) {
        if (!this.isDataLoaded || !room) return;

        const ogImage = this.safeSelect('meta[property="og:image"]');
        if (!ogImage) return;

        // room.images[0]에서 thumbnail, interior, exterior 순으로 첫 번째 이미지 찾기
        const imageSources = [
            room.images?.[0]?.thumbnail,
            room.images?.[0]?.interior,
            room.images?.[0]?.exterior,
        ];

        const firstImageArray = imageSources.find(arr => Array.isArray(arr) && arr.length > 0);
        const imageUrl = firstImageArray?.[0]?.url;

        // 우선순위: 객실 이미지 > 로고 이미지
        if (imageUrl) {
            ogImage.setAttribute('content', imageUrl);
        } else {
            const defaultImage = this.getDefaultOGImage();
            if (defaultImage) {
                ogImage.setAttribute('content', defaultImage);
            }
        }
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
    module.exports = RoomMapper;
} else {
    window.RoomMapper = RoomMapper;
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    const roomMapper = new RoomMapper();

    try {
        // 데이터 로드
        await roomMapper.loadData();

        // 페이지 매핑 실행
        await roomMapper.mapPage();
    } catch (error) {
        console.error('Error initializing room mapper:', error);
    }
});

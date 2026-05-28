/**
 * Room Page Data Mapper
 * room.html 전용 매핑 함수들을 포함한 클래스
 * URL 파라미터 ?id=... 로 객실을 선택하여 동적으로 매핑
 */
class RoomMapper extends BaseDataMapper {
    constructor() {
        super();
        this.currentRoom = null;
    }

    async mapPage() {
        if (!this.isDataLoaded) return;

        try {
            const room = this.getCurrentRoom();
            if (!room) return;

            this.updateMetaTags({
                title: `${this.getRoomName(room)} - ${this.getPropertyName()}`,
                description: room.description || this.data.property?.description || ''
            });

            this.mapHeroSection();
            this.mapRoomName();
            this.mapRoomImages();
            this.mapRoomDetails();
            this.mapConceptImages();
            this.mapRoomCards();
            this.reinitializeSliders();
        } catch (error) {
            console.error('RoomMapper mapPage error:', error);
        }
    }

    reinitializeSliders() {
        if (typeof window.initCon2HeroSlider === 'function') window.initCon2HeroSlider();
        if (typeof window.initRoomInfoFeatureSlider === 'function') window.initRoomInfoFeatureSlider();
        if (typeof window.initRoomPreviewCarousel === 'function') window.initRoomPreviewCarousel();
    }

    // ============================================================================
    // 🔧 현재 객실 선택
    // ============================================================================

    getCurrentRoom() {
        if (!this.isDataLoaded || !this.data.rooms) return null;

        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('id');

        if (!roomId && this.data.rooms.length > 0) {
            navigateTo('room', this.data.rooms[0].id);
            return null;
        }
        if (!roomId) return null;

        const room = this.data.rooms.find(r => r.id === roomId);
        this.currentRoom = room || null;
        return this.currentRoom;
    }

    // ============================================================================
    // 🎯 HERO SECTION
    // ============================================================================

    /**
     * Hero 슬라이더 매핑
     * customFields.pages.room[id].sections.0.hero.images → [data-room-hero-images]
     */
    mapHeroSection() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const container = this.safeSelect('[data-room-hero-images]');
        if (!container) return;

        container.innerHTML = '';

        const images = this.getRoomImages(room, 'roomtype_interior');

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
            div.setAttribute('aria-label', this.sanitizeText(img.description, `객실 이미지 ${i + 1}`));
            container.appendChild(div);
        });
    }

    // ============================================================================
    // 🏷️ ROOM NAME
    // ============================================================================

    mapRoomName() {
        const room = this.getCurrentRoom();
        if (!room) return;

        this.safeSelectAll('[data-room-name]').forEach(el => {
            el.textContent = this.getRoomName(room);
        });
    }

    // ============================================================================
    // 🖼️ ROOM IMAGES
    // ============================================================================

    /**
     * 객실 이미지 매핑
     * roomtype_interior → [data-room-images] feature(0번째) + thumbs(1~4번째)
     */
    mapRoomImages() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const images = this.getRoomImages(room, 'roomtype_interior');
        // room info는 5번째(index 4) 이미지부터 시작
        const OFFSET = 4;
        const getUrl = (i) => images[OFFSET + i]?.url || null;

        // feature 이미지 (5번째, index 4)
        const featureContainer = this.safeSelect('.room-info-feature[data-room-images]');
        if (featureContainer) {
            const img = featureContainer.querySelector('img');
            if (img) {
                const url = getUrl(0);
                img.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                img.alt = this.sanitizeText(images[OFFSET]?.description, this.getRoomName(room));
                img.classList.toggle('empty-image-placeholder', !url);
            }
        }

        // thumb 이미지 (6~9번째, index 5~8)
        const thumbContainer = this.safeSelect('.room-info-thumbs[data-room-images]');
        if (thumbContainer) {
            const thumbImgs = thumbContainer.querySelectorAll('img.room-info-thumb');
            thumbImgs.forEach((img, i) => {
                const url = getUrl(i + 1);
                img.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                img.alt = this.sanitizeText(images[OFFSET + i + 1]?.description, this.getRoomName(room));
                img.classList.toggle('empty-image-placeholder', !url);
            });
        }
    }

    // ============================================================================
    // 📋 ROOM DETAILS
    // ============================================================================

    /**
     * 객실 상세 정보 매핑
     */
    mapRoomDetails() {
        const room = this.getCurrentRoom();
        if (!room) return;

        // 객실 정보
        const infoEl = this.safeSelect('[data-room-info]');
        if (infoEl) {
            infoEl.innerHTML = this._formatTextWithLineBreaks(room.description, '객실 정보');
        }

        // 객실 크기
        const sizeEl = this.safeSelect('[data-room-size]');
        if (sizeEl) {
            const size = room.sizePyeong ? `${room.sizePyeong}평` : (room.size ? `${room.size}㎡` : '-');
            sizeEl.textContent = this.sanitizeText(size);
        }

        // 체크인/체크아웃
        const checkInOutEl = this.safeSelect('[data-room-checkin-checkout]');
        if (checkInOutEl) {
            const ts = room.timeSettings;
            const checkin = ts?.checkin || room.checkin || '-';
            const checkout = ts?.checkout || room.checkout || '-';
            checkInOutEl.textContent = `체크인 ${checkin} / 체크아웃 ${checkout}`;
        }

        // 어메니티
        const amenitiesEl = this.safeSelect('[data-room-amenities]');
        if (amenitiesEl) {
            const list = (room.amenities || []).map(a => (typeof a === 'string' ? a : (a.name?.ko || a.name || a)));
            amenitiesEl.textContent = list.length > 0 ? list.join(', ') : '-';
        }

        // 기준 인원
        const capacityEl = this.safeSelect('[data-room-capacity]');
        if (capacityEl) {
            const base = room.baseOccupancy || 2;
            const max = room.maxOccupancy || 4;
            capacityEl.textContent = `기준 ${base}인 / 최대 ${max}인`;
        }

        // 이용 안내
        const guideEl = this.safeSelect('[data-room-guide]');
        if (guideEl) {
            const guide = room.roomInfo || room.usageGuide || '';
            guideEl.innerHTML = this._formatTextWithLineBreaks(guide, '이용 안내');
        }
    }

    // ============================================================================
    // 🎨 CONCEPT IMAGES (con3)
    // ============================================================================

    /**
     * con3 컨셉 이미지 매핑
     * customFields.pages.room[id].sections.0.gallery.images → [data-room-concept-images] 4개 div
     * 이미지 url → 배경이미지, description → 레이블 텍스트
     */
    mapConceptImages() {
        const container = this.safeSelect('[data-room-concept-images]');
        if (!container) return;

        const room = this.getCurrentRoom();
        if (!room) return;

        const images = this.getRoomImages(room, 'roomtype_exterior');

        const labelEls = container.querySelectorAll('[data-room-concept-label]');
        labelEls.forEach((labelEl, i) => {
            const parent = labelEl.parentElement;
            if (!parent) return;

            const img = images[i];
            const url = img?.url || null;

            parent.style.backgroundImage = url
                ? `url("${url}")`
                : `url("${ImageHelpers.EMPTY_IMAGE_WITH_ICON}")`;
            parent.classList.toggle('empty-image-placeholder', !url);

            if (img?.description) {
                labelEl.textContent = this.sanitizeText(img.description, '');
            }
        });
    }

    // ============================================================================
    // 🏠 ROOM CARDS (Roomview slider)
    // ============================================================================

    /**
     * 객실 카드 슬라이더 매핑 (index-mapper.js와 동일 패턴)
     * rooms[] → .room-slider-track (원본 + 복제)
     */
    mapRoomCards() {
        const roomsData = this.safeGet(this.data, 'rooms');
        if (!roomsData || !Array.isArray(roomsData)) return;

        const track = this.safeSelect('.room-page .room-slider-track');
        if (!track) return;

        track.innerHTML = '';

        const sortedRooms = [...roomsData].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        if (sortedRooms.length === 0) return;

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
            bgImg.src = './public/bg4@2x.png';

            const cardImg = document.createElement('img');
            cardImg.className = 'room-card-img';
            if (!isClone) cardImg.loading = 'lazy';
            cardImg.alt = '';
            cardImg.src = thumbUrl || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            if (!thumbUrl) cardImg.classList.add('empty-image-placeholder');

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

        // index-mapper와 동일한 블록 반복 로직:
        // 룸 수가 적어 블록이 뷰포트보다 좁으면 루프 끝에 빈 공간이 보이고(끊김),
        // CSS 애니메이션(room-scroll 25s)이 짧은 거리만 이동해 느리게 보임.
        // → 한 블록이 뷰포트의 약 1.5배 이상 차도록 룸 리스트를 반복해 index.html과 속도/루프를 동일하게 맞춤.
        const viewportW = window.innerWidth || 1200;
        const isMobile = viewportW <= 420;
        const cardSlot = isMobile ? 306 : 442;   // .room-card min-width + gap
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
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

if (typeof window !== 'undefined' && window.parent === window) {
    document.addEventListener('DOMContentLoaded', async () => {
        const mapper = new RoomMapper();
        await mapper.initialize();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoomMapper;
} else {
    window.RoomMapper = RoomMapper;
}

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
            this.mapRoomTabs();
            this.mapRoomImages();
            this.mapRoomDetails();
            this.mapFloorplan();
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
    // 🔀 ROOM GROUP TABS
    // ============================================================================

    /**
     * 객실 그룹 탭 매핑
     * 현재 객실이 groupName으로 묶인 그룹(멤버 2개 이상)에 속할 때만
     * 그룹 내 객실들을 탭으로 펼쳐서 보여준다. (헤더 메뉴는 그룹명 하나로 접혀서
     * 그룹의 첫 객실로만 연결되므로, 두 번째 객실부터는 이 탭이 유일한 진입 경로)
     * 그룹이 없거나 멤버가 1개뿐이면(펼칠 의미가 없으므로) 탭 자체를 숨긴다.
     */
    mapRoomTabs() {
        const room = this.getCurrentRoom();
        const container = this.safeSelect('[data-room-group-tabs]');
        if (!container) return;

        container.innerHTML = '';
        container.style.display = 'none';
        if (!room) return;

        const rooms = this.safeGet(this.data, 'rooms');
        if (!rooms || !Array.isArray(rooms) || rooms.length === 0) return;

        const sortedRooms = [...rooms].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        const menuItems = this.getRoomMenuItems(sortedRooms);

        const activeGroup = menuItems.find(item =>
            item.rooms.length > 1 && item.rooms.some(r => String(r.id) === String(room.id))
        );
        if (!activeGroup) return;

        activeGroup.rooms.forEach(groupRoom => {
            const name = this.getRoomName(groupRoom);
            if (!String(name).trim()) return;
            const a = document.createElement('a');
            a.className = 'room-group-tab';
            if (String(groupRoom.id) === String(room.id)) a.classList.add('is-active');
            a.textContent = name;
            a.href = `./room.html?id=${groupRoom.id}`;
            container.appendChild(a);
        });

        if (container.children.length > 1) {
            container.style.display = '';
        } else {
            container.innerHTML = '';
        }
    }

    // ============================================================================
    // 🖼️ ROOM IMAGES
    // ============================================================================

    /**
     * 객실 이미지 매핑
     * roomtype_interior 1~4번째(index 0~3) → [data-room-images] thumbs
     * feature는 썸네일을 크게 보여주는 슬라이더 화면이므로 첫 썸네일과 동일한 이미지로 초기화
     * (이후 교체는 js/pages/room.js의 initRoomInfoFeatureSlider가 담당)
     */
    mapRoomImages() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const images = this.getRoomImages(room, 'roomtype_interior');
        const getUrl = (i) => images[i]?.url || null;

        // thumb 이미지 (1~4번째, index 0~3)
        const thumbContainer = this.safeSelect('.room-info-thumbs[data-room-images]');
        if (thumbContainer) {
            const thumbImgs = thumbContainer.querySelectorAll('img.room-info-thumb');
            thumbImgs.forEach((img, i) => {
                const url = getUrl(i);
                img.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                img.alt = this.sanitizeText(images[i]?.description, this.getRoomName(room));
                img.classList.toggle('empty-image-placeholder', !url);
            });
        }

        // feature 이미지 = 첫 번째 썸네일 (index 0)
        const featureContainer = this.safeSelect('.room-info-feature[data-room-images]');
        if (featureContainer) {
            const img = featureContainer.querySelector('img');
            if (img) {
                const url = getUrl(0);
                img.src = url || ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                img.alt = this.sanitizeText(images[0]?.description, this.getRoomName(room));
                img.classList.toggle('empty-image-placeholder', !url);
            }
        }

        // 매핑된 src 기준으로 슬라이더 재초기화
        if (typeof window.initRoomInfoFeatureSlider === 'function') {
            window.initRoomInfoFeatureSlider();
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

        // 이용 안내 — 내용 없으면 제목 포함 섹션(info-right) 미노출
        const guideEl = this.safeSelect('[data-room-guide]');
        if (guideEl) {
            const guide = (room.roomInfo || room.usageGuide || '').trim();
            const guideSection = guideEl.closest('.info-right');
            if (guide) {
                guideEl.innerHTML = this._formatTextWithLineBreaks(guide, '이용 안내');
                if (guideSection) guideSection.style.display = '';
            } else {
                guideEl.innerHTML = '';
                if (guideSection) guideSection.style.display = 'none';
            }
        }
    }

    // ============================================================================
    // 🗺️ FLOORPLAN
    // ============================================================================

    /**
     * 객실 평면도 매핑
     * roomtype_floorplan 이미지 → [data-room-floorplan-image]
     * ⚠️ 제목·설명 자리가 없다. 도면 이미지 한 장이 전부다.
     * ⚠️ 이미지가 없거나 로드에 실패하면 [data-room-floorplan-section]을 통째로 숨긴다.
     */
    mapFloorplan() {
        const room = this.getCurrentRoom();
        if (!room) return;

        const sections = this.safeSelectAll('[data-room-floorplan-section]');
        if (!sections.length) return;

        const image = this.getRoomFloorplanImage(room);
        const url = image?.url || '';

        sections.forEach(section => {
            section.style.display = url ? '' : 'none';
        });
        if (!url) return;

        this.safeSelectAll('[data-room-floorplan-image]').forEach(img => {
            img.alt = '객실 평면도';
            img.onerror = () => {
                sections.forEach(section => { section.style.display = 'none'; });
            };
            img.src = url;
        });
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

        const blockCardCount = repeat * sortedRooms.length;
        const SCROLL_SPEED_PX_PER_SEC = 1900 / 35;
        const duration = Math.round((blockCardCount * cardSlot) / SCROLL_SPEED_PX_PER_SEC);
        track.style.setProperty('--room-scroll-duration', `${duration}s`);
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

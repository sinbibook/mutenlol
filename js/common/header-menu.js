/**
 * Header Menu Panel Toggle
 * - .menu-toggle 클릭 시 .navigation 패널 표시
 * - .close-icon / ESC / 백그라운드 클릭으로 닫기
 */
(function () {
    'use strict';

    var MOBILE_BREAKPOINT = 768;

    /**
     * 모바일에서 .title의 4개 specials 버튼과 .room-parent의 4개 컬럼을
     * 짝지어 .nav-mobile-accordion으로 동적 재구성.
     * 데스크톱(>768)에서는 원본 구조(title 행 + room-parent 행)가 그대로 보임.
     */
    function buildMobileAccordion(panel) {
        if (panel.querySelector('.nav-mobile-accordion')) return; // 이미 생성됨

        var titleEl = panel.querySelector('.title');
        var roomParent = panel.querySelector('.room-parent');
        if (!titleEl || !roomParent) return;

        var specials = titleEl.querySelectorAll('.specials');
        var columns = roomParent.querySelectorAll(':scope > .prologue, :scope > .room, :scope > .special, :scope > .txt');

        if (specials.length === 0 || columns.length === 0) return;

        var accordion = document.createElement('div');
        accordion.className = 'nav-mobile-accordion';

        // specials와 column을 인덱스로 페어링하여 nav-tab에 묶음
        for (var i = 0; i < specials.length; i++) {
            var tab = document.createElement('div');
            tab.className = 'nav-tab';

            // specials 클론 (원본은 그대로 두고, 모바일용 클론 사용)
            var titleClone = specials[i].cloneNode(true);
            titleClone.classList.add('nav-tab-title');
            tab.appendChild(titleClone);

            // 컬럼 클론
            var colClone = columns[i] ? columns[i].cloneNode(true) : null;
            if (colClone) {
                colClone.classList.add('nav-tab-content');
                tab.appendChild(colClone);
            }

            // 토글 핸들러: 모바일에서만 클릭 시 .is-open 토글, 링크 이동 차단
            (function (tab, titleClone) {
                titleClone.addEventListener('click', function (e) {
                    if (window.innerWidth <= MOBILE_BREAKPOINT) {
                        e.preventDefault();
                        tab.classList.toggle('is-open');
                    }
                });
            })(tab, titleClone);

            accordion.appendChild(tab);
        }

        // mask-group-parent 안 .title 다음에 삽입 (또는 .room-parent 뒤)
        var insertParent = titleEl.parentNode;
        insertParent.appendChild(accordion);
    }

    function init() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.navigation');
        if (!toggle || !panel) return;

        // 중복 초기화 방지 (loader가 헤더 재주입할 경우)
        if (panel.dataset.menuInitialized === 'true') return;
        panel.dataset.menuInitialized = 'true';

        // 패널을 body 직속 자식으로 이동 — 부모 transform/overflow에 의한
        // position: fixed containing block 변형 방지 (viewport 기준 정확히 풀스크린)
        if (panel.parentNode !== document.body) {
            document.body.appendChild(panel);
        }

        // 모바일 아코디언 빌드
        buildMobileAccordion(panel);

        var closeBtn = panel.querySelector('.close-icon');

        function openPanel() {
            panel.removeAttribute('hidden');
            panel.setAttribute('aria-hidden', 'false');
            // 내부 스크롤 위치 0으로 리셋 (panel + navigation-off 둘 다)
            panel.scrollTop = 0;
            var scrollableInner = panel.querySelector('.navigation-off');
            if (scrollableInner) scrollableInner.scrollTop = 0;
            // 다음 프레임에 클래스 추가 → opacity transition 트리거
            requestAnimationFrame(function () {
                panel.classList.add('is-open');
            });
            document.body.classList.add('navigation-open');
            toggle.setAttribute('aria-expanded', 'true');
        }

        function closePanel() {
            panel.classList.remove('is-open');
            panel.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('navigation-open');
            toggle.setAttribute('aria-expanded', 'false');
            // transition 종료 후 hidden 처리 (포커스 트랩 방지)
            setTimeout(function () {
                if (!panel.classList.contains('is-open')) {
                    panel.setAttribute('hidden', '');
                }
            }, 300);
        }

        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            if (panel.classList.contains('is-open')) {
                closePanel();
            } else {
                openPanel();
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', closePanel);
            closeBtn.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closePanel();
                }
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && panel.classList.contains('is-open')) {
                closePanel();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

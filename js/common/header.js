// Header JavaScript
(function() {
    'use strict';

    // Update submenu position based on header height
    function updateSubmenuPosition() {
        const header = document.querySelector('.top-header');
        const unifiedSubmenu = document.querySelector('.unified-submenu');

        if (header && unifiedSubmenu) {
            const headerHeight = header.offsetHeight;
            unifiedSubmenu.style.top = `${headerHeight}px`;
        }
    }

    // Scroll Effect for Header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.top-header');
        const bookNowBtn = document.querySelector('.book-now-btn');
        const hamburgerBtn = document.querySelector('.hamburger-button');

        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Book Now Button scroll effect
        if (bookNowBtn) {
            if (window.scrollY > 50) {
                bookNowBtn.classList.add('scrolled');
            } else {
                bookNowBtn.classList.remove('scrolled');
            }
        }

        // YBS Button scroll effect
        const ybsBtn = document.querySelector('.ybs-btn');
        if (ybsBtn) {
            if (window.scrollY > 50) {
                ybsBtn.classList.add('scrolled');
            } else {
                ybsBtn.classList.remove('scrolled');
            }
        }

        // Hamburger Button scroll effect
        if (hamburgerBtn) {
            if (window.scrollY > 50) {
                hamburgerBtn.classList.add('scrolled');
            } else {
                hamburgerBtn.classList.remove('scrolled');
            }
        }

        // Update submenu position after header state change
        // setTimeout(updateSubmenuPosition, 100);
    });

    // Toggle Mobile Menu
    window.toggleMobileMenu = function() {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');
        const body = document.body;
        const html = document.documentElement;

        if (mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';

            // 현재 스크롤 위치 저장
            const scrollY = body.style.top ? -parseInt(body.style.top) : 0;

            // 모든 스타일 완전히 리셋
            body.classList.remove('mobile-menu-open');
            body.style.overflow = '';
            body.style.position = '';
            body.style.width = '';
            body.style.height = '';
            body.style.top = '';
            body.style.left = '';

            html.style.overflow = '';

            // 원래 스크롤 위치로 복원
            if (scrollY > 0) {
                window.scrollTo(0, scrollY);
            }
        } else {
            // 현재 스크롤 위치 저장
            const scrollY = window.pageYOffset;

            mobileMenu.classList.add('active');
            menuIcon.style.display = 'none';
            closeIcon.style.display = 'block';

            // body 고정하되 현재 스크롤 위치 유지
            body.classList.add('mobile-menu-open');
            body.style.overflow = 'hidden';
            body.style.position = 'fixed';
            body.style.width = '100%';
            body.style.height = '100%';
            body.style.top = `-${scrollY}px`;
            body.style.left = '0';

            html.style.overflow = 'hidden';
        }
    };

    // Navigation function
    window.navigateTo = function(page) {
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }

        // Navigate to page
        let url = '';
        switch(page) {
            case 'home':
                url = 'index.html';
                break;
            case 'main':
                url = 'main.html';
                break;
            case 'directions':
                url = 'directions.html';
                break;
            case 'reservation-info':
                url = 'reservation.html';
                break;
            default:
                url = page + '.html';
        }

        if (url) {
            window.location.href = url;
        }
    };

    // Submenu hover effect
    function initSubmenuHover() {
        const menuItems = document.querySelectorAll('.menu-item-wrapper');

        menuItems.forEach(item => {
            let hoverTimeout;

            item.addEventListener('mouseenter', function() {
                clearTimeout(hoverTimeout);
            });

            item.addEventListener('mouseleave', function() {
                hoverTimeout = setTimeout(() => {
                    // Optional: Add any cleanup code here
                }, 100);
            });
        });
    }

    // Check if logo image exists and hide text
    function checkLogoImage() {
        const logoImage = document.querySelector('.logo-image');
        const logoText = document.querySelector('.logo-text');

        if (logoImage && logoText) {
            // Check if logo image src exists and is not empty
            if (logoImage.src && !logoImage.src.includes('undefined') && !logoImage.src.endsWith('/')) {
                logoText.style.display = 'none';
            }
        }
    }


    // Check and set header state based on scroll position
    function checkInitialScroll() {
        const header = document.querySelector('.top-header');

        if (header) {
            if (window.scrollY > 50 || window.pageYOffset > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }

    // Side Header Toggle
    window.toggleSideHeader = function() {
        const sideHeader = document.getElementById('side-header');
        const hamburgerButton = document.getElementById('hamburger-button');
        const overlay = document.getElementById('side-header-overlay');
        const body = document.body;
        const html = document.documentElement;

        if (sideHeader && hamburgerButton) {
            const isExpanded = sideHeader.classList.contains('expanded');

            if (isExpanded) {
                // 닫기
                sideHeader.classList.remove('expanded');
                hamburgerButton.classList.remove('active');
                if (overlay) overlay.classList.remove('active');

                // 스크롤 복원
                body.style.overflow = '';
                body.style.position = '';
                body.style.top = '';
                body.style.width = '';
                html.style.overflow = '';

                const scrollY = body.style.top || '0';
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            } else {
                // 열기
                sideHeader.classList.add('expanded');
                hamburgerButton.classList.add('active');
                if (overlay) overlay.classList.add('active');

                // 스크롤 막기
                const scrollY = window.scrollY;
                body.style.position = 'fixed';
                body.style.overflow = 'hidden';
                body.style.width = '100%';
                body.style.top = `-${scrollY}px`;
                html.style.overflow = 'hidden';
            }
        }
    };

    // Change Side Image when menu section is hovered
    function initMenuHoverEffects() {
        const menuSections = document.querySelectorAll('.menu-section');

        menuSections.forEach(section => {
            const title = section.querySelector('.menu-section-title').textContent.toLowerCase();

            section.addEventListener('mouseenter', function() {
                changeSideImage(title);
            });
        });
    }

    // Change Side Image
    function changeSideImage(menuText) {
        const imageBanner = document.getElementById('side-image-banner');
        if (!imageBanner) return;

        let imageUrl = '';

        switch(menuText.toLowerCase()) {
            case 'about':
                imageUrl = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80';
                break;
            case 'spaces':
                imageUrl = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80';
                break;
            case 'specials':
                imageUrl = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80';
                break;
            case 'reservation':
                imageUrl = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80';
                break;
            default:
                imageUrl = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80';
        }

        imageBanner.style.backgroundImage = `url('${imageUrl}')`;
    }

    // Initialize header on page load
    document.addEventListener('DOMContentLoaded', function() {
        // Check initial scroll position
        checkInitialScroll();

        // Initialize submenu hover
        initSubmenuHover();

        // Check logo image
        checkLogoImage();

        // Update submenu position initially
        updateSubmenuPosition();

        // Update submenu position on window resize
        window.addEventListener('resize', updateSubmenuPosition);


        // Initialize hamburger button toggle
        const hamburgerButton = document.getElementById('hamburger-button');
        if (hamburgerButton) {
            hamburgerButton.addEventListener('click', toggleSideHeader);
        }

        // Initialize overlay click event
        const overlay = document.getElementById('side-header-overlay');
        if (overlay) {
            overlay.addEventListener('click', function() {
                toggleSideHeader();
            });
        }

        // Initialize menu hover effects
        setTimeout(initMenuHoverEffects, 500);

        // Check for multi-column layout
        // initMultiColumnLayout(); // 주석 처리 - 단일 항목으로 변경

        // For mobile - use side header instead of mobile menu
        const mobileToggle = document.querySelector('.mobile-toggle');
        if (mobileToggle && window.innerWidth <= 768) {
            mobileToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleSideHeader();
            });
        }
    });

    // Menu Accordion Toggle for Side Header
    window.toggleMenuAccordion = function(header) {
        const content = header.nextElementSibling;

        // Toggle current accordion
        header.classList.toggle('active');
        content.classList.toggle('active');
    };

    // Mobile Accordion Toggle
    window.toggleMobileAccordion = function(header) {
        const content = header.nextElementSibling;

        // Toggle current accordion
        header.classList.toggle('active');
        content.classList.toggle('active');
    };

    // Also check when window loads (for refresh scenarios)
    window.addEventListener('load', function() {
        checkInitialScroll();
    });

    // Check for multi-column layout based on item count
    function initMultiColumnLayout() {
        const menuLists = document.querySelectorAll('.menu-section-list');

        menuLists.forEach(list => {
            const items = list.querySelectorAll('li');
            if (items.length > 4) {
                list.classList.add('multi-column');
            }
        });
    }

    // Immediate check for page refresh scenarios
    checkInitialScroll();

})();

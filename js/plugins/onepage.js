document.addEventListener('DOMContentLoaded', function () {
    let sections = document.querySelectorAll('.mil-section');
    let dots = document.querySelectorAll('.mil-dot');
    let navLinks = document.querySelectorAll('.mil-top-panel nav ul li');
    let index = 0;
    let scrolling = false;

    // Expose index globally
    window.onepageIndex = index;

    function scrollToSection(idx) {
        scrolling = true;
        index = idx;
        window.onepageIndex = idx;

        window.scrollTo({
            top: idx * window.innerHeight,
            behavior: 'smooth'
        });

        updateActiveDot(idx);
        updateActiveSection(idx);
        updateActiveNav(idx);

        // Unlock scrolling after animation completes
        setTimeout(function () {
            scrolling = false;
        }, 1200);
    }

    // Expose scrollToSection globally
    window.onepageScrollTo = scrollToSection;

    function updateActiveDot(idx) {
        dots.forEach(dot => dot.classList.remove('mil-active'));
        if (dots[idx]) dots[idx].classList.add('mil-active');
    }

    function updateActiveSection(idx) {
        sections.forEach((section, sectionIndex) => {
            if (sectionIndex === idx) {
                section.classList.add('mil-active');
            } else {
                section.classList.remove('mil-active');
            }
        });
    }

    function updateActiveNav(idx) {
        // Map section index to nav link index based on section id
        let sectionIds = [];
        sections.forEach(function(s) { sectionIds.push(s.id || ''); });

        navLinks.forEach(function(li) {
            li.classList.remove('mil-active');
            let link = li.querySelector('a');
            if (link) {
                let href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    let targetId = href.substring(1);
                    if (sectionIds[idx] === targetId) {
                        li.classList.add('mil-active');
                    }
                }
            }
        });
    }

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', function () {
            if (!scrolling) {
                scrollToSection(dotIndex);
            }
        });
    });

    function handleWheel(event) {
        if (window.innerWidth >= 1200 && !scrolling) {
            event.preventDefault();

            if (event.deltaY > 0 && index < sections.length - 1) {
                index++;
            } else if (event.deltaY < 0 && index > 0) {
                index--;
            }

            scrollToSection(index);
        }
    }

    window.addEventListener('wheel', handleWheel, { passive: false });

    // Set the initial scroll position
    setTimeout(function () {
        window.scrollTo(0, 0);
        updateActiveSection(index);
        updateActiveNav(index);
    }, 100);
});

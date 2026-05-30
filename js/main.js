/* -------------------------------------------

Name: Treto
Version: 1.0
Developer: MillerDigitalDesign
Author:	bslthemes (https://bslthemes.com)

------------------------------------------- */

$(function () {

    "use strict";

    $(window).on("scroll", function () {
        var scroll = $(window).scrollTop();

        if (scroll >= 30) {
            $(".mil-top-panel").addClass("mil-active");
        } else {
            $(".mil-top-panel").removeClass("mil-active");
        }
    });

    /**
        Navbar Navigation - integrate with onepage plugin
    **/
    $('.mil-top-panel nav a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        var target = $(this).attr('href');
        var sections = document.querySelectorAll('.mil-section');
        var targetIndex = -1;

        // Find the section index by matching the id
        sections.forEach(function(section, i) {
            if (section.id && target === '#' + section.id) {
                targetIndex = i;
            }
        });

        if (targetIndex >= 0 && window.innerWidth >= 1200) {
            // Use the onepage plugin's scroll function
            if (window.onepageScrollTo) {
                window.onepageScrollTo(targetIndex);
            }
        } else if (targetIndex >= 0) {
            // On mobile, just scroll to the section normally
            $('html, body').animate({
                scrollTop: $(target).offset().top - 90
            }, 800);
        }

        // Close mobile menu if open
        $('.mil-menu-btn, .mil-top-panel nav').removeClass('mil-active');
    });

    var swiper = new Swiper('.mil-timeline-slider', {
        slidesPerView: 1,
        spaceBetween: 30,
        speed: 800,
        parallax: true,
        navigation: {
            prevEl: '.mil-timeline-prev',
            nextEl: '.mil-timeline-next',
        },
        pagination: {
            el: '.mil-timeline-pagination',
            type: 'fraction',
            clickable: true,
        },
        breakpoints: {
            992: {
                slidesPerView: 2,
            },
        },
    });

    var swiper = new Swiper('.mil-timeline-slider-2', {
        slidesPerView: 1,
        spaceBetween: 30,
        speed: 800,
        parallax: true,
        navigation: {
            prevEl: '.mil-timeline-2-prev',
            nextEl: '.mil-timeline-2-next',
        },
        pagination: {
            el: '.mil-timeline-2-pagination',
            type: 'fraction',
            clickable: true,
        },
        breakpoints: {
            992: {
                slidesPerView: 3,
            },
        },
    });

    var swiper = new Swiper('.mil-reviews-slider', {
        slidesPerView: 1,
        spaceBetween: 30,
        speed: 800,
        parallax: true,
        navigation: {
            prevEl: '.mil-reviews-prev',
            nextEl: '.mil-reviews-next',
        },
        pagination: {
            el: '.mil-reviews-pagination',
            type: 'fraction',
            clickable: true,
        },
    });

    $('.mil-menu-btn').on('click', function () {
        $('.mil-menu-btn , .mil-top-panel nav').toggleClass('mil-active');
    });

    $('.mil-filter a').on('click', function () {
        $('.mil-filter .mil-current').removeClass('mil-current');
        $(this).addClass('mil-current');

        var selector = $(this).data('filter');
        $('.mil-portfolio-grid').isotope({
            filter: selector
        });
        return false;

    });

    var $container = $('.mil-portfolio-grid').isotope({
        itemSelector: '.mil-grid-item',
        transitionDuration: '0.5s',
        masonry: {
            columnWidth: '.grid-sizer'
        }
    });

    /**
		Image Popup
	**/
	$('.mfp-image').magnificPopup();

    /*
		Gallery popup
	*/
	$('.mfp-gallery').on('click', function() {
		var gallery = $(this).attr('href');

		$(gallery).magnificPopup({
			delegate: 'a',
			type:'image',
			closeOnContentClick: false,
			mainClass: 'mfp-fade',
			removalDelay: 160,
			fixedContentPos: false,
			gallery: {
				enabled: true
			}
		}).magnificPopup('open');

		return false;
	});

    /**
		Validate Form
	**/
	if($('.cform').length) {
		$('#cform').validate({
			rules: {
				name: {
					required: true
				},
				tel: {
					required: true
				},
				email: {
					required: true,
					email: true
				},
                subject: {
					required: true
				},
				message: {
					required: true
				},
                checkmark: {
					required: true
				}
			},
			success: 'valid',
			submitHandler: function() {
				$.ajax({
					url: 'mailer/feedback.php',
					type: 'post',
					dataType: 'json',
					data: 'name='+ $("#cform").find('input[name="name"]').val() + '&email='+ $("#cform").find('input[name="email"]').val() + '&tel='+ $("#cform").find('input[name="tel"]').val() + '&subject='+ $("#cform").find('input[name="subject"]').val() + '&message='+ $("#cform").find('textarea[name="message"]').val(),
					beforeSend: function() {
	
					},
					complete: function() {
	
					},
					success: function(data) {
						$('#cform').fadeOut();
						$('.alert-success').delay(1000).fadeIn();
					}
				});
			}
		});
	}

    /**
		Validate Form 2
	**/
	if($('.cform-two').length) {
		$('#cform-two').validate({
			rules: {
				name: {
					required: true
				},
				email: {
					required: true,
					email: true
				},
				message: {
					required: true
				},
                checkmark: {
					required: true
				}
			},
			success: 'valid',
			submitHandler: function() {
				$.ajax({
					url: 'mailer/feedback-two.php',
					type: 'post',
					dataType: 'json',
					data: 'name='+ $("#cform-two").find('input[name="name"]').val() + '&email='+ $("#cform-two").find('input[name="email"]').val() + '&message='+ $("#cform-two").find('textarea[name="message"]').val(),
					beforeSend: function() {
	
					},
					complete: function() {
	
					},
					success: function(data) {
						$('#cform-two').fadeOut();
						$('.alert-success').delay(1000).fadeIn();
					}
				});
			}
		});
	}

});


    /**
        Banner photo color reveal on hover
    **/
    var bannerPhoto = document.querySelector('.mil-banner-photo');
    if (bannerPhoto) {
        bannerPhoto.addEventListener('mousemove', function(e) {
            var rect = bannerPhoto.getBoundingClientRect();
            var x = ((e.clientX - rect.left) / rect.width) * 100;
            var y = ((e.clientY - rect.top) / rect.height) * 100;
            bannerPhoto.style.setProperty('--mouse-x', x + '%');
            bannerPhoto.style.setProperty('--mouse-y', y + '%');
        });
    }


    /**
        Typewriter quote effect (multi-language)
    **/
    var typewriterEl = document.getElementById('typewriter-quote');
    if (typewriterEl) {
        var quotesLang = {
            en: [
                '"To a <span class="mil-accent">great mind</span>, nothing is little."',
                '"<span class="mil-accent">Education</span> never ends, Watson."',
                '"Giving up halfway is <span class="mil-accent">worse</span> than never trying at all."',
                '"If you don\'t take risks, you can\'t create a <span class="mil-accent">future</span>!"',
                '"A dropout will beat a <span class="mil-accent">genius</span> through hard work."',
                '"You can die anytime, but living takes true <span class="mil-accent">courage</span>."',
                '"The ticket to the future is <span class="mil-accent">always</span> open."',
                '"You\'ve got two legs and a heartbeat. What\'s <span class="mil-accent">stopping</span> you?"',
                '"It\'s impossible to <span class="mil-accent">work hard</span> for something you don\'t enjoy."'
            ],
            id: [
                '"Bagi <span class="mil-accent">pikiran yang hebat</span>, tidak ada yang kecil."',
                '"<span class="mil-accent">Pendidikan</span> tidak pernah berakhir, Watson."',
                '"Menyerah di tengah jalan <span class="mil-accent">lebih buruk</span> daripada tidak pernah mencoba."',
                '"Jika kamu tidak mengambil risiko, kamu tidak bisa menciptakan <span class="mil-accent">masa depan</span>!"',
                '"Seorang dropout akan mengalahkan <span class="mil-accent">jenius</span> melalui kerja keras."',
                '"Kamu bisa mati kapan saja, tapi hidup butuh <span class="mil-accent">keberanian</span> sejati."',
                '"Tiket menuju masa depan <span class="mil-accent">selalu</span> terbuka."',
                '"Kamu punya dua kaki dan detak jantung. Apa yang <span class="mil-accent">menghentikanmu</span>?"',
                '"Mustahil untuk <span class="mil-accent">bekerja keras</span> demi sesuatu yang tidak kamu nikmati."'
            ],
            jp: [
                '"<span class="mil-accent">偉大な精神</span>にとって、小さなことなど何もない。"',
                '"<span class="mil-accent">教育</span>に終わりはない、ワトソン。"',
                '"途中で諦めることは、挑戦しないことより<span class="mil-accent">悪い</span>。"',
                '"リスクを取らなければ、<span class="mil-accent">未来</span>は作れない！"',
                '"落ちこぼれは努力で<span class="mil-accent">天才</span>に勝つ。"',
                '"いつでも死ねるが、生きるには本当の<span class="mil-accent">勇気</span>がいる。"',
                '"未来への切符は<span class="mil-accent">いつも</span>開いている。"',
                '"二本の足と心臓がある。何が君を<span class="mil-accent">止めている</span>？"',
                '"楽しめないことに<span class="mil-accent">努力する</span>のは不可能だ。"'
            ],
            kr: [
                '"<span class="mil-accent">위대한 정신</span>에게 사소한 것은 없다."',
                '"<span class="mil-accent">교육</span>은 끝이 없다, 왓슨."',
                '"중간에 포기하는 것은 시도하지 않는 것보다 <span class="mil-accent">나쁘다</span>."',
                '"위험을 감수하지 않으면 <span class="mil-accent">미래</span>를 만들 수 없다!"',
                '"낙오자는 노력으로 <span class="mil-accent">천재</span>를 이긴다."',
                '"언제든 죽을 수 있지만, 사는 데는 진정한 <span class="mil-accent">용기</span>가 필요하다."',
                '"미래로 가는 티켓은 <span class="mil-accent">항상</span> 열려 있다."',
                '"두 다리와 심장이 있잖아. 뭐가 널 <span class="mil-accent">멈추고</span> 있어?"',
                '"즐기지 못하는 일에 <span class="mil-accent">열심히 하는</span> 건 불가능하다."'
            ]
        };
        var quoteIndex = 0;
        var charIndex = 0;
        var isDeleting = false;
        var typeSpeed = 80;
        var deleteSpeed = 40;
        var pauseAfterType = 2000;
        var pauseAfterDelete = 500;

        function getQuotes() {
            var lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
            return quotesLang[lang] || quotesLang['en'];
        }

        function typeWriter() {
            var quotes = getQuotes();
            var currentQuote = quotes[quoteIndex % quotes.length];
            // Strip HTML tags for character counting
            var plainText = currentQuote.replace(/<[^>]*>/g, '');

            if (!isDeleting) {
                charIndex++;
                if (charIndex > plainText.length) {
                    isDeleting = true;
                    typewriterEl.innerHTML = currentQuote;
                    setTimeout(typeWriter, pauseAfterType);
                    return;
                }
                // Build visible text respecting HTML tags
                typewriterEl.innerHTML = buildPartialHTML(currentQuote, charIndex);
                setTimeout(typeWriter, typeSpeed);
            } else {
                charIndex--;
                if (charIndex <= 0) {
                    charIndex = 0;
                    isDeleting = false;
                    quoteIndex = (quoteIndex + 1) % quotes.length;
                    typewriterEl.innerHTML = '';
                    setTimeout(typeWriter, pauseAfterDelete);
                    return;
                }
                typewriterEl.innerHTML = buildPartialHTML(currentQuote, charIndex);
                setTimeout(typeWriter, deleteSpeed);
            }
        }

        function buildPartialHTML(html, visibleChars) {
            var result = '';
            var count = 0;
            var inTag = false;
            for (var i = 0; i < html.length; i++) {
                if (html[i] === '<') { inTag = true; result += html[i]; continue; }
                if (html[i] === '>') { inTag = false; result += html[i]; continue; }
                if (inTag) { result += html[i]; continue; }
                count++;
                if (count <= visibleChars) {
                    result += html[i];
                }
            }
            return result;
        }

        setTimeout(typeWriter, 1000);
    }

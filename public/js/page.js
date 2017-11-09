var viewsList = $('.view'),
    nav = $('nav'),
    nav_height = nav.outerHeight(),
    // currentView = $(window.location.hash ? window.location.hash : "#index"),
    mainContent = $('#main-content'),
    contentWrapper = $('#content-wrapper'),
    body = $('body'),
    navListContainer = $('.nav'),
    navList = $('.nav a'),
    jqWindow = $(window),
    carousel = $("#carousel-element");

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var players = [];

function onYouTubeIframeAPIReady() {
    players.push(new YT.Player('video-promo-1', {
        height: '360',
        width: '640',
        videoId: 'ZqQcnzLugPg',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        playerVars: {
            'html5': 1,
            'rel': 0
        }
    }));
    players.push(new YT.Player('video-promo-2', {
        height: '360',
        width: '640',
        videoId: 'I-KBGrzArRw',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        playerVars: {
            'html5': 1,
            'rel': 0
        }
    }));
    players.push(new YT.Player('video-promo-3', {
        height: '360',
        width: '640',
        videoId: 'whrbmPdd6wI',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        playerVars: {
            'html5': 1,
            'rel': 0
        }
    }));
}

function onPlayerReady(event) {
    // no la vamos a usar por ahora ffs, jorge agregara muchos videos despues
}

var done = false;

function onPlayerStateChange(event) {
    var videoId = event.target.a.id;
    if (event.data == YT.PlayerState.ENDED) {
        carousel.carousel("next");
        return;
    }
    switch (event.data) {
        case YT.PlayerState.PLAYING:
            carousel.carousel("pause");
            players.map(function(player) {
                if (player.a.id != videoId) {
                    player.stopVideo();
                }
            })
            break;
        case YT.PlayerState.ENDED:

            carousel.carousel("cycle");
            break;
    }
}

$(document).ready(function() {
    var roadPage = new RoadPageUI.Controller({
        name: "road_page"
    });
    roadPage.bind('render', function() {
        $('[data-toggle="tooltip"]:not(.no-available-dates)').tooltip({
            title: "Click to show the Flyer!",
            trigger: "hover",
        });
        $('li[data-toggle="tooltip"].no-available-dates').tooltip({
            title: "New dates coming up soon!",
            trigger: "hover",
        });
    })

    roadPage.render($("#road"));
    // viewsList.hide();
    // body.animate({
    //     scrollTop: 0
    // }, 'fast');

    // currentView.show();

    navListContainer.find(".active").removeClass("active");
    navListContainer.find('[href="' + window.location.hash + '"]').parent().addClass('active');
    navList.on("click", function(event) {
        players.map(function(player) {
            try {
                player.stopVideo();
            } catch (error) {};
        });
        setTimeout(function() {
            // body.animate({
            //     scrollTop: 0
            // }, 'fast');
            // viewsList.hide();
            navListContainer.find(".active").removeClass("active");
            navListContainer.find('[href="' + window.location.hash + '"]').parent().addClass('active');
            // currentView = $(event.target.hash);
            // currentView.show();
        }, 0)
    });
    scrollPosition = jqWindow.scrollTop();

    scrollHandler(scrollPosition, nav, contentWrapper);
    jqWindow.scroll(scrollHandler.bind(this, jqWindow.scrollTop(), nav, contentWrapper));
    $('.go-to').on("click", function(event) {
        navListContainer.find('[href="' + window.location.hash + '"]').click();
    });

});

function scrollHandler(scrollPosition, nav, contentWrapper)  {
    setTimeout(function() {
        scrollPosition = jqWindow.scrollTop();
        if (scrollPosition > 115) {
            nav.addClass('navbar-fixed-top');
            contentWrapper.addClass('scrolled');
            $('a[href="#index"]').text('').append('<img height="14" src="img/band/logos/3.png">');
        } else {
            nav.removeClass('navbar-fixed-top');
            contentWrapper.removeClass('scrolled');
            $('a[href="#index"]').text('Index');
        }
        navListContainer.find('[href="' + window.location.hash + '"]').parent().addClass('active');
    }, 0);
}
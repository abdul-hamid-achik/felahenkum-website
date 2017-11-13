

$(document).ready(function() {
    var nav = $('nav'), nav_height = nav.outerHeight(), mainContent = $('#main-content'),
    contentWrapper = $('#content-wrapper'), body = $('body'), navListContainer = $('.nav'), 
    navList = $('.nav a'), jqWindow = $(window),carousel = $("#carousel-element");

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

    navListContainer.find(".active").removeClass("active");
    navListContainer.find('[href="' + window.location.hash + '"]').parent().addClass('active');

    navList.on("click", function(event) {
        navListContainer.find(".active").removeClass("active");
        navListContainer.find('[href="' + window.location.hash + '"]').parent().addClass('active');
    });

    scrollPosition = jqWindow.scrollTop();

    scrollHandler(scrollPosition, nav, contentWrapper);
    jqWindow.scroll(scrollHandler.bind(this, jqWindow.scrollTop(), nav, contentWrapper));

    var videos = $('.video-js')
    videos = videos.map(function(index) {
        return videojs(videos[index], {
            preload: 'auto'
        })
    })

    $('.vjs-big-play-button').click(function (ev) { 
        console.log(ev)
    })
});

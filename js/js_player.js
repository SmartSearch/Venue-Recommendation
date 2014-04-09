$(document).ready(function() {

    $("#jquery_jplayer_1").jPlayer({
        ready: function(event) {
            $(this).jPlayer("setMedia", {
                mp3: "http://jplayer.org/audio/mp3/TSP-01-Cro_magnon_man.mp3",
                oga: "http://jplayer.org/audio/ogg/TSP-01-Cro_magnon_man.ogg"
            });
        },
        swfPath: "http://jplayer.org/latest/js",
        supplied: "mp3, oga"
    });
});                                      


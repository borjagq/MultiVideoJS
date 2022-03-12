(function ( $ ) {

    function randomIDMultiVideoJS() {

        var id;
        do {
            id = Date.now() + "_" + (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        } while ($("#" + id).length);
        return id;

    }

    function changeTech(a, b) {

        if (typeof a == 'undefined' || typeof b == 'undefined') {
            return true;
        }

        if (a == 'video/youtube' || b == 'video/youtube') {
            return true;
        }

        return false;

    }

    function getYTID(s) {

        var id = s;
        var re1 = new RegExp("youtube.com\/watch[?]v=([a-z,A-Z,0-9]*)");
        var re2 = new RegExp("youtu.be\/([a-z,A-Z,0-9,_,-]*)");
        if (id.match(re1)) {
            id = id.match(re1)[1];
        } else if (id.match(re2)) {
            id = id.match(re2)[1];
        }
        return id;

    }

    function isID(s) {

        var id = s;
        var re1 = new RegExp("youtube.com|youtu.be");
        if (id.match(re1)) return false;
        return true;

    }

    function binSearch(a, t, l, r) {

        if (r == l + 1) return l;

        var m = Math.floor((r + l) / 2);

        if (t < a[m]) return binSearch(a, t, l, m);

        return binSearch(a, t, m, r);

    }

    function searchAccum(a, t, l, r) {

        var len = a.length - 1;
        if (t >= a[len]) return len;
        return binSearch(a, t, 0, len);

    }
    
    function formatTime(t) {
        
        if (t < 0) {
            return "0:00";
        }
        return Math.floor(t / 60) + ':' + ("0" + Math.floor(t % 60)).slice(-2);
        
    }
    
    function convertISO8601(iso) {
                
        if (iso[0] != 'P') return false;
        
        var result = 0;
        
        iso = iso.substring(1);
        
        var currNum = iso.match(/^(\d+([.](\d)+)?)/);
        if (currNum) {
            currNum = currNum[0];
            iso = iso.substring(currNum.length);
        }
        
        if (iso[0] == 'Y') {
            
            iso = iso.substring(1);
            result = result + parseFloat(currNum)*31536000;
            currNum = iso.match(/^(\d+([.](\d)+)?)/);
            if (currNum) {
                currNum = currNum[0];
                iso = iso.substring(currNum.length);
            }
            
        }
        
        if (iso[0] == 'M') {
            
            iso = iso.substring(1);
            result = result + parseFloat(currNum)*2628000;
            currNum = iso.match(/^(\d+([.](\d)+)?)/);
            if (currNum) {
                currNum = currNum[0];
                iso = iso.substring(currNum.length);
            }
            
        }
        
        if (iso[0] == 'D') {
            
            iso = iso.substring(1);
            result = result + parseFloat(currNum)*86400;
            currNum = iso.match(/^(\d+([.](\d)+)?)/);
            if (currNum) {
                currNum = currNum[0];
                iso = iso.substring(currNum.length);
            }
            
        }
        
        if (iso[0] == 'T') {
            
            iso = iso.substring(1);
            currNum = iso.match(/^(\d+([.](\d)+)?)/);
            if (currNum) {
                currNum = currNum[0];
                iso = iso.substring(currNum.length);
            }

            if (iso[0] == 'H') {
                
                iso = iso.substring(1);
                result = result + parseFloat(currNum)*3600;
                currNum = iso.match(/^(\d+([.](\d)+)?)/);
                if (currNum) {
                    currNum = currNum[0];
                    iso = iso.substring(currNum.length);
                }
                
            }
            
            if (iso[0] == 'M') {
                
                iso = iso.substring(1);
                result = result + parseFloat(currNum)*60;
                currNum = iso.match(/^(\d+([.](\d)+)?)/);
                if (currNum) {
                    currNum = currNum[0];
                    iso = iso.substring(currNum.length);
                }
                
            }
            
            if (iso[0] == 'S') {
                
                iso = iso.substring(1);
                result = result + parseFloat(currNum)-1;
                
            }
            
        }

        return result;
        
    }

    $.fn.MultiVideoJS = function(obj) {
        
        if (this.hasClass('MV-player')) {
            console.log('Error: This object is already declared in Multivideo');
            return false;
        }

        _MV = this;

        if (typeof _MV != 'object' || _MV[0].tagName != 'DIV') {
            console.log('Error: Must be a DIV element.');
            return false;
        }

        if (typeof obj.sources != 'object' || obj.sources.length < 1) {
            console.log('Error: You must introduce the video sources.');
            return false;
        }

        var muted = false;
        var volume = 1;
        var speed = 1;
        var zoom = 1;
        var zoom_pos = {x: 0, y: 0};
        var poster = (obj.poster) ? obj.poster : "none";
        var slider = (obj.slider) ? obj.slider : "show";
        var totalLength = 0;
        var videoLengths = [];
        var accumLengths = [];
        var index = 0;
        var sources = obj.sources;
        var fixedControls = (obj.fixedControls) ? obj.fixedControls : false;
        var showCurrentTime = true;
        var time_offset = (obj.timeOffset) ? obj.timeOffset : 0;

        var userActive;
        var buffInterval;
        var moveSlider = false;

        var setTime = false;
        var isplay = (obj.autoplay) ? obj.autoplay : false;

        _MV.addClass("MV-player MV-poster MV-loading");
        if (muted) _MV.addClass("MV-muted");
        if (fixedControls) _MV.addClass("MV-fixed-controls");
        if (slider == 'hide') _MV.addClass("MV-slider-hide");

        _MV.empty();

        if (typeof obj.width != 'undefined' && typeof obj.height != 'undefined') {

            _MV.width(parseInt(obj.width));
            _MV.height(parseInt(obj.height));

        } else if (typeof obj.width != 'undefined') {

            _MV.width(parseInt(obj.width));
            _MV.height(parseInt(obj.width) / 16 * 9);

        } else if (typeof obj.height != 'undefined') {

            _MV.height(parseInt(obj.height));
            _MV.width(parseInt(obj.height) / 9 * 16);

        }

        _MV.append(
            "<div class='controls-layer' style='background-image: " + poster + ";'>" +
                "<button class='play-replay'></button>" +
                "<div class='loading'>" +
                    "<span></span>" +
                    "<span></span>" +
                    "<span></span>" +
                    "<span></span>" +
                "</div>" +
                "<nav class='controls-panel'>" +
                    "<button class='play-pause'></button>" +
                    "<div class='volume-mute'>" +
                        "<button class='mute'></button>" +
                        "<div class='slider selectable volume'>" +
                            "<div class='main fraction'><span></span></div>" +
                        "</div>" +
                    "</div>" +
                    "<div class='slider selectable current-time'>" +
                        "<div class='main fraction'><span></span></div>" +
                        "<div class='back fraction'></div>" +
                    "</div>" +
                    "<div class='extra-control'></div>" +
                    "<label class='button inline-icon speed'>" +
                        "<input type='checkbox'>" +
                        "<nav class='sub-control'>" +
                            "<span class='inline-icon slow'></span>" +
                            "<div class='slider selectable speed-slider'>" +
                                "<div class='main fraction' style='width: 50%;'><span></span></div>" +
                            "</div>" +
                            "<span class='inline-icon fast'></span>" +
                        "</nav>" +
                    "</label>" +
                    "<label class='button zoom'>" +
                        "<input type='checkbox'>" +
                        "<nav class='sub-control'>" +
                            "<button class='zoom-in'></button>" +
                            "<button class='zoom-up'></button>" +
                            "<button class='zoom-out'></button>" +
                            "<br>" +
                            "<button class='zoom-left'></button>" +
                            "<button class='zoom-down'></button>" +
                            "<button class='zoom-right'></button>" +
                        "</nav>" +
                    "</label>" +
                    "<span class='time'>0:00 / 0:00</span>" +
                "</nav>" +
            "</div>"
            );
            
        _MV.addControl = function (c) {
            
            if (typeof c.callback != 'function') return false;
            
            var elm = $('<button></button>');
            
            if (c.id) elm.attr('id', c.id);
            
            if (c.class) elm.attr('class', c.class);
            
            elm.on('click', c.callback);
            
            _MV.find('.extra-control').append(elm);
            
            return true;
            
        };
        
        _MV.removeControl = function (s) {
            
            if (typeof s != 'string') return false;
            if (s.length == 0) return false;
            
            var elm = _MV.find('.extra-control').children(s);
            
            if (elm == null) return false;
            
            elm.remove();
            
            return true;
            
        };

        _MV.index = function () {

            return index;

        }

        _MV.sourcesFull = function () {

            return sources;

        }

        _MV.getAspectRatio = function () {

            return _MV.width() / _MV.height();

        }
        
        _MV.getVideos = function () {
            
            return sources;
            
        }

        _MV.getBufferedFraction = function () {

            if (current.getBufferedFraction() < 1) {
                return (accumLengths[index] + current.getBufferedFraction() * current.duration()) / totalLength;
            }

            if (index < sources.length - 1) {
                return (accumLengths[index + 1] + buffering.getBufferedFraction() * buffering.duration()) / totalLength;
            }

            return 1;

        }

        _MV.currentTime = function (t) {

            if (typeof t == 'undefined') {
                return accumLengths[index] + current.currentTime();
            }

            t = parseFloat(t);

            if (typeof t != 'number' || isNaN(t)) {
                return accumLengths[index] + current.currentTime();
            }

            var i;
            var ct;
            var p = current.isPlaying();

            if (t <= 0) {
                i = 0;
                ct = 0;
            }

            else if (t >= totalLength) {
                i = sources.length - 1;
                ct = videoLengths[i] - 0.001;
            }

            else {
                i = searchAccum(accumLengths, t);
                ct = t - accumLengths[i];
            }

            index = i;
            setTime = ct;
            if (isplay == false) {
                isplay = p;
            }

            if (current.updateSrc(sources[i])) {

                current.trigger('ready');

            } else if (buffering.updateSrc(sources[i])) {

                invertPlayers();
                current.trigger('ready');

            } else {

                _MV.addClass("MV-loading");
                current.src(sources[i]);

            }

            if (i < sources.length - 1) {

                if (buffering.updateSrc(sources[i + 1])) {

                    buffering.currentTime(0);

                } else {

                    buffering.src(sources[i + 1]);

                }

            }
            
            updateSeconds(t);
            
            if (moveSlider[0] != _MV.children('.controls-layer').children('.controls-panel').children('.current-time').children('.main')[0]) {
                _MV.children('.controls-layer').children('.controls-panel').children('.current-time').children('.main').css('width', _MV.currentFraction() * 100 + "%");
            }
            
            startBufferingComp();
            
            return accumLengths[index] + current.currentTime();

        }
        
        _MV.showTimeAsCurrent = function (t) {
            
            if (typeof t == 'undefined') {
                return;
            }

            v = parseFloat(v);

            if (typeof v != 'number' || isNaN(v)) {
                return;
            }
            
            showCurrentTime = false;
            
            var ft = formatTime(t) + ' / ' + formatTime(totalLength);
            
            if (!ft.match('NaN')) {
                _MV.children('.controls-layer').children('.controls-panel').children('.time').html(ft);
            }
            
        }
        
        _MV.noShowTimeAsCurrent = function () {
            
            showCurrentTime = true;
            
        }

        _MV.getCurrentTimeInVideo = function () {

            return current.getCurrentTimeInVideo();

        }

        _MV.currentFraction = function (t) {

            if (typeof t == 'undefined') {
                return _MV.currentTime() / totalLength;
            }

            t = parseFloat(t);

            if (typeof t != 'number' || isNaN(t)) {
                return _MV.currentTime() / totalLength;
            }

            if (t > 1) t = 1;
            else if (t < 0) t = 0;

            _MV.currentTime(t * totalLength);
            
            return t;

        }

        _MV.duration = function () {

            return totalLength;

        }
        
        _MV.ended = function () {

            return (index >= sources.length - 1 && current.ended());

        }
        
        _MV.timeOffset = function(t) {
            
            if (typeof t == 'number') {

                time_offset = t;

            }

            return time_offset;
            
        }

        _MV.fixedControls = function (f) {

            if (typeof f == 'boolean') {

                fixedControls = f;

                if (fixedControls) {
                    _MV.addClass('MV-fixed-controls');
                } else {
                    _MV.removeClass('MV-fixed-controls');
                }

            }

            return fixedControls;

        }
        
        _MV.inlineControlsShow = function (b) {
            
            if (b) {
                _MV.addClass('MV-controls-always');
            } else {
                _MV.removeClass('MV-controls-always');
            }
            
        }

        _MV.getFormatTime = function () {

            return formatTime(_MV.currentTime()) + ' / ' + formatTime(totalLength);

        }

        _MV.isPlaying = function () {

            return current.isPlaying();

        }

        _MV.isNotLast = function () {

            return (index < sources.length - 1);

        }

        _MV.muted = function (m) {

            if (typeof m != 'boolean') return muted;

            muted = m;

            current.muted(muted);
            if (sources.length > 1) buffering.muted(muted);

            if (muted) {
                _MV.addClass("MV-muted");
            } else {
                _MV.removeClass("MV-muted");
            }
            
            return muted;

        }

        _MV.toggleMuted = function () {

            return _MV.muted(!muted);

        }

        _MV.pause = function () {

            if (_MV.isPlaying()) {
                _MV.addClass("MV-paused");
                _MV.trigger('pause');
            }

            current.pause();

        }

        _MV.play = function () {

            if (_MV.ended() || _MV.hasClass("MV-replay")) {
                _MV.removeClass("MV-replay");
                isplay = true;
                _MV.currentTime(0);
            }

            if (!_MV.isPlaying()) {
                _MV.trigger('play');
            }

            _MV.addClass("MV-controls");
            _MV.removeClass("MV-poster MV-paused");

            current.play();

        }

        _MV.poster = function (p) {

            if (typeof p != 'string' || p.length < 1) {
                return poster;
            }

            poster = p;
            _MV.children(".controls-layer").css("background-image", "url('" + poster + "')");
            
            return poster;

        }

        _MV.getRemainingTime = function () {

            return totalLength - _MV.currentTime();

        }

        _MV.togglePlay = function () {

            if (!_MV.isPlaying()) {

                _MV.play();

            } else {

                _MV.pause();

            }

        }

        _MV.volume = function (v) {

            if (typeof v == 'undefined') {
                return volume;
            }

            v = parseFloat(v);

            if (typeof v != 'number' || isNaN(v)) {
                return volume;
            }

            if (v < 0) v = 0;
            else if (v > 1) v = 1;
            volume = v;

            current.volume(volume);
            if (sources.length > 1) buffering.volume(volume);

        }
        
        _MV.speed = function (s) {
                        
            if (typeof s == 'undefined') {
                return speed;
            }

            s = parseFloat(s);

            if (typeof s != 'number' || isNaN(s)) {
                return speed;
            }

            if (s < 0) s = 0;
            speed = s;
            
            if (speed < 1) {
                _MV.attr('data-speed', 'slow');
            } else if (speed > 1) {
                _MV.attr('data-speed', 'fast');
            } else {
                _MV.attr('data-speed', 'normal');
            }

            current.speed(speed);
            if (sources.length > 1) buffering.speed(speed);
            
            return speed;
            
        }
        
        _MV.zoom = function (z) {
            
            if (typeof z == 'undefined') {
                return zoom;
            }

            z = parseFloat(z);

            if (typeof z != 'number' || isNaN(z)) {
                return zoom;
            }
            
            if (z < 1) z = 1;
            
            zoom = z;
            
            var max = (50*(zoom-1))/zoom;
            
            _MV.children('.MV-vjs').css('transform', 'scale('+zoom+') translate('+(max*zoom_pos.x)+'%, '+(max*zoom_pos.y)+'%)');
            
            return zoom;
                        
        }
        
        _MV.zoomMove = function (x, y) {
            
            var zx, zy;
            
            if (typeof x == 'undefined') {
                
                return zoom_pos;
                
            } else if (typeof x == 'object') {
                
                if (x.x) zx = x.x;
                if (x.y) zy = x.y;
                
            } else {
                
                if (x) zx = x;
                if (y) zy = y;
                
            }
            
            zx = parseFloat(zx);

            if (typeof zx != 'number' || isNaN(zx)) {
                zx = zoom_pos.x;
            }
            
            zy = parseFloat(zy);

            if (typeof zy != 'number' || isNaN(zy)) {
                zy = zoom_pos.y;
            }
            
            if (zy > 1) zy = 1;
            if (zy < -1) zy = -1;
            
            if (zx > 1) zx = 1;
            if (zx < -1) zx = -1;
            
            zoom_pos = {x: zx, y: zy};
            
            var max = (50*(zoom-1))/zoom;
            
            _MV.children('.MV-vjs').css('transform', 'scale('+zoom+') translate('+(max*zoom_pos.x)+'%, '+(max*zoom_pos.y)+'%)');
            
            return zoom_pos;
                        
        }
                
        function updateSeconds(t) {
                        
            if (showCurrentTime) {
                
                if (!t || typeof t != 'number') t = _MV.currentTime();
                
                if (time_offset) t += time_offset;
                
                var ft = formatTime(t) + ' / ' + formatTime(totalLength)
                
                if (!ft.match('NaN')) {
                    _MV.children('.controls-layer').children('.controls-panel').children('.time').html(ft);
                }
                
            }
            
        }

        function invertPlayers() {

            buffering = [current, current = buffering][0];
            current.wrapper().removeClass('MV-buffering');
            buffering.wrapper().addClass('MV-buffering');
            current.isCurrent(true);
            buffering.isCurrent(false);

        }
        
        if (obj.extraControls) {
            
            var k = Object.keys(obj.extraControls);

            k.forEach(function(j) {
                _MV.addControl(obj.extraControls[k[j]]);
            });
            
        }

        current = new MV_Player(_MV, 'MV-vjs');
        buffering = new MV_Player(_MV, 'MV-buffering MV-vjs');

        current.on('ready', readyMultivideo);

        current.on('ready', readyBuffering);
        buffering.on('ready', readyBuffering);

        current.on('ended', continueReproduction);
        buffering.on('ended', continueReproduction);
        
        var md = new MV_Metadata({
            parent:     _MV,
            src:        sources,
            done:       function(a, v, t, s) {
                            accumLengths = a;
                            videoLengths = v;
                            totalLength = t;
                            sources = s;
                            delete md;
                            startReproduction();
                        }
        });

        function startBufferingComp() {
            clearInterval(buffInterval);
            buffInterval = setInterval(function() {
                if (_MV.getBufferedFraction() >= 1) {
                    clearInterval(buffInterval);
                    _MV.children('.controls-layer').children('.controls-panel').children('.current-time').children('.back').css('width', "100%");
                    return;
                }
                _MV.children('.controls-layer').children('.controls-panel').children('.current-time').children('.back').css('width', _MV.getBufferedFraction() * 100 + "%");
            }, 1000);
        }

        function startReproduction() {

            index = 0;
            current.src(sources[index]);
            if (_MV.isNotLast()) {
                buffering.src(sources[index + 1]);
            }

        }

        function readyMultivideo() {

            _MV.volume(volume);
            _MV.muted(muted);
            _MV.speed(speed);
            current.isCurrent(true);
            this.off('ready', readyMultivideo);
            _MV.trigger('ready');
            startBufferingComp();

        }

        function readyBuffering() {

            if (!this.isCurrent()) {
                this.currentTime(0);
                return;
            }

            if (!setTime) {
                this.currentTime(0);
            } else {
                this.currentTime(setTime);
            }

            _MV.removeClass("MV-loading");

            if (isplay) this.play();
            else this.pause();

            setTime = false;
            isplay = false;

        }

        function continueReproduction() {
            
            if (!this.isCurrent()) return;
            
            if (_MV.ended()) {
                
                _MV.addClass("MV-poster MV-replay");
                _MV.removeClass("MV-controls");
                _MV.trigger('ended');
                return;

            }

            invertPlayers();
            current.play();
            index++;

            if (_MV.isNotLast()) {
                buffering.src(sources[index + 1]);
            }

            _MV.trigger('nextVideo');

        }

        /* Control Panel Events */
        
        function controlsRemainTimeout(e) {
            
            _MV.addClass('MV-controls-active');
            
            clearTimeout(userActive);
            userActive = setTimeout(function () {
                _MV.children('.controls-layer').children('.controls-panel').children('label.button').children('input[type=checkbox]').prop('checked', false);
                _MV.removeClass('MV-controls-active');
            }, 5000);
            
        }

        _MV.on('mousemove', controlsRemainTimeout);
        
        _MV.children('.controls-layer').children('.controls-panel').find('.sub-control').on('mouseup', controlsRemainTimeout);
        
        _MV.children('.controls-layer').children('.controls-panel').find('.sub-control').on('click', function(e) {
            
            e.stopPropagation();
            e.preventDefault();
            
        });

        _MV.children(".controls-layer").on('click', function(e) {

            if (_MV.hasClass('MV-loading')) {

                return;

            }

            if (_MV.hasClass('MV-replay')) {

                _MV.children('.controls-layer').children('.play-replay').animate({
                    "width": 120,
                    "height": 120,
                    "opacity": 0,
                    "font-size": 90,
                }, {
                    duration: 300,
                    complete: function() {
                        _MV.togglePlay();
                        _MV.children('.controls-layer').children('.play-replay').css("width", "");
                        _MV.children('.controls-layer').children('.play-replay').css("height", "");
                        _MV.children('.controls-layer').children('.play-replay').css("opacity", "");
                        _MV.children('.controls-layer').children('.play-replay').css("font-size", "");
                        _MV.children('.controls-layer').children('.play-replay').css("transform", "");
                    }
                });

            } else if (_MV.hasClass('MV-poster')) {

                _MV.children('.controls-layer').children('.play-replay').animate({
                    "width": 120,
                    "height": 120,
                    "opacity": 0,
                    "font-size": 90
                }, {
                    duration: 300,
                    complete: function() {
                        _MV.play();
                        _MV.children('.controls-layer').children('.play-replay').css("width", "");
                        _MV.children('.controls-layer').children('.play-replay').css("height", "");
                        _MV.children('.controls-layer').children('.play-replay').css("opacity", "");
                        _MV.children('.controls-layer').children('.play-replay').css("font-size", "");
                    }
                });

            } else {

                _MV.togglePlay();

            }

        });

        _MV.children('.controls-layer').children('.controls-panel').on('click touchend', function(e) {
            e.stopPropagation();
        });

        _MV.children('.controls-layer').children('.controls-panel').children('.play-pause').on('click touchend', function(e) {
            _MV.togglePlay();
        });
        
        _MV.children('.controls-layer').children('.controls-panel').children('label.button').children('input[type=checkbox]').on('change', function(e) {
            $(this).parent().siblings('label.button').children('input[type=checkbox]').prop('checked', false);
        });
        
        _MV.children('.controls-layer').children('.controls-panel').children('label.speed').find('.slider').children('.main').on('update', function(e) {
            
            var p = $(this).width() / $(this).parent().width();
            
            if (p >= 0.4 && p <= 0.6) {
                $(this).width('50%');
                _MV.speed(1);
                return;
            }
                        
            if (p < 0.5) {
                p += 0.5;
            } else {
                p -= 0.5;
                p *= 2;
                p *= 4;
            }
            
            _MV.speed(p);
            
        });
                
        _MV.children('.controls-layer').children('.controls-panel').children('label.zoom').children('.sub-control').children('.zoom-in').on('click', function(e) {
                        
            _MV.zoom(_MV.zoom() * 1.1);
            
        });
        
        _MV.children('.controls-layer').children('.controls-panel').children('label.zoom').children('.sub-control').children('.zoom-out').on('click', function(e) {
                        
            _MV.zoom(_MV.zoom() * 0.9090);
            
        });
        
        _MV.children('.controls-layer').children('.controls-panel').children('label.zoom').children('.sub-control').children('.zoom-up').on('click', function(e) {
                        
            var pos = _MV.zoomMove();
            var d = 0.1 / _MV.zoom();
            _MV.zoomMove(pos.x, pos.y+d);
            
        });
        
        _MV.children('.controls-layer').children('.controls-panel').children('label.zoom').children('.sub-control').children('.zoom-down').on('click', function(e) {
                        
            var pos = _MV.zoomMove();
            var d = 0.1 / _MV.zoom();
            _MV.zoomMove(pos.x, pos.y-d);
            
        });
        
        _MV.children('.controls-layer').children('.controls-panel').children('label.zoom').children('.sub-control').children('.zoom-right').on('click', function(e) {
                        
            var pos = _MV.zoomMove();
            var d = 0.1 / _MV.zoom();
            _MV.zoomMove(pos.x-d, pos.y);
            
        });
        
        _MV.children('.controls-layer').children('.controls-panel').children('label.zoom').children('.sub-control').children('.zoom-left').on('click', function(e) {
                        
            var pos = _MV.zoomMove();
            var d = 0.1 / _MV.zoom();
            _MV.zoomMove(pos.x+d, pos.y);
                        
        });

        _MV.children('.controls-layer').children('.controls-panel').children('.volume-mute').children('.mute').on('click touchend', function(e) {
            _MV.toggleMuted();
        });

        _MV.children('.controls-layer').children('.controls-panel').find('.slider').children('.main').children('span').on('mousedown', function(e) {

            moveSlider = $(this).parent();
            $(this).parents('.volume-mute').addClass('fixed');

            $(document).on('mousemove', mousemove_func);

            $(document).on('mouseup', mouseup_func);

        });
        
        _MV.children('.controls-layer').children('.controls-panel').find('.slider').on('click', function(e) {
            
            if (!moveSlider) {

                offleft = $(this).offset().left;
                offright = offleft + $(this).width();

                var x = e.pageX;

                if (x <= offleft) $(this).children('.main').css('width', '0%');
                else if (x >= offright) $(this).children('.main').css('width', '100%');

                else {
                    $(this).children('.main').css('width', ((x - offleft)/(offright - offleft))*100 + '%');
                }

                $(this).children('.main').trigger('update');

            }

        });
        
        _MV.children('.controls-layer').children('.controls-panel').find('.sub-control').find('.slider').on('click', function(e) {

            e.stopPropagation();
            e.preventDefault();

        });

        _MV.children('.controls-layer').children('.controls-panel').children('.volume-mute').children('.volume').children('.main').on('update', function(e) {
            var p = $(this).width() / $(this).parent().width();
            _MV.volume(p);
        });

        _MV.children('.controls-layer').children('.controls-panel').children('.current-time').children('.main').on('update', function(e) {
            var p = $(this).width() / $(this).parent().width();
            _MV.currentFraction(p);
        });

        function mousemove_func(e) {

            if (e.which != 1) {

                $(moveSlider).trigger('update');
                $(moveSlider).parents('.volume-mute').removeClass('fixed');

                moveSlider = false;

                $(document).off('mousemove', mousemove_func);

                $(document).off('mouseup', mouseup_func);

            }

            offleft = moveSlider.parent().offset().left;
            offright = offleft + moveSlider.parent().width();

            var x = e.pageX;

            if (x <= offleft) moveSlider.css('width', '0%');
            else if (x >= offright) moveSlider.css('width', '100%');

            else {
                moveSlider.css('width', ((x - offleft)/(offright - offleft))*100 + '%');
            }

        }

        function mouseup_func(e) {

            $(moveSlider).trigger('update');
            $(moveSlider).parents('.volume-mute').removeClass('fixed');

            moveSlider = false;

            $(document).off('mousemove', mousemove_func);

            $(document).off('mouseup', mouseup_func);

        }

        current.on('playing', playing_func);
        buffering.on('playing', playing_func);

        function playing_func(e) {
            
            updateSeconds();
            
            if (moveSlider[0] != _MV.children('.controls-layer').children('.controls-panel').children('.current-time').children('.main')[0]) {
                _MV.children('.controls-layer').children('.controls-panel').children('.current-time').children('.main').css('width', _MV.currentFraction() * 100 + "%");
            }
            
            _MV.trigger('playing');
            
        }

        return _MV;

    };

    function MV_Player(_mv, c) {

        if (typeof _mv != 'object' && _mv.hasClass("MV-player")) {

            console.log('Error: Must be a valid id.');
            return;

        }

        var _p = this;

        var mv = _mv;
        var elm = randomIDMultiVideoJS();
        var cla = (typeof c == 'string') ? c : "";
        var player;

        var ini;
        var end;
        var source;
        var type;
        var muted = true;
        var volume = 1;
        var speed = 1;
        var playTime;
        var load = false;
        var curr = false;
        var eventHandlers = {};
        var ready = false;
        var tuTimeout;

        _p.getBufferedFraction = function () {

            var load = player.bufferedEnd();
            if (load >= end) return 1;
            if (load <= ini) return 0;
            return (load - ini)/(end - ini);

        }

        _p.src = function (s) {

            if (s == undefined) return source;

            ready = false;

            ini = s.ini;
            end = s.end;

            if (typeof type == 'undefined') {

                type = s.type;
                source = s.src;

                mv.append('<video id="' + elm + '" class="' + cla + '" preload data-setup=' + "'" + '{ "techOrder": ["html5", "youtube"]}' + "'" + '></video>');

                player = videojs(elm);

                player.on('loadedmetadata', function() {

                    if (type != 'video/youtube') {
                        ready = true;
                        _p.trigger('ready');
                    } else {
                        _p.play();
                    }

                });

                player.on('timeupdate', function() {

                    if (this.paused()) return;

                    if (!ready && type == 'video/youtube') {
                        ready = true;
                        _p.trigger('ready');
                    }

                    if (!curr) {

                        player.pause();
                        return;

                    }

                    if (_p.ended() ) {

                        player.pause();
                        _p.trigger('ended');
                        return;

                    }
                    
                    var rtm = _p.duration() - _p.currentTime();
                    if (rtm <= 0.25) {
                        clearTimeout(tuTimeout);
                        tuTimeout = setTimeout(function () {
                            player.trigger('timeupdate');
                        }, rtm*1000);
                    }

                    _p.trigger('playing');

                });

                player.on('ended', function() {

                    _p.trigger('ended');

                });

                _p.volume(volume);
                _p.muted(muted);
                _p.speed(speed);

                player.src({src: source, type: type});

            } else {

                
                
                if (_p.updateSrc(s)) {

                    _p.currentTime(0);

                } else {
                    
                    ini = s.ini;
                    end = s.end;
                    source = s.src;
                    type = s.type;
                    player.src({src: source, type: type});
                    
                }

            }

        }

        _p.init = function() {

            if (typeof ini != 'number' || ini < 0) {
                ini = 0;
            }

            if (typeof end != 'number' || end > _p.srcDuration()) {
                end = _p.srcDuration();
            }

            if (ini >= end) {
                ini = 0;
                end = _p.srcDuration();
            }

        }

        _p.updateSrc = function (s) {

            if (source != s.src) return false;

            ini = s.ini;
            end = s.end;

            return true;

        }

        _p.isReady = function() {

            return ready;

        }

        _p.isCurrent = function(c) {

            if (typeof c == "boolean") {

                curr = c;

            }

            else return curr;

        }

        _p.isType = function(t) {

            return type == t;

        }

        _p.srcDuration = function () {

            return player.duration();

        }

        _p.currentTime = function (t) {

            if (t == undefined) {

                return player.currentTime() - ini;

            }

            if (t < 0) t = ini;
            else if (t > end - ini) t = end;
            else t = t + ini;

            player.currentTime(t);

        }

        _p.getCurrentTimeInVideo = function () {

            return player.currentTime();

        }

        _p.currentFraction = function (t) {

            if (t == undefined) {

                return _p.currentTime() / _p.duration();

            }

            t *= _p.duration();
            _p.currentTime(t);

        }

        _p.destroyPlayer = function () {

            player.off();
            player.dispose();

        }

        _p.duration = function () {

            return end - ini;

        }

        _p.ended = function () {

            var b;

            b = player.ended();

            return (b || _p.currentTime() >= _p.duration());

        }

        _p.muted = function (m) {

            if (m != undefined) {

                player.muted(m);

                muted = m;
                return m;
            }

            return player.muted();

        }

        _p.pause = function () {

            var b = _p.isPlaying();

            player.pause();

            if (b) _p.trigger('pause');

        }

        _p.play = function () {

            var b = !_p.isPlaying();

            player.play();

            if (b) _p.trigger('play');

        }

        _p.isPlaying = function () {

            return !player.paused();

        }

        _p.on = function(e, f) {

            if (typeof e == 'string' && typeof f == 'function') {

                if (eventHandlers[e] == undefined) {
                    eventHandlers[e] = [f];
                    return;
                }

                eventHandlers[e].push(f);

            }

        }

        _p.off = function(e, f) {

            if (e == undefined) return;
            if (eventHandlers[e] == undefined) return;

            if (f == undefined) {
                delete eventHandlers[e];
                return;
            }

            var i = eventHandlers[e].indexOf(f);
            eventHandlers[e].splice(i, 1);
            if (eventHandlers[e].length < 1) delete eventHandlers[e];

        }

        _p.trigger = function(e) {

            if (eventHandlers[e] == undefined) return;

            var tempEH = jQuery.extend({}, eventHandlers[e]);

            var k = Object.keys(tempEH);

            k.forEach(function(j) {
                tempEH[k[j]].call(_p);
            });

        }

        _p.getRemainingTime = function () {

            return _p.duration() - _p.currentTime();

        }

        _p.volume = function (v) {

            if (v == undefined) return volume;

            volume = v;

            player.volume(volume);

        }
        
        _p.speed = function (s) {
            
            if (s == undefined) return speed;

            speed = s;

            player.playbackRate(speed);
            
        }

        _p.wrapper = function () {

            return $('#' + elm);

        }

    }

    function MV_Metadata(obj) {
        
        if (typeof obj != 'object' || !obj.parent.hasClass("MV-player")) {

            console.log('Error: Paramaters set wrongly.');
            return;

        }

        if (typeof obj.src != 'object' || obj.src < 1) {

            console.log('Error: Sources cannot be empty.');
            return;

        }

        var _md = this;

        var mv = obj.parent;
        var done = (typeof obj.done != 'function') ? false : obj.done;
        var sources = obj.src;

        var elm = randomIDMultiVideoJS();
        var player;

        var ini;
        var end;
        var source;
        var type;
        var ready = false;

        index = 0;
        accumLengths = [];
        videoLengths = [];
        totalLength = 0;

        _md.src = function (s) {

            if (s == undefined) return source;

            ready = false;

            ini = s.ini;
            end = s.end;

            if (changeTech(type, s.type)) {

                if (type != undefined) {
                    _md.destroy();
                }

                type = s.type;

                switch (type) {
                    case 'video/youtube':

                        source = getYTID(s.src);
                                                
                        player = new MV_youtube_duration({
                            ready: function() {
                                _md.init();
                                ready = true;
                                _md.nextVideo();
                            }
                        });
                        
                        player.src(source);
                        
                        break;

                    default:

                        source = s.src;

                        mv.append('<video id="' + elm + '" class="MV-metadata" preload></video>');

                        player = videojs(elm);

                        player.on('loadedmetadata', function() {

                            if (!ready) {

                                _md.init();
                                ready = true;
                                _md.nextVideo();

                            }

                        });

                        player.muted(true);

                        player.src({src: source, type: type});

                }

            } else {

                if (source == getYTID(s.src)) {

                    _md.init();
                    _md.nextVideo();
                    return;

                }

                switch (type) {

                    case 'video/youtube':
                        source = getYTID(s.src);
                        player.src(source);
                                                
                        break;

                    default:
                        source = s.src;
                        player.src({src: source, type: type});

                }

            }

        }

        _md.init = function() {

            if (typeof ini != 'number' || ini < 0) {
                ini = 0;
            }

            if (typeof end != 'number' || end > _md.srcDuration()) {
                end = _md.srcDuration();
            }

            if (ini >= end) {
                ini = 0;
                end = _md.srcDuration();
            }

        }

        _md.srcDuration = function () {

            switch (type) {
                case 'video/youtube':
                    return player.getDuration();
                    break;

                default:
                    return player.duration();
            }

        }

        _md.destroy = function () {
            
            switch (type) {
                case 'video/youtube':
                    delete player;
                    break;

                default:
                    player.pause();
                    player.dispose();
            }

            type = 'destroy';

        }

        _md.duration = function () {

            return end - ini;

        }

        _md.nextVideo = function() {

            accumLengths[index] = totalLength;
            videoLengths[index] = _md.duration();
            totalLength += videoLengths[index];
            sources[index].ini = ini;
            sources[index].end = end;
            sources[index].duration = _md.srcDuration();
            ++index;

            if (index < sources.length) {
                _md.src(sources[index]);
            }

            else {
                _md.destroy();

                if (done) {
                    done(accumLengths, videoLengths, totalLength, sources);
                }
            }

        }

        _md.getPlayer = function() {

            return player;

        }

        _md.src(sources[index]);

    }
    
    function MV_youtube_duration(obj) {
        
        var _ydur = this;
        
        this.ready = (obj.ready) ? obj.ready : false;
        
        var duration = 0;
        var source;
        
        this.src = function (src) {
            
            if (typeof src == 'undefined') return source;
            
            source = getYTID(src);
            
            make();
            
        }
        
        this.getDuration = function() {
            
            return duration;
            
        }
                
        function make() {
            
            var url = "https://www.googleapis.com/youtube/v3/videos?id=" + source + "&key=AIzaSyDYwPzLevXauI-kTSVXTLroLyHEONuF9Rw&part=snippet,contentDetails";
            $.ajax({
                async: false,
                type: 'GET',
                url: url,
                success: function(data) {
                    duration = convertISO8601(data.items[0].contentDetails.duration);
                    if (_ydur.ready) _ydur.ready();
                }
            });
            
        }
        
        return _ydur;
        
    }

}( jQuery ));

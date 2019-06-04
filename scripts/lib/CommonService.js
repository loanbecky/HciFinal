"use strict";

var commonService = (function($){
    const _this = {};
    const $alertMessage = $('#alertMessage');
    let _timeout = null;

    _this.alert = $alertMessage;

    $(function(){
        $alertMessage.find('.close').click(function () {
            $alertMessage.addClass('d-none');
            return false;
        });
    });

    _this.alertMessage = function (message) {
        if (message) {
            $alertMessage.find('.content').html(message);
            $alertMessage.removeClass('d-none');
            clearTimeout(_timeout);
            _timeout = setTimeout(function () {
                $alertMessage.addClass('d-none');
            }, 4000);
        } else {
            $alertMessage.find('.content').html('');
            $alertMessage.addClass('d-none');
        }
    };
    return _this;
})(jQuery);
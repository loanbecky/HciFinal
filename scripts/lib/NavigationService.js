'use strict';

var navigationService = (function(){
    var _this = {};
    
    _this.toHome = function(){
        location = '/';
    };
    _this.toLogin = function(){
        location = `${LOGIN_PAGE_URL}?returnUrl=${location.pathname}`;
    };
    _this.toDenied = function(){
        location = DENIED_PAGE_URL;
    };
    _this.toLocalUrl = function(url){
        location = url;
    };
    _this.page = function(){
        return location.pathname;
    };

    return _this;
})();
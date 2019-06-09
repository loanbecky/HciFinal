'use strict';
const BASE_URL = "/HciFinal";
const LOGIN_PAGE_URL = `${BASE_URL}/login.html`;
const DENIED_PAGE_URL = `${BASE_URL}/access-denied.html`;

var navigationService = (function(){
    var _this = {};
    
    _this.toHome = function(){
        location = `${BASE_URL}/`;
    };
    _this.toLogin = function(){
        location = `${LOGIN_PAGE_URL}?returnUrl=${location.pathname}`;
    };
    _this.toDenied = function(){
        location = DENIED_PAGE_URL;
    };
    _this.toLocalUrl = function(url){
        location = `${url}`;
    };
    _this.page = function(){
        return `${location.pathname}`;
    };
    _this.reload = function(){
        location.reload();
    };

    return _this;
})();
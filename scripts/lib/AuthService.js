'use strict';
var authService = (function (userService) {
    var _this = {};

    _this.isSignedIn = function () {
        return userService.getCurrentUser() != null;
    };

    _this.signIn = function (email, password) {
        if (!email || !password) return false;
        var user = userService.getUser(email, password);
        if (user != null) {
            userService.setCurrentUser(user);
            return true;
        }
        return false;
    };

    _this.signOut = function () {
        userService.setCurrentUser(null);
    };

    return _this;
})(userService);
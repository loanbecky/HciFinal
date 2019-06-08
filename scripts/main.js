'use strict';

(function ($, authService, navigationService, permissionService, config, userService) {
    if (!config) navigationService.toDenied();

    //authenticate
    if (config.requireLogin() && !authService.isSignedIn()) {
        navigationService.toLogin();
    }
    //authorize
    const requiredRole = config.requireRole();
    if (requiredRole && !permissionService.inRole(requiredRole)) {
        navigationService.toLogin();
    }
    $(function () {
        const currentUser = userService.getCurrentUser();
        const $userInfo = $('#user-info');
        const $userLogin = $('#user-login');
        if (currentUser) {
            $userInfo.removeClass('d-none');
            $userLogin.addClass('d-none');
            $userInfo.find('#currentUserEmail').text(currentUser.email);
        } else {
            $userInfo.addClass('d-none');
            $userLogin.removeClass('d-none');
        }

        $('#logout').click(function (e) {
            e.preventDefault();
            authService.signOut();
            navigationService.toHome();
        });
    });

})(jQuery, authService, navigationService, permissionService, __config__, userService);
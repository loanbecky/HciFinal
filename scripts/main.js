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
        var currentUser = userService.getCurrentUser();
        if(currentUser){
            $('#currentUserEmail').text(currentUser.email);
        }

        $('#logout').click(function(e){
            e.preventDefault();
            authService.signOut();
            navigationService.toHome();
        });
    });

})(jQuery, authService, navigationService, permissionService, __config__, userService);
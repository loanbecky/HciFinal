'use strict';

var userService = (function (rep, navigationService) {
    const _this = {};
    let _currentUser = null;
    const CURRENT_USER_NAME = 'itnewsblog.currentUser';

    _this.getCurrentUser = function () {
        if (!_currentUser) {
            _currentUser = rep.getSessionEntities(CURRENT_USER_NAME);
        }
        return _currentUser;
    };
    _this.setCurrentUser = function (user) {
        _currentUser = user;
        rep.saveSessionEntities(CURRENT_USER_NAME, user);
    };
    _this.getUser = function (email, password) {
        const users = rep.getEntities(rep.keys.user);
        if (users && users.length) {
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (user.password && user.email && user.password == password && user.email.toLowerCase() == email.toLowerCase()) {
                    return user;
                }
            }
        }
        return null;
    };
    _this.checkEmail = function (email) {
        const users = rep.getEntities(rep.keys.user);
        if (users && users.length) {
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (user.email && user.email.toLowerCase() == email.toLowerCase()) {
                    return user;
                }
            }
        }
        return null;
    };

    _this.isSessionUser = function (user) {
        if (!user) return false;
        var sessionUser = rep.getSessionEntities(CURRENT_USER_NAME);
        if (sessionUser && sessionUser.id == user.id) {
            return true;
        }
        return false;
    };

    _this.insertUser = function (userData, callback) {
        if (!userData) return false;

        var userId = rep.insertEntity(rep.keys.user, { fullname: userData.fullname, email: userData.email, password: userData.password, createdOn: new Date(), updatedOn: new Date() });
        if (userData.role) {
            rep.insertEntity(rep.keys.userRole, { userId: userId, roleId: userData.role });
        } else {
            var guestRole = rep.getEntityByName(rep.keys.role, "guest");
            if(guestRole){
                rep.insertEntity(rep.keys.userRole, { userId: userId, roleId: guestRole.id });
            }
        }
        if(callback) callback(userId);
    };
    _this.deleteUserRoleByUserId = function (userId) {
        const userRoles = rep.getEntities(rep.keys.userRole);
        if (userRoles && userRoles.length) {
            for (var i = 0, userRole; userRole = userRoles[i]; i++) {
                if (userRole.userId == userId) {
                    rep.deleteEntityById(rep.keys.userRole, userRole.id);
                }
            }
        }
    };
    _this.getRoleByUserId = function (userId) {
        const userRoles = rep.getEntities(rep.keys.userRole);
        if (userRoles && userRoles.length) {
            for (var i = 0, userRole; userRole = userRoles[i]; i++) {
                if (userRole.userId == userId) {
                    const role = rep.getEntityById(rep.keys.role, userRole.roleId);
                    return role;
                }
            }
        }
        return null;
    };
    _this.updateUser = function (id, userData) {
        if (!userData) return false;
        var user = rep.getEntityById(rep.keys.user, id);
        if (!user) return false;

        var updatedUser = rep.updateEntity(rep.keys.user, id, { email: userData.email, password: userData.password, fullname: userData.fullname, updatedOn: new Date() });
        _this.deleteUserRoleByUserId(user.id);
        rep.insertEntity(rep.keys.userRole, { userId: user.id, roleId: userData.role });

        return updatedUser;
        // if(_this.checkUpdateSessionUser(user)) {
        //     _this.setCurrentUser(user);
        //     navigationService.reload();
        // }
    };

    _this.deleteUser = function (user) {
        if (!user) return false;
        const result = rep.deleteEntityById(rep.keys.user, user.id);
        if (result) {
            _this.deleteUserRoleByUserId(user.id);

            // if (_this.checkUpdateSessionUser(user)) {
            //     _this.setCurrentUser(null);
            //     navigationService.reload();
            // }
            return true;
        }
        return false;
    };

    return _this;
})(repository, navigationService);
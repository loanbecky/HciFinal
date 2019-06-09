'use strict';

var permissionService = (function (rep, userService) {
    var _this = {};

    _this.userInRole = function (userEntity, roleData) {
        if (!userEntity || !roleData) return false;

        userEntity = rep.getEntityById(rep.keys.user, userEntity.id);
        let role = getRole(roleData);

        if (role == null || userEntity == null) return false;

        var userRoleEntities = rep.getEntities(rep.keys.userRole);
        if (userRoleEntities) {
            for (var i = 0; i < userRoleEntities.length; i++) {
                var userRole = userRoleEntities[i];
                if (userRole.userId == userEntity.id && userRole.roleId == role.id) {
                    return true;
                }
            }
        }
        return false;
    };

    _this.userCanDoAction = function (userEntity, resourceData, action) {
        if (!userEntity || !action || !resourceData) return false;

        userEntity = rep.getEntityById(rep.keys.user, userEntity.id);
        let permission = getPermission(resourceData);
        if (userEntity == null || permission == null) return false;

        var userRoleEntities = rep.getEntities(rep.keys.userRole);
        if (userRoleEntities) {
            for (var i = 0; i < userRoleEntities.length; i++) {
                var userRole = userRoleEntities[i];
                if (userRole.userId == userEntity.id) {
                    var rolePermission = getRolePermission(userRole.roleId, permission.id);
                    if(rolePermission == null) continue;
                    switch (action.toLowerCase()) {
                        case 'read':
                            return rolePermission.read;
                        case 'create':
                            return rolePermission.create;
                        case 'update':
                            return rolePermission.update;
                        case 'delete':
                            return rolePermission.delete;
                    }
                }
            }
        }
        return false;
    };

    _this.getCanDoActions = function (userEntity, resourceData) {
        if (!userEntity || !resourceData) return false;

        userEntity = rep.getEntityById(rep.keys.user, userEntity.id);
        let permission = getPermission(resourceData);
        if (userEntity == null || permission == null) return false;

        var userRoleEntities = rep.getEntities(rep.keys.userRole);
        if (userRoleEntities) {
            for (var i = 0; i < userRoleEntities.length; i++) {
                var userRole = userRoleEntities[i];
                if (userRole.userId == userEntity.id) {
                    var rolePermission = getRolePermission(userRole.roleId, permission.id);
                    if(rolePermission == null) continue;
                    return {
                        read: rolePermission.read,
                        create: rolePermission.create,
                        update: rolePermission.update,
                        delete: rolePermission.delete
                    };
                }
            }
        }
        return false;
    };

    _this.inRole = function (roleData) {
        return _this.userInRole(userService.getCurrentUser(), roleData);
    };
    _this.canDo = function (resourceData, action) {
        return _this.userCanDoAction(userService.getCurrentUser(), resourceData, action);
    };
    _this.canDoActions = function (resourceData) {
        return _this.getCanDoActions(userService.getCurrentUser(), resourceData);
    };
    _this.hasPermission = function(permissionData){
        if(!permissionData || !permissionData.resource || !permissionData.action) return false;
        const currentUser = userService.getCurrentUser();
        if(!currentUser) return;
        const userRoles = rep.getEntities(rep.keys.userRole) || [];
        var rolePermissions = rep.getEntities(rep.keys.rolePermission) || [];
        for(var userRole of userRoles){
            if(userRole.userId == currentUser.id){
                for(var rolePermission of rolePermissions){
                    if(rolePermission.roleId == userRole.roleId){
                        if(rolePermission.permissionId == permissionData.resource.id && rolePermission[permissionData.action]){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };

    function getRolePermission(roleId, permissionId) {
        var rolePermissions = rep.getEntities(rep.keys.rolePermission);
        if (rolePermissions) {
            for (var j = 0; j < rolePermissions.length; j++) {
                var rolePermission = rolePermissions[j];
                if (rolePermission.roleId == roleId && rolePermission.permissionId == permissionId) {
                    return rolePermission;
                }
            }
        }
        return null;
    }

    function getRole(data) {
        let role = null;
        if (data.id)
            role = rep.getEntityById(rep.keys.role, data.id);
        else if (data.name)
            role = rep.getEntityByName(rep.keys.role, data.name);
        else if (data.names) {
            for (var i = 0; i < data.names.length; i++) {
                role = rep.getEntityByName(rep.keys.role, data.names[i]);
                if (role != null) break;
            }
        }
        return role;
    }

    function getPermission(data) {
        let permission = null;
        if (data.id)
            permission = rep.getEntityById(rep.keys.permission, data.id);
        else if (data.name)
            permission = rep.getEntityByName(rep.keys.permission, data.name);
        else if (data.names) {
            for (var i = 0; i < data.names.length; i++) {
                permission = rep.getEntityByName(rep.keys.permission, data.names[i]);
                if (permission != null) break;
            }
        }
        return permission;
    }

    return _this;
})(repository, userService);
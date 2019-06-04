"use strict";

(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService) {
    const actions = per.canDoActions(RESOURCES.PERMISSION);

    let permissions = null;

    const $roleOptions = $('#roleOptions');
    let _currentRoleId = 0;
    const $roleList = $('#role-permission-list');
    const $rolePermissionTemplate = $('#rolePermissionTemplate');

    $(function () {
        fillRoleList();

        $roleOptions.change(function (e) {
            _currentRoleId = $roleOptions.val();
            fillRolePermissionList(_currentRoleId);
        });

        $roleList.on('change', '.grant-permission', function (e) {
            var $target = $(e.currentTarget);
            var action = getAction($target);
            if (!action) return;

            var value = $target.is(':checked');
            var id = $target.data('id');
            var permissionId = $target.data('permission');
            if (id) {
                updateRolePermission(id, action, value);
            } else if (permissionId) {
                createRolePermission(permissionId, action, value);
            }
            $(`[for=${$target.attr('id')}]`).text(value ? 'On' : 'Off');
        });
    });

    function createRolePermission(permissionId, action, value) {

        if (per.canDo(RESOURCES.PERMISSION, ACTIONS.CREATE)) {
            var permission = rep.getEntityById(rep.keys.permission, permissionId);
            if (permission) {
                rep.insertEntity(rep.keys.rolePermission, {
                    roleId: _currentRoleId,
                    permissionId: permission.id,
                    read: action == ACTIONS.READ ? value : false,
                    create: action == ACTIONS.CREATE ? value : false,
                    update: action == ACTIONS.UPDATE ? value : false,
                    delete: action == ACTIONS.DELETE ? value : false
                });
            } else {
                commonService.alertMessage('Permission is not found');
            }
        } else {
            commonService.alertMessage("You don't have create permission");
        }
    }

    function updateRolePermission(id, action, value) {
        if (per.canDo(RESOURCES.PERMISSION, ACTIONS.UPDATE)) {
            var rolePermission = rep.getEntityById(rep.keys.rolePermission, id);
            if (rolePermission) {
                var updateData = {};
                updateData[action] = value;
                rep.updateEntity(rep.keys.rolePermission, rolePermission.id, updateData);
            } else {
                commonService.alertMessage('Permission is not found');
            }
        } else {
            commonService.alertMessage("You don't have update permission");
        }
    }

    function fillRoleList() {
        // if (per.canDo(RESOURCES.ROLE, ACTIONS.READ)) {
        const roles = rep.getEntities(rep.keys.role);
        if (roles && roles.length) {
            for (var i = 0; i < roles.length; i++) {
                let role = roles[i];
                $roleOptions.append(`<option value="${role.id}">${role.name}</option>`);
            }
        }
        // }
    }
    function fillRolePermissionList(roleId) {
        if (roleId == 0) {
            $roleList.addClass('d-none');
            return;
        }
        var $rolePermissionContainer = $roleList.find('tbody');
        $rolePermissionContainer.html('');
        if (per.canDo(RESOURCES.PERMISSION, ACTIONS.READ)) {
            var permissions = rep.getEntities(rep.keys.permission);
            var rolePermissions = rep.getEntities(rep.keys.rolePermission);
            if (permissions && permissions.length) {
                for (var j = 0; j < permissions.length; j++) {
                    var permission = permissions[j];
                    var item = null;
                    var matchRolePermission = { id: 0 };
                    for (var i = 0; i < rolePermissions.length; i++) {
                        var rolePermission = rolePermissions[i];
                        if (rolePermission.permissionId == permission.id && rolePermission.roleId == roleId) {
                            item = getRenderItem(rolePermission, permission, j);
                            matchRolePermission = rolePermission;
                            break;
                        }
                    }
                    if (!item) item = getRenderItem(matchRolePermission, permission, j);
                    $rolePermissionTemplate.tmpl(item).appendTo($rolePermissionContainer);
                    updateStatus(item);
                }
            } else {
                $rolePermissionContainer.html(`<tr><td colspan="6"><div class="alert alert-info">Permission data is empty</div></td></tr>`);
            }
        } else {
            $rolePermissionContainer.html(`<tr><td colspan="6"><div class="alert alert-info">You don't have read permission</div></td></tr>`);
        }
        $roleList.removeClass('d-none');
    }
    function getRenderItem(rolePermission, permission, index) {
        return {
            index: index + 1,
            random: makeid(4),
            id: rolePermission.id,
            pId: permission.id,
            name: permission.name,
            read: !!rolePermission.read,
            create: !!rolePermission.create,
            update: !!rolePermission.update,
            delete: !!rolePermission.delete
        };
    }
    function updateStatus(rp) {
        $(`#create-${rp.random}`).attr('checked', rp.create);
        $(`#update-${rp.random}`).attr('checked', rp.update);
        $(`#delete-${rp.random}`).attr('checked', rp.delete);
        $(`#read-${rp.random}`).attr('checked', rp.read);
        $(`[for=create-${rp.random}]`).text(rp.create ? 'On' : 'Off');
        $(`[for=update-${rp.random}]`).text(rp.update ? 'On' : 'Off');
        $(`[for=delete-${rp.random}]`).text(rp.delete ? 'On' : 'Off');
        $(`[for=read-${rp.random}]`).text(rp.read ? 'On' : 'Off');
    }
    function getAction(element) {
        var action = null;
        if (element.is('.create-permission')) {
            action = ACTIONS.CREATE;
        } else if (element.is('.update-permission')) {
            action = ACTIONS.UPDATE;
        } else if (element.is('.delete-permission')) {
            action = ACTIONS.DELETE;
        } else if (element.is('.read-permission')) {
            action = ACTIONS.READ;
        }
        return action;
    }
    function getPermission(id) {
        if (!permissions) permissions = rep.getEntities(rep.keys.permission);
        if (!permissions || !permissions.length) return;
        for (var i = 0; i < permissions.length; i++) {
            var permission = permissions[i];
            if (permission.id == id) {
                return permission;
            }
        }
        return null;
    }
    function makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService);
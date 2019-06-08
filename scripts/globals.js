'use strict';
const RESOURCES = {
    ROLE: {
        id: 5,
        names: ['Role']
    },
    
    USER: { id: 3, names: ['User'], pageSize: 5 },
    PERMISSION: { id: 4, names: ['Priviledge'] }
};
const ACTIONS = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete'
};
function _createConfigObj(options) {
    if (!options) options = {};
    var config = {};
    for (var prop in options) {
        Object.defineProperty(config, prop, {
            value: options[prop],
            writable: false
        });
    }

    config.requireLogin = function () {
        return config.authorize;
    };

    config.requireRead = function () {
        return config.action && config.action.toLowerCase() == 'read';
    };
    config.requireAction = function () {
        return config.action ? config.action : 'read';
    };

    config.requireRole = function () {
        return config.role ? config.role : false;
    };

    return config;
};

//admin
function AdminForResourceActionConfig(action, resource) {
    return RoleAuthorizeResourceConfig({ id: 2, names: ['Admin', 'Administrator'] }, resource, action);
}

function RoleAuthorizeResourceConfig(role, resource, action) {
    return _createConfigObj({ role: role, authorize: true, resource: resource, action: action });
}
function AuthorizeResourceConfig(resource, action) {
    return _createConfigObj({ authorize: true, resource: resource, action: action });
}
function AuthorizeConfig() {
    return _createConfigObj({ authorize: true });
}
function DefaultConfig() {
    return _createConfigObj({ authorize: false });
}

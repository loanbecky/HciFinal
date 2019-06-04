'use strict';

var repository = (function () {
    const _this = {};
    const _available = storageAvailable();
    const CATEGORY_ENTITY_NAME = 'itnewsblog.categories';
    const USER_ENTITY_NAME = 'itnewsblog.users';
    const ROLE_ENTITY_NAME = 'itnewsblog.roles';
    const USERROLE_ENTITY_NAME = 'itnewsblog.userroles';
    const PERMISSION_ENTITY_NAME = 'itnewsblog.permissions';
    const ROLEPERMISSION_ENTITY_NAME = 'itnewsblog.rolepermissions';

    _this.keys = {
        user: USER_ENTITY_NAME,
        role: ROLE_ENTITY_NAME,
        permission: PERMISSION_ENTITY_NAME,
        userRole: USERROLE_ENTITY_NAME,
        rolePermission: ROLEPERMISSION_ENTITY_NAME,
        category: CATEGORY_ENTITY_NAME
    };

    _this.getEntities = function (name) {
        if (_available) {
            let jsonValue = localStorage.getItem(name);
            if (jsonValue) {
                return JSON.parse(jsonValue);
            }
        }
        return null;
    };
    _this.saveEntities = function (name, entities) {
        if (_available) {
            localStorage.setItem(name, JSON.stringify(entities));
        }
    };
    _this.insertEntity = function (name, entity) {
        if (_available) {
            var entities = _this.getEntities(name) || [];
            var newId = 1;
            if (entities && entities.length) {
                newId = entities.length + 1;
                do {
                    var found = false;
                    for (var i = 0; i < entities.length; i++) {
                        if (entities[i].id == newId) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) break;
                    newId++;
                } while (true);
            }
            entity.id = newId;
            entities.push(entity);
            _this.saveEntities(name, entities);
            return true;
        }
        return false;
    };
    _this.getSessionEntities = function (name) {
        if (_available) {
            let jsonValue = sessionStorage.getItem(name);
            if (jsonValue) {
                return JSON.parse(jsonValue);
            }
        }
        return null;
    };
    _this.saveSessionEntities = function (name, entities) {
        if (_available) {
            sessionStorage.setItem(name, JSON.stringify(entities));
        }
    };
    _this.getEntityById = function (name, id) {
        const entities = _this.getEntities(name);
        if (entities && entities.length) {
            for (var i = 0; i < entities.length; i++) {
                const entity = entities[i];
                if (entity.id && entity.id == id) {
                    return entity;
                }
            }
        }
        return null;
    };
    _this.updateEntity = function (name, id, updateData) {
        const entities = _this.getEntities(name);
        if (entities && entities.length) {
            for (var i = 0; i < entities.length; i++) {
                const entity = entities[i];
                if (entity.id && entity.id == id) {
                    for (var prop in updateData) {
                        if (prop.toLowerCase() == 'id') continue;
                        entity[prop] = updateData[prop];
                    }
                    _this.saveEntities(name, entities);
                    return true;
                }
            }
        }
        return false;
    };
    _this.deleteEntityById = function (name, id) {
        const entities = _this.getEntities(name);
        if (entities && entities.length) {
            for (var i = 0; i < entities.length; i++) {
                const entity = entities[i];
                if (entity.id && entity.id == id) {
                    entities.splice(i, 1);
                    _this.saveEntities(name, entities);
                    return true;
                }
            }
        }
        return false;
    };
    _this.getEntityByName = function (entityName, name) {
        const entities = _this.getEntities(entityName);
        if (entities && entities.length) {
            for (var i = 0; i < entities.length; i++) {
                const entity = entities[i];
                if (entity.name && entity.name.toLowerCase() == name.toLowerCase()) {
                    return entity;
                }
            }
        }
        return null;
    };

    //initial data
    if (!_this.getEntities(USER_ENTITY_NAME)) {
        const users = [
            { id: 1, email: 'nguyentuandang7@gmail.com', password: '123456' },
            { id: 2, email: 'nguyenthingocdieu@gmail.com', password: '123456' },
            { id: 3, email: 'vuthingat@gmail.com', password: '123456' }
        ];
        _this.saveEntities(USER_ENTITY_NAME, users);
    }
    if (!_this.getEntities(ROLE_ENTITY_NAME)) {
        const roles = [
            { id: 1, name: 'Guest', createdOn: new Date(), updatedOn: new Date() },
            { id: 2, name: 'Administrator', createdOn: new Date(), updatedOn: new Date() },
            { id: 3, name: 'Editor', createdOn: new Date(), updatedOn: new Date() }
        ];
        _this.saveEntities(ROLE_ENTITY_NAME, roles);
    }
    if (!_this.getEntities(PERMISSION_ENTITY_NAME)) {
        const permission = [
            { id: 1, name: 'Blog Post' },
            { id: 2, name: 'Categories' },
            { id: 3, name: 'User' },
            { id: 4, name: 'Priviledge' },
            { id: 5, name: 'Role' }
        ];
        _this.saveEntities(PERMISSION_ENTITY_NAME, permission);
    }
    if (!_this.getEntities(USERROLE_ENTITY_NAME)) {
        const userRoles = [
            { id: 1, userId: 1, roleId: 2 },
            { id: 2, userId: 2, roleId: 2 },
            { id: 3, userId: 3, roleId: 3 }
        ];
        _this.saveEntities(USERROLE_ENTITY_NAME, userRoles);
    }
    if (!_this.getEntities(ROLEPERMISSION_ENTITY_NAME)) {
        const rolePermissions = [
            { id: 1, roleId: 1, permissionId: 1, read: true, create: false, update: false, delete: false },
            { id: 2, roleId: 1, permissionId: 2, read: true, create: false, update: false, delete: false },
            { id: 3, roleId: 2, permissionId: 1, read: true, create: true, update: true, delete: true },
            { id: 4, roleId: 2, permissionId: 2, read: true, create: true, update: true, delete: true },
            { id: 5, roleId: 2, permissionId: 3, read: true, create: true, update: true, delete: true },
            { id: 6, roleId: 2, permissionId: 4, read: true, create: true, update: true, delete: true },
            { id: 7, roleId: 2, permissionId: 5, read: true, create: true, update: true, delete: true }
        ];
        _this.saveEntities(ROLEPERMISSION_ENTITY_NAME, rolePermissions);
    }

    //check sessionStorage is available
    function storageAvailable() {
        try {
            var storage = window['sessionStorage'],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch (e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage.length !== 0;
        }
    };

    return _this;
})();
'use strict';

var userService = (function(rep){
    const _this = {};
    let _currentUser = null;
    const CURRENT_USER_NAME = 'itnewsblog.currentUser';

    _this.getCurrentUser = function(){
        if(!_currentUser){
            _currentUser = rep.getSessionEntities(CURRENT_USER_NAME);
        }
        return _currentUser;
    };
    _this.setCurrentUser = function(user){
        _currentUser = user;
        rep.saveSessionEntities(CURRENT_USER_NAME, user);
    };
    _this.getUser = function(email, password){
        const users = rep.getEntities(rep.keys.user);
        if(users && users.length){
            for(var i = 0; i < users.length; i++){
                var user = users[i];
                if(user.password && user.email && user.password == password && user.email.toLowerCase() == email.toLowerCase()){
                    return user;
                }
            }
        }
        return null;
    };

    return _this;
})(repository);
'use strict';
(function ($, authService, navigationService, permissionService, config, userService, rep) {
    if (!config) navigationService.toDenied();

    //authenticate
    if (config.requireLogin() && !authService.isSignedIn()) {
        navigationService.toLogin();
    }
    // //authorize
    // const requiredRole = config.requireRole();
    // if (requiredRole && !permissionService.inRole(requiredRole)) {
    //     navigationService.toLogin();
    // }
    const permissionData = config.requirePermission();
    if(permissionData && !permissionService.hasPermission(permissionData)){
        navigationService.toLogin();
    }

    $(function () {
        //userinfo
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

        //logout
        $('#logout').click(function (e) {
            e.preventDefault();
            authService.signOut();
            navigationService.toHome();
        });

        //back to top
        if ($('#back-to-top').length) {
            var scrollTrigger = 100, // px
                backToTop = function () {
                    var scrollTop = $(window).scrollTop();
                    if (scrollTop > scrollTrigger) {
                        $('#back-to-top').addClass('show');
                    } else {
                        $('#back-to-top').removeClass('show');
                    }
                };
            backToTop();
            $(window).on('scroll', function () {
                backToTop();
            });
            $('#back-to-top').on('click', function (e) {
                e.preventDefault();
                $('html,body').animate({
                    scrollTop: 0
                }, 700);
            });
        }

        //search
        $('#form-search').submit(e => {
            e.preventDefault();
            let keyword = $('#form-search').find('[name=keywords]').val();
            if (!keyword) return;
            if(keyword.length < 4){
                alert('Keywords must have least 5 characters');
                return;
            }
            keyword = locdau(keyword);
            navigationService.toLocalUrl(`search.html?kw=${encodeURIComponent(keyword)}`);
        });

        fillRecentPostList();
        fillCategoryList();
    });


    //recent
    function fillRecentPostList() {
        if (!$('.recent-posts').length) return;
        let pageSize = RESOURCES.POST.recentPageSize;
        let posts = rep.getEntities(rep.keys.post) || [];
        posts = $.grep(posts, function (item) {
            return item.mode && item.mode.toLowerCase() == 'public';
        });
        posts = posts.sort(sortPost);
        $.each($('.recent-posts'), function (index, container) {
            const $container = $(container);
            const customPageSize = $container.data('page') || 0;
            if (customPageSize) pageSize = customPageSize;
            const $recentPostTemplate = $($container.data('template'));
            for (var i = 0; i < pageSize && i < posts.length; i++) {
                const renderData = getRecentPostRenderData(posts[i]);
                $recentPostTemplate.tmpl(renderData).appendTo($container);
            }
        });
    }
    function getRecentPostRenderData(item) {
        let image = RESOURCES.POST.defaultImage;
        if (item.featureImage) {
            const imageEntity = rep.getEntityById(rep.keys.image, item.featureImage);
            if (imageEntity) image = imageEntity.data;
        }
        return {
            title: item.name,
            id: item.id,
            image: image,
            short: item.short,
            createdAt: moment(new Date(item.createdOn)).format('MMMM Do, YYYY')
        };
    }

    //menu
    function fillCategoryList() {
        if (!$('.category-container').length) return;
        let categories = rep.getEntities(rep.keys.category) || [];
        let parentCategories = $.grep(categories, function (item) {
            return !item.parent || item.parent == "0" || item.parent < 0;
        });
        parentCategories = parentCategories.sort(sortCategory);
        $.each($('.category-container'), function (index, container) {
            const $container = $(container);
            const $categoryTemplate = $($container.data('template'));
            for (var category of parentCategories) {
                const renderData = getCategoryRenderData(category, categories);
                $categoryTemplate.tmpl(renderData).appendTo($container);
            }
        });
    }
    function sortCategory(cat1, cat2) {
        return cat1.order > cat2.order ? 1 : cat1.order < cat2.order ? -1 : 0;
    }
    function getCategoryRenderData(item, allCategories) {
        let children = [];
        if (allCategories) {
            for (var child of allCategories) {
                if (item.id == (child.parent || 0 + 0)) {
                    children.push(getCategoryRenderData(child));
                }
            }
        }
        children = children.sort(sortCategory);
        return {
            name: item.name,
            id: item.id,
            children: children
        };
    }
})(jQuery, authService, navigationService, permissionService, __config__, userService, repository);

function locdau(obj) {
    var str;
    str = obj;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    //str= str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g,"-");  
    /* tìm và thay thế các kí tự đặc biệt trong chuỗi sang kí tự - */
    //str= str.replace(/-+-/g,"-"); //thay thế 2- thành 1-  
    str = str.replace(/^\-+|\-+$/g, "");
    //cắt bỏ ký tự - ở đầu và cuối chuỗi 
    return str.toLowerCase();
}

function sortPost(post1, post2) {
    var date1 = new Date(post1.createdOn);
    var date2 = new Date(post2.createdOn);
    return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
}
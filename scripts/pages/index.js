"use strict";

(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService, moment) {
    const $postList = $('#post-list');
    const $categoryList = $('#category-list');
    const $recentPostList = $('#recent-post-list');

    $(function () {
        fillCategoryList();
        fillRecentPostList();
        fillPostList();
    });

    //post
    function fillPostList() {
        const pageSize = RESOURCES.POST.userPageSize;
        const $postTemplate = $($postList.data('template'));
        let posts = rep.getEntities(rep.keys.post) || [];
        posts = $.grep(posts, function (item) {
            return item.mode && item.mode.toLowerCase() == 'public' && item.showOnHomepage;
        });
        if (!posts.length) {
            commonService.alertMessage('Post data is empty', true);
            return;
        }
        posts = posts.sort(sortPost);
        for (var i = 0; i < pageSize && i < posts.length; i++) {
            const renderData = getPostRenderData(posts[i]);
            $postTemplate.tmpl(renderData).appendTo($postList);
        }
    }
    function getPostRenderData(item) {
        let image = RESOURCES.POST.defaultImage;
        if (item.featureImage) {
            const imageEntity = rep.getEntityById(rep.keys.image, item.featureImage);
            if (imageEntity) image = imageEntity.data;
        }
        return {
            title: item.name,
            id: item.id,
            image: image,
            category:{
                name: item.category ? item.category.name : '',
                id: item.category ? item.category.id : 0
            },
            content: item.content,
            createdAt: moment(new Date(item.createdOn)).format('MMMM Do, YYYY hh:mm a')
        };
    }

    //recent
    function fillRecentPostList() {
        const pageSize = RESOURCES.POST.recentPageSize;
        const $recentPostTemplate = $($recentPostList.data('template'));
        let posts = rep.getEntities(rep.keys.post) || [];
        posts = $.grep(posts, function (item) {
            return item.mode && item.mode.toLowerCase() == 'public';
        });
        posts = posts.sort(sortPost);
        for (var i = 0; i < pageSize && i < posts.length; i++) {
            const renderData = getRecentPostRenderData(posts[i]);
            $recentPostTemplate.tmpl(renderData).appendTo($recentPostList);
        }
    }
    function getRecentPostRenderData(item) {
        return {
            title: item.name,
            id: item.id
        };
    }

    //menu
    function fillCategoryList() {
        const $categoryTemplate = $($categoryList.data('template'));
        let categories = rep.getEntities(rep.keys.category) || [];
        categories = categories.sort(sortCategory);
        for (var i = 0; i < categories.length; i++) {
            const renderData = getCategoryRenderData(categories[i]);
            $categoryTemplate.tmpl(renderData).appendTo($categoryList);
        }
    }
    function sortCategory(cat1, cat2) {
        return cat1.order > cat2.order ? 1 : cat1.order < cat2.order ? -1 : 0;
    }
    function sortPost(post1, post2) {
        var date1 = new Date(post1.createdOn);
        var date2 = new Date(post2.createdOn);
        return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
    }
    function getCategoryRenderData(item) {
        return {
            name: item.name,
            id: item.id
        };
    }

})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService, moment);
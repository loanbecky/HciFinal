"use strict";


(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService) {
    const $postList = $('#post-list');
    const $categoryList = $('#category-list');
    const $recentPostList = $('#recent-post-list');

    const urlParams = new URLSearchParams(window.location.search);
    let page = urlParams.get('page');
    if (!page || page < 1) page = 1;

    $(function () {
        fillCategoryList();
        fillRecentPostList();
        fillPostList(page);
    });

    //recent
    function fillRecentPostList() {
        const pageSize = RESOURCES.POST.recentPageSize;
        const $recentPostTemplate = $($recentPostList.data('template'));
        let posts = rep.getEntities(rep.keys.post) || [];
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

    //post
    function fillPostList(page) {
        const pageSize = RESOURCES.POST.userPageSize;
        const pageIndex = page - 1;
        const $postTemplate = $($postList.data('template'));
        let posts = rep.getEntities(rep.keys.post) || [];
        posts = $.grep(posts, function (item) {
            return item.mode && item.mode.toLowerCase() == 'public';
        });
        if (!posts.length) {
            commonService.alertMessage('Post data is empty', true);
            return;
        }
        posts = posts.sort(function (post1, post2) {
            var date1 = new Date(post1.createdOn);
            var date2 = new Date(post2.createdOn);
            return date1 > date2 ? 1 : date1 < date2 ? -1 : 0;
        });
        const pagedData = commonService.getPagedData(pageSize, pageIndex, posts);
        const renderData = $.map(pagedData, (item, index) => getPostRenderData(item));
        // for (var i = 0; i < posts.length; i++) {
        //     const renderData = getPostRenderData(posts[i]);
        //     $postTemplate.tmpl(renderData).appendTo($featurePostList);
        // }
        $postTemplate.tmpl(renderData).appendTo($postList);
        commonService.updatePager(page, posts.length, pageSize);
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
            short: item.short,
            category:{
                name: item.category.name,
                id: item.category.id
            },
            content: item.content,
            createdAt: moment(new Date(item.createdOn)).startOf('day').fromNow()
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
    function sortCategory(cat1, cat2){
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

})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService);
"use strict";


(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService) {
    const $featurePostList = $('#feature-post-list');
    const $categoryList = $('#category-list');
    const $recentPostList = $('#recent-post-list');

    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    if (!id) nav.toHome();
    const category = rep.getEntityById(rep.keys.category, id);
    if (!category) nav.toHome();
    let page = urlParams.get('page');
    if (!page || page < 1) page = 1;

    $(function () {
        $('.current-category-name').text(category.name);
        $('title').text($('title').text() + ' ' + category.name);
        $('a.current-category-id').attr('href', function () {
            $(this).attr('href', $(this).attr('href') + category.id);
        });
        fillCategoryList();
        $(`.current-category-selected[data-id=${id}]`).addClass('active');
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
        const pageSize = RESOURCES.CATEGORY.postPageSize;
        const pageIndex = page - 1;
        const $postTemplate = $($featurePostList.data('template'));
        var posts = rep.getEntities(rep.keys.post) || [];
        posts = $.grep(posts, function (item) {
            return item.mode && item.mode.toLowerCase() == 'public' && item.category && item.category.id == id;
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
        // const renderData = $.map(pagedData, (item, index) => getPostRenderData(item));
        // $postTemplate.tmpl(renderData).appendTo($featurePostList);
        for (var i = 0; i < pagedData.length; i++) {
            const renderData = getPostRenderData(pagedData[i]);
            $postTemplate.tmpl(renderData).appendTo($featurePostList);
        }
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
            category: {
                name: item.category.name,
                id: item.category.id
            },
            content: item.content,
            createdAt: moment(new Date(item.createdOn)).format('MMMM Do, YYYY hh:mm a')
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

})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService);
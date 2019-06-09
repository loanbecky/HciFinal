"use strict";


(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService) {
    const $postList = $('#post-list');
    const $featurePostList = $('#feature-post-list');

    const urlParams = new URLSearchParams(window.location.search);
    let page = urlParams.get('page');
    if (!page || page < 1) page = 1;

    let _featurePostIds = [];

    $(function () {
        fillFeaturePostList();
        fillPostList(page);
    });

    //post
    function fillFeaturePostList() {
        const $postTemplate = $($featurePostList.data('template'));
        let posts = rep.getEntities(rep.keys.post) || [];
        posts = $.grep(posts, function (item) {
            return item.mode && item.mode.toLowerCase() == 'public' && item.isFeature;
        });
        posts = posts.sort(sortPost);
        _featurePostIds = [];
        for (var i = 0; i < posts.length; i++) {
            const renderData = getPostRenderData(posts[i]);
            _featurePostIds.push(posts[i].id);
            $postTemplate.tmpl(renderData).appendTo($featurePostList);
        }
    }
    function fillPostList(page) {
        const pageSize = RESOURCES.POST.userPageSize;
        const pageIndex = page - 1;
        const $postTemplate = $($postList.data('template'));
        let posts = rep.getEntities(rep.keys.post) || [];
        posts = $.grep(posts, function (item) {
            let isFeature = false;
            for(var i = 0; i < _featurePostIds.length; i++){
                if(item.id == _featurePostIds[i]){
                    isFeature = true;
                    break;
                }
            }
            return !isFeature && item.mode && item.mode.toLowerCase() == 'public';
        });
        if(!posts.length) {
            commonService.alertMessage('Post data is empty', true);
            return;
        }
        posts = posts.sort(sortPost);
        const pagedData = commonService.getPagedData(pageSize, pageIndex, posts);
        for (var i = 0; i < pageSize && i < pagedData.length; i++) {
            const renderData = getPostRenderData(pagedData[i]);
            $postTemplate.tmpl(renderData).appendTo($postList);
        }
        commonService.updatePager(page, posts.length, pageSize);
    }
    function getPostRenderData(item) {
        let image = RESOURCES.POST.defaultImage;
        if (item.featureImage) {
            const imageEntity = rep.getEntityById(rep.keys.image, item.featureImage);
            if (imageEntity) image = imageEntity.data;
        }
        const category = rep.getEntityById(rep.keys.category, item.category ? item.category.id : 0);
        return {
            title: item.name,
            id: item.id,
            image: image,
            category:{
                name: category.name,
                id: category.id
            },
            short: item.short,
            content: item.content,
            createdAt: moment(new Date(item.createdOn)).format('MMMM Do, YYYY hh:mm a')
        };
    }
    function sortPost(post1, post2) {
        var date1 = new Date(post1.createdOn);
        var date2 = new Date(post2.createdOn);
        return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
    }
})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService);
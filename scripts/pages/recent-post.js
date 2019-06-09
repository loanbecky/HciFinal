"use strict";


(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService) {
    const $postList = $('#post-list');

    const urlParams = new URLSearchParams(window.location.search);
    let page = urlParams.get('page');
    if (!page || page < 1) page = 1;

    $(function () {
        fillPostList(page);
    });

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
        const category = rep.getEntityById(rep.keys.category, item.category ? item.category.id : 0);
        return {
            title: item.name,
            id: item.id,
            image: image,
            short: item.short,
            category:{
                name: category.name,
                id: category.id
            },
            content: item.content,
            createdAt: moment(new Date(item.createdOn)).startOf('day').fromNow()
        };
    }

})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService);
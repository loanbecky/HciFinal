"use strict";

(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService) {
    const $postList = $('#post-list');

    const urlParams = new URLSearchParams(window.location.search);
    let keywords = urlParams.get('kw');
    if (!keywords) nav.toHome();

    $(function () {
        $('.keywords-value').text(keywords);
        fillPostList(keywords);
    });

    //post
    function fillPostList() {
        const pageSize = RESOURCES.POST.userPageSize;
        const $postTemplate = $($postList.data('template'));
        let posts = rep.getEntities(rep.keys.post) || [];
        posts = $.grep(posts, function (item) {
            return item.mode && item.mode.toLowerCase() == 'public' && locdau(item.name).indexOf(keywords) >= 0;
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
        const category = rep.getEntityById(rep.keys.category, item.category ? item.category.id : 0);
        return {
            title: item.name,
            id: item.id,
            image: image,
            category: {
                name: category ? category.name : '',
                id: category ? category.id : 0
            },
            content: item.content,
            createdAt: moment(new Date(item.createdOn)).format('MMMM Do, YYYY')
        };
    }
})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService);
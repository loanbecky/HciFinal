"use strict";

(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService, moment) {
    const $postList = $('#post-list');
    const $categoryList = $('#category-list');

    $(function () {
        fillCategoryList();
        fillPostList();
    });

    //post
    function fillPostList() {
        const pageSize = RESOURCES.POST.userPageSize;
        const $postTemplate = $($postList.data('template'));
        let posts = rep.getEntities(rep.keys.post) || [];
        posts = $.grep(posts, function(item){
            return item.mode && item.mode.toLowerCase() == 'public' &&  item.showOnHomepage;
        });
        posts = posts.sort(sortPost);
        for (var i = 0; i < pageSize && i < posts.length; i++) {
            const post = posts[i];
            const renderData = getPostRenderData(post);
            $postTemplate.tmpl(renderData).appendTo($postList);
            //$postList.find(`.content-${post.id}`).html(post.content);
        }
    }
    function getPostRenderData(item) {
        let image = RESOURCES.POST.defaultImage;
        if(item.featureImage){
            const imageEntity = rep.getEntityById(rep.keys.image, item.featureImage);
            if(imageEntity) image = imageEntity.data;
        }
        return {
            title: item.name,
            id: item.id,
            image: image,
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

})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService, moment);
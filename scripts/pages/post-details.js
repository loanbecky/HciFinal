"use strict";


(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService) {
    const $categoryList = $('#category-list');
    const $postDetail = $('#post-detail');

    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    if (!id) nav.toHome();

    //get post + next/previous post
    let post = null, prePost = null, nextPost = null;
    let posts = rep.getEntities(rep.keys.post);
    posts = $.grep(posts, function (item) {
        return item.mode && item.mode.toLowerCase() == 'public';
    });
    if(!posts.length) {
        commonService.alertMessage('Post data is empty', true);
        return;
    }
    posts = posts.sort(sortPost);
    for(var i = 0; i < posts.length; i++){
        var item = posts[i];
        if(item.id == id){
            post = item;
            if(i > 0) prePost = posts[i-1];
            if(i + 1 < posts.length) nextPost = posts[i + 1];
            break;
        }
    }

    if (!post) nav.toHome();
    $('.current-post-title').text(post.name);
    $('title').text($('title').text() + ' ' + post.name);

    let page = urlParams.get('page');
    if (!page || page < 1) page = 1;

    $(function () {
        fillCategoryList();
        //$(`.current-category-selected[data-id=${id}]`).addClass('active');
        fillPostDetail(page);
    });
    function fillPostDetail(page) {
        const $postTemplate = $($postDetail.data('template'));
            const renderData = getPostRenderData(post, prePost, nextPost);
            $postTemplate.tmpl(renderData).appendTo($postDetail);
            $postDetail.find(`.content`).html(post.content)
        // const pageSize = RESOURCES.CATEGORY.postPageSize;
        // const pageIndex = page - 1;
        // const $postTemplate = $($featurePostList.data('template'));
        // let posts = rep.getEntities(rep.keys.post) || [];
        // posts = $.grep(posts, function (item) {
        //     return item.mode && item.mode.toLowerCase() == 'public' && item.category && item.category.id == id;
        // });
        // if (!posts.length) {
        //     commonService.alertMessage('Post data is empty', true);
        //     return;
        // }
        // posts = posts.sort((a, b) => commonService.sortByDesc(a, b, 'createdOn'));
        // const pagedData = commonService.getPagedData(pageSize, pageIndex, posts);
        // const renderData = $.map(pagedData, (item, index) => getPostRenderData(item));
        // // for (var i = 0; i < posts.length; i++) {
        // //     const renderData = getPostRenderData(posts[i]);
        // //     $postTemplate.tmpl(renderData).appendTo($featurePostList);
        // // }
        // $postTemplate.tmpl(renderData).appendTo($featurePostList);
        // commonService.updatePager(page, posts.length, pageSize);
    }
    function getPostRenderData(item, preItem, nextItem) {
        let image = null;//RESOURCES.POST.defaultImage;
        if (item.featureImage) {
            const imageEntity = rep.getEntityById(rep.keys.image, item.featureImage);
            if (imageEntity) image = imageEntity.data;
        }
        return {
            title: item.name,
            id: item.id,
            preId: preItem ? preItem.id : 0,
            nextId: nextItem ? nextItem.id : 0,
            image: image,
            short: item.short,
            content: item.content,
            category: {
                id: item.category.id,
                name: item.category.name
            },
            creator: item.creator ? item.creator.fullname ? item.creator.email : '' : '',
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

})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService);
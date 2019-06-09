"use strict";


(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService) {
    const $categoryList = $('#category-list');
    const $postDetail = $('#post-detail');

    let _attachFileName = null;
    let _attachFileContent = null;
    let _attachFileSize = null;

    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    if (!id) nav.toHome();

    //get post + next/previous post
    let post = null, prePost = null, nextPost = null;
    let posts = rep.getEntities(rep.keys.post);
    posts = $.grep(posts, function (item) {
        return item.mode && item.mode.toLowerCase() == 'public';
    });
    if (!posts.length) {
        commonService.alertMessage('Post data is empty', true);
        return;
    }
    posts = posts.sort(sortPost);
    for (var i = 0; i < posts.length; i++) {
        var item = posts[i];
        if (item.id == id) {
            post = item;
            if (i > 0) prePost = posts[i - 1];
            if (i + 1 < posts.length) nextPost = posts[i + 1];
            break;
        }
    }

    if (!post) nav.toHome();

    let page = urlParams.get('page');
    if (!page || page < 1) page = 1;

    $(function () {
        $('.current-post-title').text(post.name);
        $('a.current-post-id').attr('href', $('a.current-post-id').attr('href') + post.id);
        $('title').text($('title').text() + ' ' + post.name);
        var data = fillPostDetail(page);
        $(`.parent-category-selected[data-id=${post.category ? post.category.parent : 0}]`).addClass('active');
        $(`.current-category-selected[data-id=${post.category ? post.category.id : 0}]`).addClass('active');
        $('.current-category-link').text(data.category.name);
        $('.current-category-link').attr('href', $('.current-category-link').attr('href') + post.category.id);
    });
    function fillPostDetail(page) {
        const $postTemplate = $($postDetail.data('template'));
        const renderData = getPostRenderData(post, prePost, nextPost);
        $postTemplate.tmpl(renderData).appendTo($postDetail);
        $postDetail.find(`.content`).html(post.content);
        $('.download-attach').click(function (e) {
            e.preventDefault();
            if (_attachFileName && _attachFileContent) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(_attachFileContent));
                element.setAttribute('download', _attachFileName);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            }
        });
        return renderData;
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
        if (item.attach) {
            const file = rep.getEntityById(rep.keys.file, item.attach);
            if (file) {
                _attachFileContent = file.data;
                _attachFileName = file.name;
                _attachFileSize = file.size;
            }
        }
        let creator = rep.getEntityById(rep.keys.user, item.creator.id);
        
        const category = rep.getEntityById(rep.keys.category, item.category ? item.category.id : 0);
        return {
            title: item.name,
            id: item.id,
            preId: preItem ? preItem.id : 0,
            nextId: nextItem ? nextItem.id : 0,
            attach: {
                name: _attachFileName,
                size: _attachFileSize
            },
            image: image,
            short: item.short,
            content: item.content,
            category: {
                id: category.id,
                name: category.name
            },
            creator: creator ? creator.fullname ? creator.fullname : creator.email : '',
            createdAt: moment(new Date(item.createdOn)).format('MMMM Do, YYYY hh:mm A')
        };
    }
})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService);

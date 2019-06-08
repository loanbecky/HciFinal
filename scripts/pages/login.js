'use strict';

(function ($, authService, navigationService, rep) {
    const $categoryList = $('#category-list');
    const $form = $('#loginForm');
    const $alertMessage = $('#alert-message');
    $(function () {
        fillCategoryList();
        $form.submit(function (e) {
            e.preventDefault();
            if (!$form.valid()) return;
            const email = $form.find('[name=email]').val();
            const password = $form.find('[name=password]').val();
            const result = authService.signIn(email, password);
            if (result) {
                setMessage();
                const urlParams = new URLSearchParams(window.location.search);
                const returnUrl = urlParams.get('returnUrl');
                if (returnUrl)
                    navigationService.toLocalUrl(returnUrl);
                else
                    navigationService.toHome();
            } else {
                setMessage('Email or password is incorrect');
            }
        });
    });
    function setMessage(message) {
        if (message) {
            $alertMessage.html(message);
            $alertMessage.removeClass('d-none');
        } else {
            $alertMessage.html('');
            $alertMessage.addClass('d-none');
        }
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
})(jQuery, authService, navigationService, repository);
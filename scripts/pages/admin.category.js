"use strict";


(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService) {
    const actions = per.canDoActions(RESOURCES.CATEGORY);

    const $categoryList = $('#category-list');
    const $pager = $('#pager');

    const $addCategoryBtn = $('#addCategoryBtn');
    const $addCategoryBtnMessage = $('#addCategoryBtnMessage');
    const $addModal = $('#addModal');
    const $addForm = $addModal.find('form');
    const $addNameInput = $addForm.find('[name=name]');
    const $addFormAlertMessage = $addForm.find('#addFormAlertMessage');
    const $addFormSubmit = $addForm.find('#addFormSubmit');

    const $editModal = $('#editModal');
    const $editForm = $editModal.find('form');
    const $editFormAlertMessage = $editForm.find('#editFormAlertMessage');
    const $editFormSubmit = $editForm.find('#editFormSubmit');

    const $deleteModal = $('#deleteCategory');
    const $deleteBtn = $deleteModal.find('#deleteBtn');

    $(function () {
        const urlParams = new URLSearchParams(window.location.search);
        let page = urlParams.get('page');
        if(!page || page < 1) page = 1;
        fillDataList(page);

        if (!actions.create) {
            $addCategoryBtn.attr('disabled', true);
            $addCategoryBtn.addClass('disabled');
            $addCategoryBtnMessage.removeClass('d-none');
        } else {
            $addModal.on('show.bs.modal', function () {
                $addNameInput.val('');
                $addForm.find('[data-valmsg-for=name]').html('');
                $addFormAlertMessage.addClass('d-none');
            });
            $addForm.submit(function (e) {
                e.preventDefault();
                if (!$addForm.valid()) return;
                var name = $addNameInput.val();
                if (!name || !name.length) return;
                if (!per.canDo(RESOURCES.CATEGORY, ACTIONS.CREATE)) return;
                var category = rep.getEntityByName(rep.keys.category, name);
                if (category == null) {
                    $addFormAlertMessage.text('');
                    $addFormAlertMessage.addClass('d-none');

                    $addFormSubmit.attr('disabled', true);
                    rep.insertEntity(rep.keys.category, { name: name, createdOn: new Date(), updatedOn: new Date() });
                    $addModal.modal('hide');
                    fillDataList(1);

                    commonService.alertMessage(`Add category ${name} is successfully!`);
                } else {
                    $addFormAlertMessage.text('Category name is existing');
                    $addFormAlertMessage.removeClass('d-none');
                }

                $addFormSubmit.attr('disabled', false);
            });
        }


        if (!actions.update) {
            $categoryList.on('click', '.edit-category', function (e) {
                commonService.alertMessage("You don't have update permission");
                return false;
            });
        } else {
            $categoryList.on('click', '.edit-category[data-id]', function (e) {
                e.preventDefault();
                var id = $(e.currentTarget).data('id');
                $editModal.data('id', id);
                $editModal.modal('show');
            });
            $editModal.on('show.bs.modal', function (e) {
                var id = $editModal.data('id');
                var category = rep.getEntityById(rep.keys.category, id);
                if (category) {
                    $editFormAlertMessage.text('');
                    $editFormAlertMessage.addClass('d-none');
                    $editForm.find('[name=name]').val(category.name);
                } else {
                    $editFormAlertMessage.text('Category is not found');
                    $editFormAlertMessage.removeClass('d-none');
                }
                $editModal.find('[data-valmsg-for=name]').html('');
            });
            $editForm.submit(function (e) {
                e.preventDefault();
                if (!$editForm.valid()) return;
                var name = $editForm.find('[name=name]').val();
                var editId = $editModal.data('id');
                if (!name || !name.length) return;
                if (!per.canDo(RESOURCES.CATEGORY, ACTIONS.UPDATE)) return;
                var category = rep.getEntityById(rep.keys.category, editId);
                if (category == null) {
                    $editFormAlertMessage.text('Category is not found');
                    $editFormAlertMessage.removeClass('d-none');
                } else {
                    var existingNameCategory = rep.getEntityByName(rep.keys.category, name);
                    if (existingNameCategory == null || existingNameCategory != null && existingNameCategory.id == category.id) {
                        $editFormAlertMessage.text('');
                        $editFormAlertMessage.addClass('d-none');

                        $editFormSubmit.attr('disabled', true);
                        var result = rep.updateEntity(rep.keys.category, category.id, { name: name, updatedOn: new Date() });
                        if (result) {
                            commonService.alertMessage(`Update category is successfully!`);
                        } else {
                            commonService.alertMessage(`Update category is failed!`);
                        }
                        $editModal.modal('hide');
                        fillDataList(1);

                    } else {
                        $editFormAlertMessage.text('Category name is existing');
                        $editFormAlertMessage.removeClass('d-none');
                    }
                }

                $editFormSubmit.attr('disabled', false);

            });
        }
        
        if (!actions.delete) {
            $categoryList.on('click', '.delete-category', function (e) {
                commonService.alertMessage("You don't have delete permission");
                return false;
            });
        } else {
            $categoryList.on('click', '.delete-category[data-id]', function (e) {
                e.preventDefault();
                var id = $(e.currentTarget).data('id');
                $deleteBtn.data('id', id);
                $deleteModal.modal('show');
            });
            $deleteBtn.click(function (e) {
                e.preventDefault();
                var id = $deleteBtn.data('id');
                if (!id) return;
                if (!per.canDo(RESOURCES.CATEGORY, ACTIONS.DELETE)) {
                    commonService.alertMessage("You don't have delete permission");
                    $deleteModal.modal('hide');
                    return;
                }
                var category = rep.getEntityById(rep.keys.category, id);
                if (category == null) {
                    commonService.alertMessage('Category is not found');
                } else {
                    var result = rep.deleteEntityById(rep.keys.category, category.id);
                    if (result) {
                        commonService.alertMessage(`Delete category '${category.name}' is successfully`);
                        $deleteModal.modal('hide');
                        fillDataList(1);
                    } else {
                        commonService.alertMessage(`Delete category '${category.name}' is failed`);
                    }
                }
            });
        }
    });

    function fillDataList(page) {
        const pageSize = 5;
        const pageIndex = page - 1;

        const $categoryContainer = $categoryList.find('tbody');
        const $categoryTemplate = $('#categoryTemplate');
        $categoryContainer.html('');

        if (per.canDo(RESOURCES.CATEGORY, ACTIONS.READ)) {
            const categories = rep.getEntities(rep.keys.category) || [];
            if (categories && categories.length) {
                const data = [];
                let index = 1;
                for(var i = pageSize * pageIndex; i < pageSize * page && i < categories.length; i++){
                    data.push(getRenderItem(categories[i], index++));
                }
                $categoryTemplate.tmpl(data).appendTo($categoryContainer);
                updatePager(page, categories.length, pageSize);
            } else {
                $categoryContainer.html(`<tr><td colspan="5"><div class="alert alert-info">Categories data is empty</div></td></tr>`);
            }
        } else {
            $categoryContainer.html(`<tr><td colspan="5"><div class="alert alert-info">You don't have read permission</div></td></tr>`);
        }
    }
    function updatePager(page, totalItems, pageSize){
        const $pager = $('#pager');
        const $pageItemContainer = $pager.find('.pagination');
        const totalPage = Math.ceil(totalItems / pageSize);
        if(totalPage <= 1){
            $pageItemContainer.html('');
            $pager.addClass('d-none');
        } else {
            for(var i = 1; i < totalPage + 1; i++){
                var pageItem = `<li class="page-item ${i == page ? 'active' : ''}"><a class="page-link" href="${location.pathname}?page=${i}">${i}</a></li>`;
                $pageItemContainer.append(pageItem);
            }
            $pager.removeClass('d-none');
        }
    }
    function getRenderItem(item, index) {
        return {
            index: index + 1,
            name: item.name,
            id: item.id,
            createdAt: moment(new Date(item.createdOn)).format('D MMM YYYY'),
            updatedAt: moment(new Date(item.updatedOn)).format('D MMM YYYY')
        };
    }

})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService);
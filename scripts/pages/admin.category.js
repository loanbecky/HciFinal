"use strict";


(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService) {
    const actions = per.canDoActions(RESOURCES.CATEGORY);

    const $categoryList = $('#category-list');

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
                $addForm[0].reset();
                $addForm.find('[data-valmsg-for]').html('');
                $addFormAlertMessage.addClass('d-none');
            });
            $addForm.submit(function (e) {
                e.preventDefault();
                var name = $addNameInput.val();
                var displayOrder = $addForm.find('[name=order]').val();

                if (!$addForm.valid()) return;
                //empty resistant
                if(!(name = name.trim()).length){
                    commonService.showMessage("Please don't enter spaces to required fields", $addFormAlertMessage);
                    return;
                }
                if (!per.canDo(RESOURCES.CATEGORY, ACTIONS.CREATE)) return;

                var category = rep.getEntityByName(rep.keys.category, name);
                if (category == null) {
                    $addFormAlertMessage.text('');
                    $addFormAlertMessage.addClass('d-none');

                    $addFormSubmit.attr('disabled', true);
                    rep.insertEntity(rep.keys.category, { name: name, order: displayOrder, createdOn: new Date(), updatedOn: new Date() });
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
                commonService.alertMessage("You don't have update permission", false, true);
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
                    $editForm.find('[name=order]').val(category.order || 0);
                } else {
                    $editFormAlertMessage.text('Category is not found');
                    $editFormAlertMessage.removeClass('d-none');
                }
                $editModal.find('[data-valmsg-for=name]').html('');
            });
            $editForm.submit(function (e) {
                e.preventDefault();
                var name = $editForm.find('[name=name]').val();
                var displayOrder = $editForm.find('[name=order]').val();
                var editId = $editModal.data('id');

                if (!$editForm.valid()) return;
                
                //empty resistant
                if(!(name = name.trim()).length){
                    commonService.showMessage("Please don't enter spaces to required fields", $editFormAlertMessage);
                    return;
                }
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
                        var result = rep.updateEntity(rep.keys.category, category.id, { name: name, order: displayOrder, updatedOn: new Date() });
                        if (result) {
                            commonService.alertMessage(`Update category is successfully!`);
                        } else {
                            commonService.alertMessage(`Update category is failed!`, false, true);
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
                commonService.alertMessage("You don't have delete permission", false, true);
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
                    commonService.alertMessage("You don't have delete permission", false, true);
                    $deleteModal.modal('hide');
                    return;
                }
                var category = rep.getEntityById(rep.keys.category, id);
                if (category == null) {
                    commonService.alertMessage('Category is not found', false, true);
                } else {
                    var result = rep.deleteEntityById(rep.keys.category, category.id);
                    if (result) {
                        commonService.alertMessage(`Delete category '${category.name}' is successfully`);
                        $deleteModal.modal('hide');
                        fillDataList(1);
                    } else {
                        commonService.alertMessage(`Delete category '${category.name}' is failed`, false, true);
                    }
                }
            });
        }
    });

    function fillDataList(page) {
        const pageSize = RESOURCES.CATEGORY.pageSize;
        const pageIndex = page - 1;

        const $categoryContainer = $categoryList.find('tbody');
        const $categoryTemplate = $('#categoryTemplate');
        $categoryContainer.html('');

        if (per.canDo(RESOURCES.CATEGORY, ACTIONS.READ)) {
            let entities = rep.getEntities(rep.keys.category) || [];
            const categories = entities.sort(sortCategory);
            if (categories && categories.length) {
                const pagedData = commonService.getPagedData(pageSize, pageIndex, categories);
                const renderData = $.map(pagedData, (item, index) => getRenderItem(item, index + (pageIndex * pageSize)));
                $categoryTemplate.tmpl(renderData).appendTo($categoryContainer);
                commonService.updatePager(page, categories.length, pageSize);
            } else {
                $categoryContainer.html(`<tr><td colspan="6"><div class="alert alert-info">Categories data is empty</div></td></tr>`);
            }
        } else {
            $categoryContainer.html(`<tr><td colspan="6"><div class="alert alert-danger text-danger">You don't have read permission</div></td></tr>`);
        }
    }
    function sortCategory(cat1, cat2){
        return cat1.order > cat2.order ? -1 : cat1.order < cat2.order ? 1 : 0;
    }
    function getRenderItem(item, index) {
        return {
            index: index + 1,
            name: item.name,
            id: item.id,
            order: item.order || 0,
            createdAt: moment(new Date(item.createdOn)).format('D MMM YYYY'),
            updatedAt: moment(new Date(item.updatedOn)).format('D MMM YYYY')
        };
    }

})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService);
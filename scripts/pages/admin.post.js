"use strict";

(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService, tinymce, userService) {
    const actions = per.canDoActions(RESOURCES.POST);

    const $postList = $('#post-list');

    const $addModal = $('#addModal');
    const $addForm = $addModal.find('form');
    const $addFormAlertMessage = $addForm.find('#addFormAlertMessage');
    const $addFormSubmit = $addForm.find('#addFormSubmit');
    const $addBtn = $('#addBtn');
    const $addBtnMessage = $('#addBtnMessage');
    let _currentFeatureImageData = null;
    let _currentFeatureImageFileName = null;
    let _currentFeatureImageFileSize = 0;
    let _currentAttachData = null;
    let _currentAttachFileName = null;
    let _currentAttachFileSize = 0;

    const $deleteModal = $('#deleteModal');
    const $deleteBtn = $deleteModal.find('#deleteBtn');

    const $editModal = $('#editModal');
    const $editForm = $editModal.find('form');
    const $editFormAlertMessage = $editForm.find('#editFormAlertMessage');
    const $editFormSubmit = $editForm.find('#editFormSubmit');

    $(function () {
        const urlParams = new URLSearchParams(window.location.search);
        let page = urlParams.get('page');
        if (!page || page < 1) page = 1;
        fillDataList(page);
        fillCategories();

        tinymce.init({
            selector: '#add-content',
            height: 250,
            mobile: {
                theme: 'mobile'
            }
        });
        tinymce.init({
            selector: '#edit-content',
            height: 250,
            mobile: {
                theme: 'mobile'
            }
        });

        if (actions.create || actions.update) {
            $('.upload-image[data-target]').change(function (e) {
                _currentFeatureImageData = null;
                const target = $(this).data('target');
                const errorTarget = $(this).data('error');
                $('#' + target).html('');
                var errorMessage = commonService.getImage(e, target, (data, name, size) => {
                    _currentFeatureImageData = data;
                    _currentFeatureImageFileName = name;
                    _currentFeatureImageFileSize = size;
                });
                commonService.showMessage(errorMessage, $('#' + errorTarget));
            });
            $('.upload-attach').change(function (e) {
                _currentAttachData = null;
                const target = $(this).data('target');
                const errorTarget = $(this).data('error');
                $('#' + target).html('');
                var errorMessage = commonService.getFile(e, target,
                    (data, name, size) => {
                        _currentAttachData = data;
                        _currentAttachFileName = name;
                        _currentAttachFileSize = size;
                    });
                commonService.showMessage(errorMessage, $('#' + errorTarget));
            });
        }

        if (!actions.create) {
            $addBtn.attr('disabled', true);
            $addBtn.addClass('disabled');
            $addBtnMessage.removeClass('d-none');
        } else {
            $addModal.on('show.bs.modal', function () {
                $addForm[0].reset()
                _currentAttachData = null;
                _currentAttachFileName = null;
                $('#add-attach-file').html('');
                _currentFeatureImageData = null;
                _currentFeatureImageFileName = null;
                $('#feature-image-add').html('');
                $addFormAlertMessage.addClass('d-none');
            });
            $addForm.submit(function (e) {
                e.preventDefault();

                var formData = commonService.getFormData($addForm);
                formData.content = tinymce.get('add-content').getContent();

                if (!$addForm.valid()) return;
                if (!formData.content) {
                    commonService.showMessage('Content is required', $addFormAlertMessage);
                    return;
                } else if (/^<p>(\s*(&nbsp;)*\s*)+<\/p>$/.test(formData.content)) {
                    commonService.showMessage('Content is required', $addFormAlertMessage);
                    return;
                }

                //empty resistant
                if (!(formData.name = formData.name.trim()).length) {
                    commonService.showMessage("Please don't enter spaces to required fields", $addFormAlertMessage);
                    return;
                }
                if (formData.short) formData.short = formData.short.trim();

                if (!per.canDo(RESOURCES.POST, ACTIONS.CREATE)) return;

                var post = rep.getEntityByName(rep.keys.post, formData.name);
                if (post == null) {

                    $addFormSubmit.attr('disabled', true);
                    $addFormAlertMessage.text('');
                    $addFormAlertMessage.addClass('d-none');

                    let featureImage = 0;
                    if (_currentFeatureImageData) {
                        featureImage = rep.insertEntity(rep.keys.image, { data: _currentFeatureImageData, name: _currentFeatureImageFileName, size: _currentFeatureImageFileSize });
                        _currentFeatureImageData = null;
                    }
                    let attachFile = 0;
                    if (_currentAttachData) {
                        attachFile = rep.insertEntity(rep.keys.file, { data: _currentAttachData, name: _currentAttachFileName, size: _currentAttachFileSize });
                        _currentAttachData = null;
                    }
                    const creator = userService.getCurrentUser();
                    const category = rep.getEntityById(rep.keys.category, formData.category);
                    $.extend(formData, { createdOn: new Date(), creator: creator, category: category, featureImage: featureImage, attach: attachFile });
                    rep.insertEntity(rep.keys.post, formData);
                    $addModal.modal('hide');
                    fillDataList(1);

                    commonService.alertMessage(`Add post ${formData.name} is successfully!`);
                } else {
                    $addFormAlertMessage.text('Post title is existing');
                    $addFormAlertMessage.removeClass('d-none');
                }

                $addFormSubmit.attr('disabled', false);
            });
        }

        if (!actions.update) {
            $postList.on('click', '.edit-btn', function (e) {
                commonService.alertMessage("You don't have update permission", false, true);
                return false;
            });
        } else {
            $postList.on('click', '.edit-btn[data-id]', function (e) {
                e.preventDefault();
                var id = $(e.currentTarget).data('id');
                $editModal.data('id', id);
                $editModal.modal('show');
            });
            $editModal.on('show.bs.modal', function (e) {
                $editForm[0].reset()
                _currentAttachData = null;
                $('#edit-attach-file').html('');
                _currentFeatureImageData = null;
                $('#feature-image-edit').html('');
                $editFormAlertMessage.addClass('d-none');

                var id = $editModal.data('id');
                var post = rep.getEntityById(rep.keys.post, id);
                if (post) {
                    $editForm.find('[name=name]').val(post.name);
                    $editForm.find('[name=category]').val(post.category ? post.category.id : 0);
                    $editForm.find('[name=mode]').val(post.mode);
                    $editForm.find('[name=content]').val(post.content);
                    $editForm.find('[name=short]').val(post.short);
                    $editForm.find('[name=showOnHomepage]').attr('checked', !!post.showOnHomepage);
                    $editForm.find('[name=isFeature]').attr('checked', !!post.isFeature);
                    tinymce.get('edit-content').setContent(post.content);
                    if (post.featureImage) {
                        var image = rep.getEntityById(rep.keys.image, post.featureImage);
                        if (image) {
                            _currentFeatureImageData = image.data;
                            _currentFeatureImageFileName = image.name;
                            _currentFeatureImageFileSize = image.size;
                            $('#feature-image-edit').html(`<img class="img-fluid img-thumbnail" src="${_currentFeatureImageData}" title="${escape(_currentFeatureImageFileName)}"/>
                            <button type="button" class="btn btn-light btn-sm remove-image float-right" aria-label="Close">
                                    <i class="fa fa-trash"></i>
                                </button>`)
                        };
                    }
                    if (post.attach) {
                        var file = rep.getEntityById(rep.keys.file, post.attach);
                        if (file) {
                            _currentAttachData = file.data;
                            _currentAttachFileName = file.name;
                            _currentAttachFileSize = file.size;
                            $('#edit-attach-file').html(`${escape(_currentAttachFileName)} <small class="text-muted">${_currentAttachFileSize} byte(s)</small>
                            <button type="button" class="btn btn-light btn-sm remove-attach" aria-label="Close">
                                <i class="fa fa-trash"></i>
                            </button>`)
                        };
                    }
                } else {
                    $editFormAlertMessage.text('Post is not found');
                    $editFormAlertMessage.removeClass('d-none');
                }
                $editModal.find('[data-valmsg-for=name]').html('');
            });
            $editForm.submit(function (e) {
                e.preventDefault();

                var id = $editModal.data('id');

                var formData = commonService.getFormData($editForm);
                formData.content = tinymce.get('edit-content').getContent();
                formData.showOnHomepage = $editForm.find('[name=showOnHomepage]').is(':checked');
                formData.isFeature = $editForm.find('[name=isFeature]').is(':checked');

                if (!$editForm.valid()) return;
                if (!formData.content) {
                    commonService.showMessage('Content is required', $editFormAlertMessage);
                    return;
                } else if (/^<p>(\s*(&nbsp;)*\s*)+<\/p>$/.test(formData.content)) {
                    commonService.showMessage('Content is required', $editFormAlertMessage);
                    return;
                }

                //empty resistant
                if (!(formData.name = formData.name.trim()).length) {
                    commonService.showMessage("Please don't enter spaces to required fields", $editFormAlertMessage);
                    return;
                }
                if (formData.short) formData.short = formData.short.trim();
                if (!per.canDo(RESOURCES.POST, ACTIONS.UPDATE)) return;

                var post = rep.getEntityByName(rep.keys.post, formData.name);
                if (post == null || post.id == id) {

                    $editFormSubmit.attr('disabled', true);
                    $editFormAlertMessage.text('');
                    $editFormAlertMessage.addClass('d-none');

                    let featureImage = 0;
                    if (post && post.featureImage)
                        rep.deleteEntityById(rep.keys.image, post.featureImage);
                    if (_currentFeatureImageData) {
                        featureImage = rep.insertEntity(rep.keys.image, { data: _currentFeatureImageData, name: _currentFeatureImageFileName, size: _currentFeatureImageFileSize });
                        _currentFeatureImageData = null;
                    }
                    let attachFile = 0;
                    if (post && post.attach)
                        rep.deleteEntityById(rep.keys.file, post.attach);
                    if (_currentAttachData) {
                        attachFile = rep.insertEntity(rep.keys.file, { data: _currentAttachData, name: _currentAttachFileName, size: _currentAttachFileSize });
                        _currentAttachData = null;
                    }
                    const creator = userService.getCurrentUser();
                    const category = rep.getEntityById(rep.keys.category, formData.category);
                    $.extend(formData, { updatedOn: new Date(), creator: creator, category: category, featureImage: featureImage, attach: attachFile });
                    rep.updateEntity(rep.keys.post, id, formData);
                    $editModal.modal('hide');
                    fillDataList(1);

                    commonService.alertMessage(`Edit post ${formData.name} is successfully!`);
                } else {
                    $editFormAlertMessage.text('Post title is existing');
                    $editFormAlertMessage.removeClass('d-none');
                }

                $editFormSubmit.attr('disabled', false);
            });
        }

        if (!actions.delete) {
            $postList.on('click', '.delete-post', function (e) {
                commonService.alertMessage("You don't have delete permission", false, true);
                return false;
            });
        } else {
            $postList.on('click', '.delete-post[data-id]', function (e) {
                e.preventDefault();
                var id = $(e.currentTarget).data('id');
                $deleteBtn.data('id', id);
                $deleteModal.modal('show');
            });
            $deleteBtn.click(function (e) {
                e.preventDefault();
                var id = $deleteBtn.data('id');
                if (!id) return;
                if (!per.canDo(RESOURCES.POST, ACTIONS.DELETE)) {
                    commonService.alertMessage("You don't have delete permission", false, true);
                    $deleteModal.modal('hide');
                    return;
                }
                var post = rep.getEntityById(rep.keys.post, id);
                if (post == null) {
                    commonService.alertMessage('Post is not found', false, true);
                } else {
                    var result = rep.deleteEntityById(rep.keys.post, post.id);
                    if (result) {
                        if (post.attach) rep.deleteEntityById(rep.keys.file, post.attach);
                        if (post.featureImage) rep.deleteEntityById(rep.keys.image, post.featureImage);

                        commonService.alertMessage(`Delete post '${post.name}' is successfully`);
                        $deleteModal.modal('hide');
                        fillDataList(1);
                    } else {
                        commonService.alertMessage(`Delete post '${post.name}' is failed`, false, true);
                    }
                }
            });
        }

        $(document).on('click', '.remove-image', function (e) {
            e.preventDefault();
            _currentFeatureImageData = null;
            _currentFeatureImageFileName = null;
            _currentFeatureImageFileSize = 0;

            var container = $(this).closest('div');
            container.find('img').remove();
            $(this).remove();
            $('.upload-image').val('');
            $('.upload-image').change();
        });
        $(document).on('click', '.remove-attach', function (e) {
            e.preventDefault();
            _currentAttachData = null;
            _currentAttachFileName = null;
            _currentAttachFileSize = 0;

            var container = $(this).closest('span');
            container.html('');
            $('.upload-attach').val('');
            $('.upload-attach').change();
        });
        $(document).on('click', '.view-details[data-id]', function (e) {
            e.preventDefault();
            const id = $(this).data('id');
            const post = rep.getEntityById(rep.keys.post, id);
            if (post) {
                var $modal = $('#detailModal');
                $modal.find('.modal-title').text(post.name);
                $modal.find('.modal-body').html(post.content);
                $modal.modal('show');
            } else {
                commonService.alertMessage('Post is not found', false, true);
            }
        });
    });

    function fillDataList(page) {
        const pageSize = RESOURCES.POST.adminPageSize;
        const pageIndex = page - 1;

        const $postContainer = $postList.find('tbody');
        const $postTemplate = $('#postTemplate');
        $postContainer.html('');

        if (per.canDo(RESOURCES.POST, ACTIONS.READ)) {
            const posts = rep.getEntities(rep.keys.post) || [];
            if (posts && posts.length) {
                const pagedData = commonService.getPagedData(pageSize, pageIndex, posts);
                const renderData = $.map(pagedData, (item, index) => getRenderItem(item, index + (pageIndex * pageSize)));
                $postTemplate.tmpl(renderData).appendTo($postContainer);
                commonService.updatePager(page, posts.length, pageSize);
            } else {
                $postContainer.html(`<tr><td colspan="8"><div class="alert alert-info">Posts data is empty</div></td></tr>`);
            }
        } else {
            $postContainer.html(`<tr><td colspan="8"><div class="alert alert-danger text-danger">You don't have read permission</div></td></tr>`);
        }
    }

    function fillCategories() {
        const categories = rep.getEntities(rep.keys.category);
        if (categories && categories.length) {
            for (var i = 0; i < categories.length; i++) {
                let category = categories[i];
                $('.select-categories').append(`<option value="${category.id}">${category.name}</option>`);
            }
        }
    }

    function getRenderItem(item, index) {
        const category = rep.getEntityById(rep.keys.category, item.category ? item.category.id : 0);
        return {
            index: index + 1,
            title: item.name,
            id: item.id,
            mode: item.mode,
            short: item.short,
            onHomepage: item.showOnHomepage,
            isFeature: item.isFeature,
            category: {
                name: category && category.name ? category.name : '',
                id: category ? category.id : 0
            },
            content: item.content,
            createdAt: moment(new Date(item.createdOn)).format('D MMM YYYY')
        };
    }
})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService, tinymce, userService);
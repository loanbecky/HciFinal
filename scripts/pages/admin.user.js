"use strict";

(function ($, rep, nav, per, RESOURCES, ACTIONS, commonService, userService) {
    let actions = per.canDoActions(RESOURCES.USER);


    const $userList = $('#user-list');

    const $addModal = $('#addModal');
    const $addForm = $addModal.find('form');
    const $addFormAlertMessage = $addForm.find('#addFormAlertMessage');
    const $addFormSubmit = $addForm.find('#addFormSubmit');
    const $addBtn = $('#addBtn');
    const $addBtnMessage = $('#addBtnMessage');

    const $deleteModal = $('#deleteModal');
    const $deleteBtn = $deleteModal.find('#deleteBtn');

    const $editModal = $('#editModal');
    const $editForm = $editModal.find('form');
    const $editFormAlertMessage = $editForm.find('#editFormAlertMessage');

    $(function () {
        const urlParams = new URLSearchParams(window.location.search);
        let page = urlParams.get('page');
        if (!page || page < 1) page = 1;

        fillDataList(page);
        fillRoleData();

        if (!actions.create) {
            $addBtn.attr('disabled', true);
            $addBtn.addClass('disabled');
            $addBtnMessage.removeClass('d-none');
        } else {
            $addModal.on('show.bs.modal', function () {
                commonService.resetForm($addForm);
                $addFormAlertMessage.addClass('d-none');
            });
            $addForm.submit(function (e) {
                e.preventDefault();
                var formData = commonService.getFormData($addForm);

                if (!$addForm.valid()) return;

                //empty resistant
                if(!(formData.fullname = formData.fullname.trim()).length || !(formData.email = formData.email.trim()).length
                    || !(formData.password = formData.password.trim()).length
                ){
                    commonService.showMessage("Please don't enter spaces to required fields", $addFormAlertMessage);
                    return;
                } else if(formData.password.length < 6){
                    commonService.showMessage("Password's min length is 6", $addFormAlertMessage);
                    return;
                }

                if (!per.canDo(RESOURCES.USER, ACTIONS.CREATE)) return;
                var result = userService.checkEmail(formData.email);
                if (!result) {
                    $addFormAlertMessage.text('');
                    $addFormAlertMessage.addClass('d-none');
                    $addFormSubmit.attr('disabled', true);

                    userService.insertUser(formData);

                    fillDataList(1);

                    $addModal.modal('hide');
                    commonService.alertMessage(`Add user ${name} is successfully!`);
                } else {
                    $addFormAlertMessage.text('Email is existing');
                    $addFormAlertMessage.removeClass('d-none');
                }

                $addFormSubmit.attr('disabled', false);
            });
        }


        if (!actions.update) {
            $userList.on('click', '.edit-btn', function (e) {
                commonService.alertMessage("You don't have update permission");
                return false;
            });
        } else {
            $userList.on('click', '.edit-btn[data-id]', function (e) {
                e.preventDefault();
                var id = $(e.currentTarget).data('id');
                $editModal.data('id', id);
                $editModal.modal('show');
            });
            $editModal.on('show.bs.modal', function (e) {
                var id = $editModal.data('id');
                var user = rep.getEntityById(rep.keys.user, id);
                if (user) {
                    $editFormAlertMessage.text('');
                    $editFormAlertMessage.addClass('d-none');
                    $editForm.find('[name=email]').val(user.email);
                    $editForm.find('[name=password]').val(user.password);
                    $editForm.find('[name=fullname]').val(user.fullname)

                    const role = userService.getRoleByUserId(user.id);
                    $editForm.find('[name=role]').val(role ? role.id : '');
                } else {
                    $editFormAlertMessage.text('User is not found');
                    $editFormAlertMessage.removeClass('d-none');
                }
                $editModal.find('[data-valmsg-for=name]').html('');
            });
            $editForm.submit(function (e) {
                e.preventDefault();

                var id = $editModal.data('id');
                var formData = commonService.getFormData($editForm);
                var user = rep.getEntityById(rep.keys.user, id);
                if (user) {
                    if (!$editForm.valid()) return;
                
                    //empty resistant
                    if(!(formData.fullname = formData.fullname.trim()).length || !(formData.email = formData.email.trim()).length
                        || !(formData.password = formData.password.trim()).length
                    ){
                        commonService.showMessage("Please don't enter spaces to required fields", $editFormAlertMessage);
                        return;
                    }

                    if (!per.canDo(RESOURCES.USER, ACTIONS.UPDATE)) return;

                    var result = userService.checkEmail(formData.email);
                    if (result == null || result.id == id) {
                        $addFormAlertMessage.text('');
                        $addFormAlertMessage.addClass('d-none');
                        $addFormSubmit.attr('disabled', true);

                        var updatedUser = userService.updateUser(id, formData);

                        $editModal.modal('hide');
                        commonService.alertMessage(`Update user ${formData.email} is successfully!`);

                        if (userService.isSessionUser(updatedUser)) {
                            userService.setCurrentUser(updatedUser);
                            if (confirm('Current user is updated. Reload?')) {
                                nav.reload();
                            } else {
                                actions = per.canDoActions(RESOURCES.USER);
                                updateBtnState();
                            }
                        }
                        
                        fillDataList(1);
                    } else {
                        $addFormAlertMessage.text('Email is existing');
                        $addFormAlertMessage.removeClass('d-none');
                    }

                    $addFormSubmit.attr('disabled', false);
                } else {
                    $addFormAlertMessage.text('User is not found');
                    $addFormAlertMessage.removeClass('d-none');
                }
            });
        }

        if (!actions.delete) {
            $userList.on('click', '.delete-btn', function (e) {
                commonService.alertMessage("You don't have delete permission");
                return false;
            });
        } else {
            $userList.on('click', '.delete-btn[data-id]', function (e) {
                e.preventDefault();
                var id = $(e.currentTarget).data('id');
                $deleteBtn.data('id', id);
                $deleteModal.modal('show');
            });
            $deleteBtn.click(function (e) {
                e.preventDefault();
                var id = $deleteBtn.data('id');
                if (!id) return;
                if (!per.canDo(RESOURCES.USER, ACTIONS.DELETE)) {
                    commonService.alertMessage("You don't have delete permission");
                    $deleteModal.modal('hide');
                    return;
                }
                var user = rep.getEntityById(rep.keys.user, id);
                if (user == null) {
                    commonService.alertMessage('User is not found');
                } else {
                    var result = userService.deleteUser(user);
                    if (result) {
                        commonService.alertMessage(`Delete user '${user.email}' is successfully`);

                        $deleteModal.modal('hide');

                        if (userService.isSessionUser(user)) {
                            userService.setCurrentUser(null);
                            alert('Current user is updated. Page reload');
                            setTimeout(() => {
                                nav.reload()
                            }, 1000);
                        }
                        fillDataList(1);
                    } else {
                        commonService.alertMessage(`Delete user '${user.email}' is failed`);
                    }
                }
            });
        }
    });

    function updateBtnState() {
        if (!actions.delete) {
            $userList.on('click', '.delete-btn', function (e) {
                commonService.alertMessage("You don't have delete permission");
                return false;
            });
        }
        if (!actions.update) {
            $userList.on('click', '.edit-btn', function (e) {
                commonService.alertMessage("You don't have update permission");
                return false;
            });
        }
        if (!actions.create) {
            $addBtn.attr('disabled', true);
            $addBtn.addClass('disabled');
            $addBtnMessage.removeClass('d-none');
        }
    }

    function fillRoleData() {
        const roles = rep.getEntities(rep.keys.role) || [];
        if (roles && roles.length) {
            const select = $('select.roles');
            $.each(roles, function (i, item) {
                select.append(`<option value="${item.id}">${item.name}</options>`);
            });
        }
    }
    function fillDataList(page) {
        const pageSize = RESOURCES.USER.pageSize;
        const pageIndex = page - 1;

        const $userContainer = $userList.find('tbody');
        const $userTemplate = $('#userTemplate');
        $userContainer.html('');

        if (per.canDo(RESOURCES.USER, ACTIONS.READ)) {
            const users = rep.getEntities(rep.keys.user) || [];
            if (users && users.length) {
                const pagedData = commonService.getPagedData(pageSize, pageIndex, users);
                const renderData = $.map(pagedData, getRenderItem);
                $userTemplate.tmpl(renderData).appendTo($userContainer);
                commonService.updatePager(page, users.length, pageSize);
            } else {
                $userContainer.html(`<tr><td colspan="7"><div class="alert alert-info">Users data is empty</div></td></tr>`);
            }
        } else {
            $userContainer.html(`<tr><td colspan="7"><div class="alert alert-info">You don't have read permission</div></td></tr>`);
        }
    }
    function getRenderItem(item, index) {



        return {
            index: index + 1,
            email: item.email,
            password: item.password,
            id: item.id,
            fullname: item.fullname,
            role: userService.getRoleByUserId(item.id).name,
            createdAt: item.createdOn ? moment(new Date(item.createdOn)).format('D MMM YYYY') : '',
            updatedAt: item.updatedOn ? moment(new Date(item.updatedOn)).format('D MMM YYYY') : ''
        };
    }
})(jQuery, repository, navigationService, permissionService, RESOURCES, ACTIONS, commonService, userService);
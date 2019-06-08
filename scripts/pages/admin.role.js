'use strict';

(function ($, rep, nav, per, RESOURCES, commonService) {
    const actions = per.canDoActions(RESOURCES.ROLE);

    const $roleContainer = $('#roleContainer');

    const $roleTemplate = $('#roleTemplate');
    const $addRoleBtn = $('#addRoleBtn');
    const $addRoleMessage = $('#addRoleMessage');

    const $addModal = $('#addRole');
    const $addForm = $addModal.find('form');
    const $addnameInput = $addForm.find('[name=name]');
    const $addRoleAlertMessage = $addForm.find('#addRoleAlertMessage');
    const $addRoleBtnSubmit = $addForm.find('#addRoleSubmit');

    const $editModal = $('#editRole');
    const $editForm = $editModal.find('form');
    const $editRoleAlertMessage = $editForm.find('#editRoleAlertMessage');
    const $editRoleSubmit = $editForm.find('#editRoleSubmit');

    const $deleteModal = $('#deleteRole');
    const $deleteRoleBtn = $deleteModal.find('#deleteRoleBtn');

    $(function () {
        fillDataList();

        if (!actions.create) {
            $addRoleBtn.attr('disabled', true);
            $addRoleBtn.addClass('disabled');
            $addRoleMessage.removeClass('d-none');
        } else {
            $addModal.on('show.bs.modal', function () {
                $addnameInput.val('');
                $addForm.find('[data-valmsg-for=name]').html('');
                $addRoleAlertMessage.addClass('d-none');
            });
            $addForm.submit(function (e) {
                e.preventDefault();
                if (!$addForm.valid()) return;
                var name = $addnameInput.val();
                if (!name || !name.length) return;
                //empty resistant
                if(!(name = name.trim()).length){
                    commonService.showMessage("Please don't enter spaces to required fields", $addRoleAlertMessage);
                    return;
                }
                if (!per.canDo(RESOURCES.ROLE, ACTIONS.CREATE)) return;
                var role = rep.getEntityByName(rep.keys.role, name);
                if (role == null) {
                    $addRoleAlertMessage.text('');
                    $addRoleAlertMessage.addClass('d-none');

                    $addRoleBtnSubmit.attr('disabled', true);
                    rep.insertEntity(rep.keys.role, { name: name, createdOn: new Date(), updatedOn: new Date() });
                    $addModal.modal('hide');
                    fillDataList();

                    commonService.alertMessage(`Add role ${name} is successfully!`);
                } else {
                    $addRoleAlertMessage.text('Role name is existing');
                    $addRoleAlertMessage.removeClass('d-none');
                }

                $addRoleBtnSubmit.attr('disabled', false);
            });
        }
        if (!actions.delete) {
            $roleContainer.on('click', '.delete-role', function (e) {
                commonService.alertMessage("You don't have delete permission", false, true);
                return false;
            });
        } else {
            $roleContainer.on('click', '.delete-role[data-id]', function (e) {
                e.preventDefault();
                var id = $(e.currentTarget).data('id');
                $deleteRoleBtn.data('id', id);
                $deleteModal.modal('show');
            });
            $deleteRoleBtn.click(function (e) {
                e.preventDefault();
                var id = $deleteRoleBtn.data('id');
                if (!id) return;
                if (!per.canDo(RESOURCES.ROLE, ACTIONS.DELETE)) {
                    commonService.alertMessage("You don't have delete permission", false, true);
                    $deleteModal.modal('hide');
                    return;
                }
                var role = rep.getEntityById(rep.keys.role, id);
                if (role == null) {
                    commonService.alertMessage('Role is not found', false, true);
                } else {
                    var result = rep.deleteEntityById(rep.keys.role, role.id);
                    if (result) {
                        commonService.alertMessage(`Delete role '${role.name}' is successfully`);
                        $deleteModal.modal('hide');
                        fillDataList();
                    } else {
                        commonService.alertMessage(`Delete role '${role.name}' is failed`, false, true);
                    }
                }
            });
        }

        if (!actions.update) {
            $roleContainer.on('click', '.edit-role', function (e) {
                commonService.alertMessage("You don't have update permission", false, true);
                return false;
            });
        } else {
            $roleContainer.on('click', '.edit-role[data-id]', function (e) {
                e.preventDefault();
                var id = $(e.currentTarget).data('id');
                $editModal.data('id', id);
                $editModal.modal('show');
            });
            $editModal.on('show.bs.modal', function (e) {
                var id = $editModal.data('id');
                var role = rep.getEntityById(rep.keys.role, id);
                if (role) {
                    $editRoleAlertMessage.text('');
                    $editRoleAlertMessage.addClass('d-none');
                    $editForm.find('[name=name]').val(role.name);
                } else {
                    $editRoleAlertMessage.text('Role is not found');
                    $editRoleAlertMessage.removeClass('d-none');
                }
                $editModal.find('[data-valmsg-for=name]').html('');
            });
            $editForm.submit(function (e) {
                e.preventDefault();
                if (!$editForm.valid()) return;
                var name = $editForm.find('[name=name]').val();
                var editId = $editModal.data('id');
                if (!name || !name.length) return;
                //empty resistant
                if(!(name = name.trim()).length){
                    commonService.showMessage("Please don't enter spaces to required fields", $editRoleAlertMessage);
                    return;
                }
                if (!per.canDo(RESOURCES.ROLE, ACTIONS.UPDATE)) return;
                var role = rep.getEntityById(rep.keys.role, editId);
                if (role == null) {
                    $editRoleAlertMessage.text('Role is not found');
                    $editRoleAlertMessage.removeClass('d-none');
                } else {
                    var existingNameRole = rep.getEntityByName(rep.keys.role, name);
                    if (existingNameRole == null || existingNameRole != null && existingNameRole.id == role.id) {
                        $editRoleAlertMessage.text('');
                        $editRoleAlertMessage.addClass('d-none');

                        $editRoleSubmit.attr('disabled', true);
                        var result = rep.updateEntity(rep.keys.role, role.id, { name: name, updatedOn: new Date() });
                        if (result) {
                            commonService.alertMessage(`Update role is successfully!`);
                        } else {
                            commonService.alertMessage(`Update role is failed!`, false, true);
                        }
                        $editModal.modal('hide');
                        fillDataList();
                    } else {
                        $editRoleAlertMessage.text('Role name is existing');
                        $editRoleAlertMessage.removeClass('d-none');
                    }
                }

                $editRoleSubmit.attr('disabled', false);

            });
        }
    });
    function fillDataList() {
        $roleContainer.html('');
        if (per.canDo(RESOURCES.ROLE, ACTIONS.READ)) {
            var roles = rep.getEntities(rep.keys.role);
            if (roles && roles.length) {
                var data = $.map(roles, getRenderItem);
                $roleTemplate.tmpl(data).appendTo($roleContainer);
            } else {
                $roleContainer.html(`<tr><td colspan="5"><div class="alert alert-info">Roles data is empty</div></td></tr>`);
            }
        } else {
            $roleContainer.html(`<tr><td colspan="5"><div class="alert alert-danger text-danger">You don't have read permission</div></td></tr>`);
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
})(jQuery, repository, navigationService, permissionService, RESOURCES, commonService);
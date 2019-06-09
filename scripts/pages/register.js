'use strict';
(function ($, authService, navigationService, rep, commonService) {
    const $form = $('#register-form');
    const $addFormSubmit = $('#register-submit');
    const $alertMessage = $('#alert-message');
    $(function () {
        $form.submit(function (e) {
            e.preventDefault();
            var formData = commonService.getFormData($form);
            if (!$form.valid()) return;

            //empty resistant
            if (!(formData.fullname = formData.fullname.trim()).length || !(formData.email = formData.email.trim()).length
                || !(formData.password = formData.password.trim()).length
            ) {
                commonService.showMessage("Please don't enter spaces to required fields", $alertMessage);
                return;
            } else if (formData.password.length < 6) {
                commonService.showMessage("Password's min length is 6", $alertMessage);
                return;
            }

            var result = userService.checkEmail(formData.email);
            if (!result) {
                $alertMessage.text('');
                $alertMessage.addClass('d-none');
                $addFormSubmit.attr('disabled', true);

                userService.insertUser(formData, newId =>{
                    const newUser = rep.getEntityById(rep.keys.user, newId);
                    userService.setCurrentUser(newUser);
                    commonService.alertMessage(`Register is successfully!`);
                    navigationService.toHome();
                });
            } else {
                $alertMessage.text('Email is existing');
                $alertMessage.removeClass('d-none');
            }

            $addFormSubmit.attr('disabled', false);
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
})(jQuery, authService, navigationService, repository, commonService);
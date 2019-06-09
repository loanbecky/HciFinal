'use strict';
(function ($, authService, navigationService, rep) {
    const $form = $('#loginForm');
    const $alertMessage = $('#alert-message');
    $(function () {
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
})(jQuery, authService, navigationService, repository);
'use strict';

var commonService = (function ($, navigationService) {
    const _this = {};
    const $alertMessage = $('#alertMessage');
    let _timeout = null;
    let _msgTimeout = null;

    _this.alert = $alertMessage;

    $(function () {
        $alertMessage.find('.close').click(function () {
            $alertMessage.addClass('d-none');
            return false;
        });
    });

    _this.alertMessage = function (message, persistent, error) {
        if (message) {
            if(error){
                $alertMessage.removeClass('alert-success');
                $alertMessage.addClass('alert-danger');
                $alertMessage.addClass('text-danger');
            } else {
                $alertMessage.addClass('alert-success');
                $alertMessage.removeClass('alert-danger');
                $alertMessage.removeClass('text-danger');
            }
            $alertMessage.find('.content').html(message);
            $alertMessage.removeClass('d-none');
            clearTimeout(_timeout);
            if (!persistent) {
                _timeout = setTimeout(function () {
                    $alertMessage.addClass('d-none');
                }, 4000);
            }
        } else {
            $alertMessage.addClass('alert-success');
            $alertMessage.removeClass('alert-danger');
            $alertMessage.removeClass('text-danger');
            
            $alertMessage.find('.content').html('');
            $alertMessage.addClass('d-none');
        }
    };

    _this.showMessage = function (message, target, timeout) {
        if (message) {
            target.html(message);
            target.removeClass('d-none');
            clearTimeout(_msgTimeout);
            if (timeout) {
                _msgTimeout = setTimeout(function () {
                    target.addClass('d-none');
                }, 4000);
            }
        } else {
            target.html('');
            target.addClass('d-none');
        }
    };
    _this.updatePager = function (page, totalItems, pageSize) {
        const $pager = $('#pager');
        const $pageItemContainer = $pager.find('.pagination');
        const totalPage = Math.ceil(totalItems / pageSize);
        $pageItemContainer.html('');
        if (totalPage <= 1) {
            $pager.addClass('d-none');
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            for (var i = 1; i < totalPage + 1; i++) {
                let url = `${navigationService.page()}?page=${i}`;
                if (id)
                    url += '&id=' + id;
                var pageItem = `<li class="page-item ${i == page ? 'active' : ''}"><a class="page-link" href="${url}">${i}</a></li>`;
                $pageItemContainer.append(pageItem);
            }
            $pager.removeClass('d-none');
        }
    };
    _this.getPagedData = function (pageSize, pageIndex, allData) {
        allData.reverse();
        const page = pageIndex + 1;
        const data = [];
        for (var i = pageSize * pageIndex; i < pageSize * page && i < allData.length; i++) {
            data.push(allData[i]);
        }
        return data;
    };
    _this.getFormData = function (form) {
        const result = {};
        if (!form || !form.serializeArray) return result;
        const arrays = form.serializeArray();
        for (var i = 0; i < arrays.length; i++) {
            let item = arrays[i];
            result[item.name] = item.value;
        }
        return result;
    };
    _this.getImage = function (evt, target, callback) {
        var files = evt.target.files; // FileList object

        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f; f = files[i]; i++) {
            if (f.size / 1024 / 1024 > RESOURCES.POST.maxImageSize) {
                return `Image's max size is ${RESOURCES.POST.maxImageSize} MB`;
            }

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    // Render thumbnail.
                    var span = document.createElement('span');
                    span.innerHTML = `<img class="img-fluid img-thumbnail" src="${e.target.result}" title="${escape(theFile.name)}"/>
                    <button type="button" class="btn btn-light btn-sm remove-image float-right" aria-label="Close">
                            <i class="fa fa-trash"></i>
                        </button>`;
                    document.getElementById(target).innerHTML = span.innerHTML;
                    if (callback) callback(e.target.result, theFile.name, theFile.size);
                };
            })(f);

            // Read in the image file as a data URL.
            reader.readAsDataURL(f);
        }
    };
    _this.getFile = function (evt, target, callback) {
        var files = evt.target.files; // FileList object

        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f; f = files[i]; i++) {

            if (f.size / 1024 / 1024 > RESOURCES.POST.maxAttachSize) {
                return `Attach file's max size is ${RESOURCES.POST.maxAttachSize} MB`;
            }

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    // Render thumbnail.
                    console.log(target, $('#' + target).length);
                    $('#' + target).html(`${escape(theFile.name)} <small class="text-muted">${theFile.size} byte(s)</small>
                        <button type="button" class="btn btn-light btn-sm remove-attach" aria-label="Close">
                            <i class="fa fa-trash"></i>
                        </button>`);
                    if (callback) callback(e.target.result, theFile.name, theFile.size);
                };
            })(f);

            // Read in the image file as a data URL.
            reader.readAsDataURL(f);
        }
    };
    _this.resetForm = function (form) {
        if (form && form.length) {
            form[0].reset();
            form.find('[data-valmsg-for]').html('');
        }
    };
    return _this;
})(jQuery, navigationService);
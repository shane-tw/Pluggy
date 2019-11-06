window.addEventListener('DOMContentLoaded', function () {
    var newsletterForm = document.getElementById('newsletterForm');
    newsletterForm.addEventListener('submit', function (evt) {
        newsletterForm.style.display = 'none';
        document.getElementById('beforeSubmit').style.display = 'none';
        document.getElementById('afterSubmit').style.display = '';
        evt.preventDefault();
    });
});

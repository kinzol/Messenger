var inputField = document.querySelector('.post-comments-input');

inputField.addEventListener('keypress', function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) {
        sendComment();
    }
});


function sendComment() {
    if (inputField.value != '') {
        console.log(234)
    };
}

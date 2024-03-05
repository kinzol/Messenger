function confirmationDialog(message){
    var confirmDialog = document.querySelector('.confirm-dialog');
    var confirmContainerCancel = document.querySelector('.confirm-dialog-cancel');
    var confirmSpan = document.querySelector('.confirm-dialog-span');
    var confirmButtomYes = document.querySelector('.confirm-dialog-buttons-yes');
    var confirmButtomNo = document.querySelector('.confirm-dialog-buttons-no');

    confirmSpan.innerHTML = message;
    confirmDialog.classList.add('confirm-dialog-show');
    
    return new Promise((resolve, reject) => {
        confirmButtomYes.onclick = function() {
            confirmDialog.classList.remove('confirm-dialog-show');
            confirmDialog.classList.add('confirm-dialog-hide');
            setTimeout(() =>{confirmDialog.classList.remove('confirm-dialog-hide');}, 250)
          resolve(true);
        };
    
        confirmButtomNo.onclick = function() {
            confirmDialog.classList.remove('confirm-dialog-show');
            confirmDialog.classList.add('confirm-dialog-hide');
            setTimeout(() =>{confirmDialog.classList.remove('confirm-dialog-hide');}, 250)
          resolve(false);
        };

        confirmContainerCancel.onclick = function() {
            confirmDialog.classList.remove('confirm-dialog-show');
            confirmDialog.classList.add('confirm-dialog-hide');
            setTimeout(() =>{confirmDialog.classList.remove('confirm-dialog-hide');}, 250)
          resolve(false);
        };

    });
};

// confirmationDialog("Are you sure you want to remove the post?").then((value) => {console.log(value);});
var backgrounds = [
    'radial-gradient(circle at 50% 100%, #6995d9  0%, #90b7e2 60%)',
    'radial-gradient(circle at 50% 100%, #82df7a 0%, #90cd90 60%)',
    'radial-gradient(circle at 50% 100%, #d67995 0%, #ea87a8 60%)',
    'radial-gradient(circle at 50% 100%, #414141 0%, #505050 60%)'
  ];


var newPrivateStatus = clientPrivateStatus;
var newBackground = clientBackground;
var newBackgroundImage = null;
var newAvatarImage = null;
var newUserInfo = false;
var fileSizeLimit = 50*1000;

function changePrivate(element) {
    var profilePrivate = document.querySelector('.mc-profile-user-lock-span');

    if (newPrivateStatus) {
        document.querySelector('#id_private').checked = false;
        element.src = svgUnlock;
        newPrivateStatus = false;
        profilePrivate.innerHTML = 'Your profile is public <span class="settings-lock-description">click on the lock to change status</span>';
        checkChanges();
    } else {
        document.querySelector('#id_private').checked = true;
        element.src = svgLock;
        newPrivateStatus = true;
        profilePrivate.innerHTML = 'Your profile is private <span class="settings-lock-description">click on the lock to change status</span>';
        checkChanges();
    };
};


var changeBackgroundAvaliable = true;
function changeBackgroundColor(colorId) {
    if (changeBackgroundAvaliable) {
        newBackground = colorId;
        document.querySelector('#id_background_style').value = newBackground;
        changeBackgroundAvaliable = false;
        var overlay = document.querySelector('.overlay-background');

        overlay.style.background = backgrounds[colorId];
        overlay.style.transition = "all 1500ms ease-in-out";
        overlay.style.opacity = '1';

        setTimeout(() => {
            document.body.style.background = backgrounds[colorId];
            document.body.style.backgroundAttachment = 'fixed';
            overlay.style.removeProperty("transition");
            overlay.style.opacity = '0';
            changeBackgroundAvaliable = true;
        }, 1500);
        checkChanges();
    };
};


function changeBackgroundImage(element) {
    newBackgroundImage = element.files;
    fileSize = (newBackgroundImage[0].size/ 1024).toFixed(2);

    if (fileSizeLimit < fileSize) {
        fileStatus = false;
        return notification(3, `File size limit exceeded ${fileSizeLimit/1000}MB`)
    }

    var backgroundImg = document.querySelector('.mc-profile-user-background-img');

    var reader = new FileReader();
        reader.onload = (e) => {
            backgroundImg.src = e.target.result;
        }
    reader.readAsDataURL(newBackgroundImage[0]);
    checkChanges();
};


function changeAvatarImage(element) {
    newAvatarImage = element.files;
    fileSize = (newAvatarImage[0].size/ 1024).toFixed(2);

    if (fileSizeLimit < fileSize) {
        fileStatus = false;
        return notification(3, `File size limit exceeded ${fileSizeLimit/1000}MB`)
    }

    var avatarImg = document.querySelector('.mc-profile-user-avatar-img');

    var reader = new FileReader();
        reader.onload = (e) => {
            avatarImg.src = e.target.result;
        }
    reader.readAsDataURL(newAvatarImage[0]);
    checkChanges();
};


function checkChanges() {
    if ((clientPrivateStatus == newPrivateStatus) && 
        (clientBackground == newBackground) && 
        (!newBackgroundImage) && 
        (!newAvatarImage) && 
        (!newUserInfo)) {
        var element = document.querySelector('.save-container');
        element.classList.remove('save-container-show');
    } else {
        var element = document.querySelector('.save-container');
        element.classList.add('save-container-show');
    };
};


function checkAllChanges() {
    if ((clientPrivateStatus == newPrivateStatus) && 
        (clientBackground == newBackground) && 
        (!newBackgroundImage) && 
        (!newAvatarImage) && 
        (!newUserInfo)) {
            return false;
        } else {
            return true;
        };
};


function showEditProfileInfo() {
    var userName = document.querySelector('.mc-profile-user-username').textContent.trim().split(' ');
    var userLogin = document.querySelector('.mc-profile-user-second-username').textContent;
    var userBio = document.querySelector('.mc-profile-user-description').textContent;

    var userNameField = document.querySelector('.epi-name');
    var userSurnameField = document.querySelector('.epi-surname');
    var userLoginField = document.querySelector('.epi-login');
    var userBioField = document.querySelector('.epi-bio');

    userNameField.value = userName[0];
    userSurnameField.value = userName[1];
    userLoginField.value = userLogin;
    userBioField.value = userBio;

    var editProfileWindow = document.querySelector('.edit-profile-info-container');

    editProfileWindow.style.height = '100%';
    editProfileWindow.style.width = '100%';
    editProfileWindow.classList.add('edit-profile-info-container-show');
};

function hideEditProfileInfo() {
    var editProfileWindow = document.querySelector('.edit-profile-info-container');

    if (checkChangesEditProfile()) {
        confirmationDialog('Are you sure you want to close this window without saving the changes?').then((value) => {
            if (value) {
                editProfileWindow.style.height = '100%';
                editProfileWindow.style.width = '100%';
                editProfileWindow.classList.remove('edit-profile-info-container-show');
                setTimeout(() => {
                editProfileWindow.style.height = '0%';
                editProfileWindow.style.width = '0%';
                }, 250);
            };
        ;});
    } else {
        editProfileWindow.style.height = '100%';
        editProfileWindow.style.width = '100%';
        editProfileWindow.classList.remove('edit-profile-info-container-show');
        setTimeout(() => {
            editProfileWindow.style.height = '0%';
            editProfileWindow.style.width = '0%';
        }, 250);
    };
};


function checkChangesEditProfile() {
    var userName = document.querySelector('.mc-profile-user-username').textContent.trim().split(' ');
    var userLogin = document.querySelector('.mc-profile-user-second-username').textContent;
    var userBio = document.querySelector('.mc-profile-user-description').textContent;

    var userNameField = document.querySelector('.epi-name').value;
    var userSurnameField = document.querySelector('.epi-surname').value;
    var userLoginField = document.querySelector('.epi-login').value;
    var userBioField = document.querySelector('.epi-bio').value;

    if ((userName[0] == userNameField) && (userName[1] == userSurnameField) &&
        (userLogin == userLoginField) && (userBio == userBioField)) {
            return false;
        } else {
            return true;
        };
};


function applyChangesEditProfile() {
    if (checkChangesEditProfile()) {
        var userName = document.querySelector('.mc-profile-user-username');
        var userLogin = document.querySelector('.mc-profile-user-second-username');
        var userBio = document.querySelector('.mc-profile-user-description');

        var userNameField = document.querySelector('.epi-name').value;
        var userSurnameField = document.querySelector('.epi-surname').value;
        var userLoginField = document.querySelector('.epi-login').value;
        var userBioField = document.querySelector('.epi-bio').value;

        var formFullName = document.querySelector('#id_full_name');
        var formUsername = document.querySelector('#id_username');
        var formBio = document.querySelector('#id_bio');


        if (userNameField.includes(' ')) {
            notification(3, 'In the name field, spaces are not allowed');
            return
        } else if (userSurnameField.includes(' ')) {
            notification(3, 'In the surname field, spaces are not allowed');
            return
        } else if (userLoginField.includes(' ')) {
            notification(3, 'In the login field, spaces are not allowed');
            return
        };

        formFullName.value = `${userNameField} ${userSurnameField}`
        formUsername.value = userLoginField
        formBio.value = userBioField

        userName.innerHTML = userName.innerHTML.replace(userName.textContent.trim(), '');
        userName.innerHTML = `${userNameField} ${userSurnameField}` + userName.innerHTML;
        userLogin.textContent = userLoginField;
        userBio.textContent = userBioField;

        var editProfileWindow = document.querySelector('.edit-profile-info-container');
        editProfileWindow.style.height = '100%';
        editProfileWindow.style.width = '100%';
        editProfileWindow.classList.remove('edit-profile-info-container-show');
        setTimeout(() => {
            editProfileWindow.style.height = '0%';
            editProfileWindow.style.width = '0%';
        }, 250);

        newUserInfo = true;
        checkChanges();
    } else {
        var editProfileWindow = document.querySelector('.edit-profile-info-container');
        editProfileWindow.style.height = '100%';
        editProfileWindow.style.width = '100%';
        editProfileWindow.classList.remove('edit-profile-info-container-show');
        setTimeout(() => {
            editProfileWindow.style.height = '0%';
            editProfileWindow.style.width = '0%';
        }, 250);
    };
};


var saveClicked = false;
function saveAllSettings() {
    document.querySelector('#id_username').value = document.querySelector('.mc-profile-user-second-username').textContent;
    confirmationDialog('Are you sure you want to save changes? Data such as the username can be changed once every 14 days!').then((value) => {
        if (value) {
            saveClicked = true;
            document.querySelector("#form-save-button").click();
        } else {
            saveClicked = false;
        };
    });
};

window.addEventListener('beforeunload', (e) => {
    if (checkAllChanges() && !saveClicked) {
        e.preventDefault()
    };
});


function logout(){
    confirmationDialog('Are you sure you want to leave your account?').then((value) => {
        if (value) {
            document.location.href = `${window.location.origin}/logout`
        }
    });
};


$(document).ready(function(){
    $('#settingsForm').submit(function(event){
        event.preventDefault();
        
        $.ajax({
            type: 'POST',
            url: $(this).attr('action'),
            data: $(this).serialize(),
            success: function(response){
                console.log(response);
                if (response.status == true) {
                    location.reload()
                } else if ((response.status == false) && (response.error == 'username')) {
                    document.querySelector('.mc-profile-user-second-username').innerHTML = username;
                    document.querySelector('#id_username').value = username;
                    notification(3, response.message)
                    checkChanges();
                }
            },
        });
    });
});

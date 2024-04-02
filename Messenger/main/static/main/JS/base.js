function offFullScreenPhoto() {
    var fullScreen = document.querySelector('.full-screen-photo');

    fullScreen.style.opacity = '0';
    setTimeout(() => {fullScreen.style.display = 'none';}, 150);
};


function OnFullScreenPhoto(element) {
    var fullScreen = document.querySelector('.full-screen-photo');
    var fullScreenImg = document.querySelector('.full-screen-content');

    fullScreenImg.src = element.src;
    fullScreen.style.display = 'flex';
    setTimeout(() => {fullScreen.style.opacity = '1';}, 10);
};

function showMobileMenu() {
    var mobileMenu = document.querySelector(".mobile-full-buttons");
    mobileMenu.classList.remove('block-hide-menu');
    mobileMenu.classList.add('block-show-menu');
    statusBlockMenu = true;
};
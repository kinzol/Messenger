var dataLoading = true;
var outset = 12;
window.onscroll = function(ev) {
    if (((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) && dataLoading) {

        dataLoading = false;
        outset += 12;

        $.ajax({
            url: '/api/v1/notification/',
            method: 'get',
            dataType: 'json',
            data: {outset: outset},
            success: function(data){
                appendUsers(data);
            }
        });
        
    }
};


function appendUsers(data) {
    if (data.notifications.length == 0) {return};

    dataLoading = true;
    result = '';
    var selectionMenu = document.querySelector('.selection-menu');

    data.notifications.forEach((element) => {
        if (element.type == 'like') {
            result += `<a href="/profile/${element.username}" class="selection-menu-button">
                <img class="selection-menu-button-svg" src="${svgLikeWhite}" alt="svg-image">
                <span class="selection-menu-button-name">${element.username} likes your post</span>
                <img class="selection-menu-button-svg" style="margin-left: auto" src="${svgRightArrow}" alt="svg-image">
                </a>`;
        } else if (element.type == 'follow') {
            result += `<a href="/profile/${element.username}" class="selection-menu-button">
                <img class="selection-menu-button-svg" src="${svgProfilePlus}" alt="svg-image">
                <span class="selection-menu-button-name">${element.username} subscribes to you</span>
                <img class="selection-menu-button-svg" style="margin-left: auto" src="${svgRightArrow}" alt="svg-image">
                </a>`;
        } else if (element.type == 'comment') {
            result += `<a href="/profile/${element.username}" class="selection-menu-button">
                <img class="selection-menu-button-svg" src="${svgCommentDots}" alt="svg-image">
                <span class="selection-menu-button-name">${element.username} wrote a comment on your post</span>
                <img class="selection-menu-button-svg" style="margin-left: auto" src="${svgRightArrow}" alt="svg-image">
                </a>`;
        };
    });

    selectionMenu.innerHTML += result;
};

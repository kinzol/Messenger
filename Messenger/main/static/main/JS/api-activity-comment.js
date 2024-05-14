var offset = 12;
var dataLoading = true;

window.onscroll = function(ev) {
    if (((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) && dataLoading) {

        dataLoading = false;
        offset += 12;

        $.ajax({
            url: '/api/v1/activity/',
            method: 'get',
            dataType: 'json',
            data: {offset: offset, activity_type: 'comment'},
            success: function(data){
                createComment(data)
            }
        });
        
    };
};


function createComment(data) {
    if (data.comments.length == 0) {return};
    dataLoading = false;

    var selectionMenuContainer = document.querySelector('.selection-menu-container');
    var result = '';

    data.comments.forEach((comment) => {
        result += `<a href="/post/${comment.post_id}" class="selection-menu-button">
            <img class="selection-menu-button-svg" src="${svgCommentDots}" alt="svg-image">
            <span class="selection-menu-button-name">${comment.content}</span>
            <img class="selection-menu-button-svg" style="margin-left: auto" src="${svgRightArrow}" alt="svg-image">
            </a>`;
    });

    selectionMenuContainer.innerHTML += result;
};
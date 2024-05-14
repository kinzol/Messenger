var offset_activity = 12;
var dataLoading = true;

window.onscroll = function(ev) {
    if (((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) && dataLoading) {

        dataLoading = false;

        $.ajax({
            url: '/api/v1/activity/',
            method: 'get',
            dataType: 'json',
            data: {offset: offset_activity, activity_type: activityType},
            success: function(data){
                prepData(data)
            }
        });
        
    }
};


function prepData(data) {
    if (data.posts.length == 0) {return};
    dataLoading = true;
    offset_activity += 12;

    data.posts.forEach((post) => {
        createMiniPost(post);
    });
};


function createMiniPost(post) {
    var selectionMenuContainer = document.querySelector('.selection-menu-container');
    var resultMini = '';
    var files = post.files

    resultMini += `<a href="/post/${post.pk}" class="mc-feed-article-mini">`
    if (files.length == 1) {
        if (files[0]['extension'] == 'video') {
            resultMini += `<img class="mc-feed-article-mini-svg" src="${svgPlay}" alt="svg-image">
                       <video class="mc-feed-article-mini-img" src="${files[0]['file_url']}"></video>`;
        } else if (files[0]['extension'] == 'image') {
            resultMini += `<img class="mc-feed-article-mini-img" src="${files[0]['file_url']}" alt="article-photo">`;
        };
    } else if (files.length > 1) {
        resultMini += `<img class="mc-feed-article-mini-svg" src="${svgPhotos}" alt="svg-image">`;
        if (files[0]['extension'] == 'video') {
            resultMini += `<video class="mc-feed-article-mini-img" src="${files[0]['file_url']}"></video>`;
        } else if (files[0]['extension'] == 'image') {
            resultMini += `<img class="mc-feed-article-mini-img" src="${files[0]['file_url']}" alt="article-photo">`;
        };
    } else if (files.length == 0) {
        resultMini += `<img class="mc-feed-article-mini-svg" src="${svgText}" alt="svg-image">
                   <div class="mc-feed-article-mini-text">${post.content}</div>`;
    };
    selectionMenuContainer.innerHTML += resultMini + '</a>';
};

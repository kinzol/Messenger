var outset = 12;
var dataLoading = true;

window.onscroll = function(ev) {
    if (((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) && dataLoading) {

        dataLoading = false;
        outset += 12;

        $.ajax({
            url: '/api/v1/activity/',
            method: 'get',
            dataType: 'json',
            data: {outset: outset, activity_type: activityType},
            success: function(data){
                prepData(data)
            }
        });
        
    }
};


function prepData(data) {
    if (data.posts.length == 0) {return};
    dataLoading = true;

    data.posts.forEach((post) => {

        $.ajax({
            url: '/api/v1/post/file/',
            method: 'get',
            dataType: 'json',
            data: {post_id: post.pk},
            success: function(data){
                createPost(post, data.files);
            }
        });

    });
};


function createPost(post, files) {
    var selectionMenuContainer = document.querySelector('.selection-menu-container');
    var resultMini = '';

    resultMini += `<a href="/post/${post.pk}" class="mc-feed-article-mini">`
    if (files.length == 1) {
        if (files[0].extension == 'video') {
            resultMini += `<img class="mc-feed-article-mini-svg" src="${svgPlay}" alt="svg-image">
                       <video class="mc-feed-article-mini-img" src="${files[0].file}"></video>`;
        } else if (files[0].extension == 'image') {
            resultMini += `<img class="mc-feed-article-mini-img" src="${files[0].file}" alt="article-photo">`;
        };
    } else if (files.length > 1) {
        resultMini += `<img class="mc-feed-article-mini-svg" src="${svgPhotos}" alt="svg-image">`;
        if (files[0].extension == 'video') {
            resultMini += `<video class="mc-feed-article-mini-img" src="${files[0].file}"></video>`;
        } else if (files[0].extension == 'image') {
            resultMini += `<img class="mc-feed-article-mini-img" src="${files[0].file}" alt="article-photo">`;
        };
    } else if (files.length == 0) {
        resultMini += `<img class="mc-feed-article-mini-svg" src="${svgText}" alt="svg-image">
                   <div class="mc-feed-article-mini-text">${post.content}</div>`;
    };
    selectionMenuContainer.innerHTML += resultMini + '</a>';
};

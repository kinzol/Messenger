var dataLoading = true;
var debounceTimer;

window.onscroll = function(ev) {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(function() {
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight && dataLoading) {
            dataLoading = false;

            $.ajax({
                url: '/api/v1/post/recommendation/',
                method: 'get',
                dataType: 'json',
                success: function(data){
                    prepData(data);
                }
            });
        }
    }, 200);
};


function prepData(data) {
    if (data.posts.length == 0) {
        return;
    }

    var fragment = document.createDocumentFragment();
    data.posts.slice(0, 12).forEach((post) => {
        var article = createPostRec(post);
        fragment.appendChild(article);
    });

    document.querySelector('.mc-feed-article-container').appendChild(fragment);

    dataLoading = true;
}


function createPostRec(post) {
    var result = '';
    var files = post.files

    var article = document.createElement('article');
    article.className = 'mc-feed-article';
    article.dataset.id = post.pk;

    result += `
        <div data-id="${post.pk}" class="mc-feed-article-share-container">
            <header class="mc-feed-article-share-header">
                Share
                <img data-id="${post.pk}" class="mc-feed-article-share-close-img" src="${svgClose}" onclick="hideShareContainer(this)" alt="svg-image">
            </header>
            <input data-id="${post.pk}" type="text" class="mc-feed-article-share-input" oninput="shareFilter(this)">

            <div class="mc-feed-article-share-userlist custom-scrollbar">
                <div class="mc-feed-article-share-user">
                    <img class="mc-feed-article-share-user-img" src="" alt="user's avatar">
                    <a href="#"><div class="mc-feed-article-share-user-name">Elon Musk
                        <div class="mc-feed-article-share-user-second-name">blg</div>
                    </div></a>
                    <div class="mc-feed-article-share-user-share">Share</div>
                </div>

                <div class="mc-feed-article-share-user">
                    <img class="mc-feed-article-share-user-img" src="" alt="user's avatar">
                    <a href="#"><div class="mc-feed-article-share-user-name">Radmir Musk
                        <div class="mc-feed-article-share-user-second-name">egor</div>
                    </div></a>
                    <div class="mc-feed-article-share-user-share">Share</div>
                </div>

            </div>
        </div>`;

    if (post.viewed_story_exists) {
        result += `<div class="mc-feed-article-userinfo">
            <a href="/profile/${post.author}">
                <div class="mc-feed-article-story">
                    <img class="mc-feed-article-avatar" src="${post.author_avatar}" alt="${post.author}'s avatar">
                </div>
            </a>`;
    } else {
        result += `<div class="mc-feed-article-userinfo">
            <a href="/profile/${post.author}"><img class="mc-feed-article-avatar" src="${post.author_avatar}" alt="${post.author}'s avatar"></a>`;
    };

    result += `<a href="/profile/${post.author}"><h2 class="mc-feed-article-username">${post.author_full_name}</h2></a>`;

    if (post.author_verify) {
        result += `<img class="user-verify" title="Verified" src="${svgVerify}" alt="Verified">`
    };

    result += `<img data-id="${post.pk}" class="mc-feed-article-menu-img" src="${svgDotsVertical}" onclick="openArticleMenu(this)" alt="svg-image">
    <div data-id="${post.pk}" class="mc-feed-article-menu">`;

    if (post.author == username) {
        result += `<div data-id="${post.pk}" class="mc-feed-article-menu-a mc-feed-article-menu-a-red" onclick="articleDelete(this)">Delete</div>`;
    } else {
        result += `<div data-id="${post.pk}" class="mc-feed-article-menu-a" onclick="articleNotInterested(this)">Not Interested</div>`;
    };

    result += `<div data-id="${post.pk}" class="mc-feed-article-menu-a" onclick="articleCopyLink(this)">Copy Link</div></div></div>`;

    if (files.length == 0) {
        result += `<p class="mc-feed-article-description-solo">${post.content}</p>`;
    } else {
        result += `<p class="mc-feed-article-description">${post.content}</p>`;
    };

    result += '<div class="mc-feed-article-hashtags">';

    post.tags.forEach((tag) => {
        result += `<span>#${tag}</span>`;
    });

    result += '</div>';

    if (files.length != 0) {
        if (files.length > 1) {
            result += `<div class="mc-feed-article-pictures-container">
                <span class="mc-feed-article-scrollable">Scrollable</span>
                <div class="mc-feed-article-pictures-content">`;

            files.forEach((file) => {
                if (file['extension'] == 'video') {
                    result += `<video controls preload="metadata" class="mc-feed-article-article-img">
                        <source src="${file['file_url']}">
                        </video>`;
                } else if (file['extension'] == 'image') {
                    result += `<img class="mc-feed-article-article-img" src="${file['file_url']}"  onclick="OnFullScreenPhoto(this)" alt="image">`;
                };
            });
            result += '</div></div>';

        } else if (files.length == 1) {
            if (files[0]['extension'] == 'video') {
                result += `<video controls preload="metadata" class="mc-feed-article-article-img">
                    <source src="${files[0]['file_url']}">
                    </video>`;
            } else if (files[0]['extension'] == 'image') {
                result += `<img class="mc-feed-article-article-img" src="${files[0]['file_url']}"  onclick="OnFullScreenPhoto(this)" alt="image">`;
            };
        };
    };

    result += `<div class="mc-feed-article-activity">`;

    if (post.like_exists) {
        result += `<div data-id="${post.pk}" style='display:none;' class="mc-feed-article-like pointer" onclick="addLikeArticle(this)"><img class="mc-feed-article-activity-img" src="${svgLikeWhite}"></div>
        <div data-id="${post.pk}" class="mc-feed-article-liked pointer" onclick="removeLikeArticle(this)"><img class="mc-feed-article-activity-img" src="${svgLikeRed}"></div>`;
    } else {
        result += `<div data-id="${post.pk}" class="mc-feed-article-like pointer" onclick="addLikeArticle(this)"><img class="mc-feed-article-activity-img" src="${svgLikeWhite}"></div>
        <div data-id="${post.pk}" style='display:none;' class="mc-feed-article-liked pointer" onclick="removeLikeArticle(this)"><img class="mc-feed-article-activity-img" src="${svgLikeRed}"></div>`;
    };

    result += `<a href="/post/${post.pk}" data-id="${post.pk}" class="mc-feed-article-comments pointer"><img class="mc-feed-article-activity-img" src="${svgCommentDots}"></a>
    <div data-id="${post.pk}" class="mc-feed-article-share pointer" onclick="showShareContainer(this)"><img class="mc-feed-article-activity-img" src="${svgShare}"></div>`;

    if (post.bookmark_exists) {
        result += `<div data-id="${post.pk}" style='display:none;' class="mc-feed-article-save pointer" onclick="addSaveArticle(this)"><img class="mc-feed-article-activity-img" src="${svgSave}"></div>
        <div data-id="${post.pk}" class="mc-feed-article-save-filled pointer" onclick="removerSaveArticle(this)"><img class="mc-feed-article-activity-img" src="${svgSaveFilled}"></div>`;
    } else {
        result += `<div data-id="${post.pk}" class="mc-feed-article-save pointer" onclick="addSaveArticle(this)"><img class="mc-feed-article-activity-img" src="${svgSave}"></div>
        <div data-id="${post.pk}" style='display:none;' class="mc-feed-article-save-filled pointer" onclick="removerSaveArticle(this)"><img class="mc-feed-article-activity-img" src="${svgSaveFilled}"></div>`;
    };

    result += `</div>
        <div class="display-grid">
        <a href="/post/likes/${post.pk}" class="mc-feed-article-text-count">Likes: <span data-id="${post.pk}" class="mc-feed-article-count mc-fd-art-c-like">${post.amount_likes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}</span></a>
        <span class="mc-feed-article-text-count">Comments: <span data-id="${post.pk}" class="mc-feed-article-count">${post.amount_comments.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}</span></span>
        <span class="mc-feed-article-time">${formatDate(post.time_create).format2}</span>
        </div>`;

    // articleContainer.innerHTML += result;
    article.innerHTML = result;
    return article;
};

function formatDate(dateTimeString) {
    const date = new Date(dateTimeString);
    
    const options1 = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    const formattedDate1 = new Intl.DateTimeFormat(undefined, options1).format(date);

    const options2 = { month: 'long', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' };
    const formattedDate2 = new Intl.DateTimeFormat(undefined, options2).format(date);
    
    return { format1: formattedDate1, format2: formattedDate2 };
}

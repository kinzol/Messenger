var inputField = document.querySelector('.post-comments-input');

inputField.addEventListener('keypress', function (e) {
    var key = e.which || e.keyCode;
    if (key === 13) {
        sendComment();
    }
});


function sendComment() {
    var inputField = document.querySelector('.post-comments-input');
    if (inputField.value != '') {
        var postComments = document.querySelector('.post-comments');
        var postCommentsInputContainer = document.querySelector('.post-comments-input-container');
        var mcFeedArticleCount = document.querySelectorAll('.mc-feed-article-count')[1];

        $.ajax({
            url: '/api/v1/post/comment/',
            method: 'post',
            dataType: 'json',
            data: {post_id: post_id, post_author: post_author, content: inputField.value},
            success: function(data){
                result = createComment(data.comment_pk);
                result = `<div class="post-comments-input-container">
                    <input type="text" placeholder="Your comment" class="post-comments-input">
                    <img class="post-comments-input-send" src="${svgSend}" alt="send-button-svg" onclick="sendComment()">
                    </div>${result}`;
                postComments.removeChild(postCommentsInputContainer);
                postComments.innerHTML = result + postComments.innerHTML;
                mcFeedArticleCount.innerHTML = parseInt(mcFeedArticleCount.innerHTML.replace(/\s/g, '')) + 1;
                mcFeedArticleCount.innerHTML = mcFeedArticleCount.innerHTML.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }
        });

    };
}


$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
    }
});

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}



var dataLoading = true;
var outset = 12;
window.onscroll = function(ev) {
    if (((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) && dataLoading) {

        dataLoading = false;

        $.ajax({
            url: '/api/v1/post/comment/',
            method: 'get',
            dataType: 'json',
            data: {outset: outset, post_author: post_author, post_id: post_id},
            success: function(data){
                dataProcessing(data);
            }
        });
        
    }
};


function dataProcessing(comments) {
    if (comments.comments.length == 0) {
        return;
    };

    var postComments = document.querySelector('.post-comments');
    var result = '';

    comments.comments.forEach(function(comment) {
        const formattedDates = formatDate(comment.time_create);

        result += `<div data-id="${comment.pk}" class="post-comment">`;

        if (my_username == comment.username) {
            result += `<img data-id="${comment.pk}" class="post-comment-trash" onclick="deleteComment(this)" alt="svg-image" src="${svgTrashWhite}" title="delete">`;
        }

        result += `<a href="/profile/${comment.username}"><img src="${comment.avatar}" alt="${comment.username}'s avatar" class="post-comment-user-avatar"></a>
            <div class="post-text-content">
            <a href="/profile/${comment.username}" class="post-text-content-user">${comment.full_name}`;

        if (comment.verify) {
            result += `<img class="user-verify user-verify-small" title="Verified" src="${svgVerify}" alt="verified">`;
        };

        result += `</a><div class="post-comment-message">${comment.content}</div></div>
            <span class="post-comment-time" title="${formattedDates.format2}">${formattedDates.format1}</span></div>`;
    });

    postComments.innerHTML += result;

    dataLoading = true;
    outset += 12;
};

function createComment(comment_id) {
    var inputField = document.querySelector('.post-comments-input');
    result = '';
    const formattedDates = formatDate(Date.now());

    result += `<div data-id="${comment_id}" class="post-comment">`;
    result += `<img data-id="${comment_id}" class="post-comment-trash" onclick="deleteComment(this)" alt="svg-image" src="${svgTrashWhite}" title="delete">`;

    result += `<a href="/profile/${my_username}"><img src="${my_avatar}" alt="${my_username}'s avatar" class="post-comment-user-avatar"></a>
        <div class="post-text-content">
        <a href="/profile/${my_username}" class="post-text-content-user">${my_full_name}`;
        
    if (my_verify == 'True') {
        result += `<img class="user-verify user-verify-small" title="Verified" src="${svgVerify}" alt="verified">`;
    };

    result += `</a><div class="post-comment-message">${inputField.value}</div></div>
        <span class="post-comment-time" title="${formattedDates.format2}">${formattedDates.format1}</span></div>`;

    return result;

};


function deleteComment(element) {
    var postComment = document.querySelector(`[data-id='${element.getAttribute('data-id')}'].post-comment`);
    var postComments = document.querySelector('.post-comments');
    var mcFeedArticleCount = document.querySelectorAll('.mc-feed-article-count')[1];

    confirmationDialog("Are you sure you want to delete your comment?").then((value) => {
        if (value) {
        
            $.ajax({
                url: '/api/v1/post/comment/',
                method: 'delete',
                dataType: 'json',
                data: {comment_id: element.getAttribute('data-id'), post_id: post_id},
                success: function(data){
                    if (data.status) {
                        notification(2, 'Your comment was successfully deleted!')
                        postComments.removeChild(postComment);
                        mcFeedArticleCount.innerHTML = parseInt(mcFeedArticleCount.innerHTML.replace(/\s/g, '')) - 1;
                        mcFeedArticleCount.innerHTML = mcFeedArticleCount.innerHTML.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                    } else {
                        notification(3, 'An error occurred while deleting a comment!')
                    };
                }
            });
        };
    });

};


function formatDate(dateTimeString) {
    const date = new Date(dateTimeString);
    
    const options1 = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    const formattedDate1 = new Intl.DateTimeFormat(undefined, options1).format(date);

    const options2 = { month: 'long', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' };
    const formattedDate2 = new Intl.DateTimeFormat(undefined, options2).format(date);
    
    return { format1: formattedDate1, format2: formattedDate2 };
}


document.addEventListener("DOMContentLoaded", (event) => {
    var postCommentTime = document.querySelectorAll('.post-comment-time');
    var mcFeedArticleTime = document.querySelector('.mc-feed-article-time');
    var formattedDates = formatDate(mcFeedArticleTime.innerHTML);
    
    mcFeedArticleTime.innerHTML = formattedDates.format2;
    postCommentTime.forEach((comment) => commentChangeTime(comment));
});

function commentChangeTime(element) {
    var formattedDates = formatDate(element.title)

    element.title = formattedDates.format2;
    element.innerHTML = formattedDates.format1;
};

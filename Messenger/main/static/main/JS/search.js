var inputContent = null
var outset = 0;
var dataLoading = false;

function searchInput(element) {
    var tempInputContent = element.value;
    setTimeout(() => {
        var searchInputElement = document.querySelector('.search-input');
        if ((inputContent == tempInputContent) && (inputContent == searchInputElement.value) && (searchInputElement.value != '')) {
            console.log(searchInputElement.value);

            outset = 0;
            dataLoading = true;

            $.ajax({
                url: '/api/v1/search/',
                method: 'get',
                dataType: 'json',
                data: {outset: outset, query: searchInputElement.value},
                success: function(data){
                    appendSearchedUsers(data, true);
                }
            });

        };
        inputContent = searchInputElement.value;
    }, 1200);
};


function appendSearchedUsers(users, new_data) {
    var searchUsers = document.querySelector('.search-users');
    var searchUsersContent = '';
    var verified = `<img class="user-verify user-verify-small" title="Verified" src="${svgVerify}" alt="verified">`;

    if (users.users.length == 0 && new_data) {
        return searchUsers.innerHTML = '<span class="nothing">No one was found</span>';
    } else if (users.users.length == 0) {
        return
    };

    users.users.forEach((user) => {
        searchUsersContent += `
        <a href="/profile/${user.username}" class="search-users-container">
            <img src="${user.avatar}" alt="${user.username}'s image" class="search-users-container-avatar">
            <div class="search-users-container-userinfo">
                <div class="sucu-name">${user.full_name}
                    ${user.verify ? verified : ''}
                </div>
                <div class="sucu-login">${user.username}</div>
            </div>
            <img class="search-users-container-avatar" style="margin-left: auto; opacity: 0.6;" src="${svgRightArrow}" alt="svg-image">
        </a>`;      
    });

    if (new_data) {
        searchUsers.innerHTML = searchUsersContent;
    } else {
        searchUsers.innerHTML += searchUsersContent;
    };
    dataLoading = true;
};


window.onscroll = function(ev) {
    if (((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) && dataLoading) {

        dataLoading = false;
        outset += 12;
        var searchInputElement = document.querySelector('.search-input');

        if (searchInputElement.value == '') {return};

        $.ajax({
            url: '/api/v1/search/',
            method: 'get',
            dataType: 'json',
            data: {outset: outset, query: searchInputElement.value},
            success: function(data){
                appendSearchedUsers(data, false);
            }
        });
        
    }
};
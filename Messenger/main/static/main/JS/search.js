var inputContent = null


function searchInput(element) {
    var tempInputContent = element.value;
    setTimeout(() => {
        var searchInputElement = document.querySelector('.search-input');
        if ((inputContent == tempInputContent) && (inputContent == searchInputElement.value) && (searchInputElement.value != '')) {
            console.log(searchInputElement.value);
        };
        inputContent = searchInputElement.value;
    }, 1500);
};


function appendSearchedUsers(users) {
    var searchUsers = document.querySelector('.search-users');
    var searchUsersContent = '';
    var verified = `<img class="user-verify user-verify-small" title="Verified" src="${svgVerify}" alt="verified">`;

    users.forEach((user) => {
        searchUsersContent += `
        <a href="${window.location.origin}/profile/${user.login}" class="search-users-container">
            <img src="${user.avatar}" alt="${user.login}'s image" class="search-users-container-avatar">
            <div class="search-users-container-userinfo">
                <div class="sucu-name">${user.username}
                    ${user.verify ? verified : ''}
                </div>
                <div class="sucu-login">${user.login}</div>
            </div>
            <img class="search-users-container-avatar" style="margin-left: auto; opacity: 0.6;" src="${svgRightArrow}" alt="svg-image">
        </a>`;      
    });
    searchUsers.innerHTML = searchUsersContent;
};


function test() {
    appendSearchedUsers([{'verify': true, 'login': 'sha', 'username': 'asd', 'avatar': svgRightArrow}])
};

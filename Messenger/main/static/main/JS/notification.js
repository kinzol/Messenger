function notification(type, message) {
    var notifications = document.querySelector('.notifications');

    var notificationContainer = document.createElement('div');
    notifications.appendChild(notificationContainer);
    notificationContainer.classList.add('notifications-container');

    var notificationSide = document.createElement('div');
    notificationContainer.appendChild(notificationSide);
    notificationSide.classList.add('notifications-c-side');

    var notificationSideImg = document.createElement('img');
    notificationSide.appendChild(notificationSideImg);
    notificationSideImg.classList.add('notifications-c-img');

    var notificationContainerSpan = document.createElement('span');
    notificationContainer.appendChild(notificationContainerSpan);
    notificationContainerSpan.classList.add('notifications-c-span');
    notificationContainerSpan.innerHTML = message;

    var notificationTimeout = document.createElement('div');
    notificationContainer.appendChild(notificationTimeout);
    notificationTimeout.classList.add('notifications-c-timeout');

    if (type == 1) {
        notificationSide.classList.add('notifications-c-side-green');
        notificationTimeout.classList.add('notifications-c-side-green');
        notificationSideImg.src = notificationImgs[0];
    } else if (type == 2) {
        notificationSide.classList.add('notifications-c-side-blue');
        notificationTimeout.classList.add('notifications-c-side-blue');
        notificationSideImg.src = notificationImgs[1];
    } else if (type == 3) {
        notificationSide.classList.add('notifications-c-side-red');
        notificationTimeout.classList.add('notifications-c-side-red');
        notificationSideImg.src = notificationImgs[2];
    } else {
        console.error()
        notifications.removeChild(notificationContainer);
        throw new Error('Incorrect type id specified');
    };

    setTimeout(() => {
        if (!notificationContainer.classList.contains('notification-hide')) {
            notifications.removeChild(notificationContainer);
        };
    }, 10000);

    notificationContainer.addEventListener('click', () => {
        notificationContainer.classList.add('notification-hide');
        setTimeout(() => {
            notifications.removeChild(notificationContainer);
        }, 1000);
    });
};
var messageSound

document.addEventListener("DOMContentLoaded", (event) => {
    messageSound = new Audio(newMessageSound) 
});

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


function hideMessageNotification(element) {
    element.classList.remove('message-notification-content-show');
    setTimeout(() => {
        element.parentNode.removeChild(element);
    }, 150);
};

function showMessageNotification(notifyUserId, text) {
    var messageNotification = document.querySelector('.message-notification')

    if (!messageNotification.textContent.includes(notifyUserId)) {

        if (!userNamesNotification[notifyUserId]) {
            // ОБРАЩЕНИЕ К АПИ И ЗАПРОС АВЫ И НИКА И ЗАПИСАТЬ ИХ В СЛОВАРЬ

            $.ajax({
                url: '/api/v1/chat/chats/',
                method: 'get',
                dataType: 'json',
                data: {user_id: notifyUserId, get_type: 'user_info'},
                success: function(data){
                    userNamesNotification[notifyUserId] = data.full_name;
                    userAvatarsNotification[notifyUserId] = data.avatar;

                    showMessageNotificationData(messageNotification, notifyUserId, text);
                }
            });

        } else {
            showMessageNotificationData(messageNotification, notifyUserId, text);
        };
    } else {
        var messageNotificationContentInfoMessage = document.querySelector(`[data-id='${notifyUserId}'].message-notification-content-info-message`);
        messageNotificationContentInfoMessage.innerHTML = text;
    };
};

function showMessageNotificationData(messageNotification, notifyUserId, text) {
    var newMessageNotification = document.createElement('div');
    newMessageNotification.classList.add('message-notification-content');
    newMessageNotification.setAttribute('onclick', 'hideMessageNotification(this)');
    setTimeout(() => {
        newMessageNotification.classList.add('message-notification-content-show');
    }, 10);

    messageSound.play();

    newMessageNotification.innerHTML = `
        <img class="message-notification-content-image" src="${userAvatarsNotification[notifyUserId]}"  alt="${notifyUserId}'s avatar">
        <div class="message-notification-content-info">
            <span class="message-notification-content-info-username">${userNamesNotification[notifyUserId]}</span>
            <span class="message-notification-content-info-message" data-id='${notifyUserId}'>${text}</span>
            <span class="message-notification-content-info-data">${notifyUserId}</span>
        </div>`;
    
    messageNotification.appendChild(newMessageNotification);

    setTimeout(() => {
        newMessageNotification.classList.remove('message-notification-content-show');
        setTimeout(() => {
        newMessageNotification.parentNode.removeChild(newMessageNotification);
        }, 150);
    }, 4000);
};


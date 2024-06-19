var sbLeft = document.querySelector('.mc-container-sidebar-container');
var sbRight = document.querySelector('.mc-container-second-sidebar-container');

var tool = document.getElementById('djDebugToolbarHandle');
tool.style.display = 'none';


var maincontainer = document.querySelector('.main-container')
var mccssc = document.querySelector('.mc-container-second-sidebar-container');
var mccsc = document.querySelector('.mc-container-sidebar-container');

maincontainer.style = 'margin: 10px auto;'
mccssc.style = 'width: 290px;height: 100%;'
mccsc.style = 'width: 290px; height: 100%;'


var chat = document.querySelector('.chat');
if (chat) {
    chat.style.height = '90vh';
}

function sbRemove() {
    sbLeft.style.transition = 'all 500ms linear';
    sbRight.style.transition = 'all 500ms linear';

    setTimeout(() => {
        sbLeft.style.opacity = '0';
        sbRight.style.opacity = '0';

        setTimeout(() => {
            sbLeft.style.display = 'none';
            sbRight.style.display = 'none';
            
            var mainContainer = document.querySelector('.main-container');
            mainContainer.style.width = 'fit-content';
        }, 700);
    }, 100);
};

function sbAdd() {
    sbLeft.style.transition = 'all 700ms linear';
    sbRight.style.transition = 'all 700ms linear';
    sbLeft.style.display = 'block';
    sbRight.style.display = 'block';

    var mainContainer = document.querySelector('.main-container');
    mainContainer.style.width = 'fit-content';

    setTimeout(() => {
        sbLeft.style.opacity = '1';
        sbRight.style.opacity = '1';
    }, 100);
};

function addBgButton(int) {
    var button = document.querySelectorAll('.mc-sb-c-links-a');
    button[int].style.backgroundColor = '#ffffff1a';
    setTimeout(() => {
        button[int].style.backgroundColor = '';
    }, 10000);
};

function allOpacity(time) {
    var body = document.querySelector('body');
    body.style.transition = `all ${time}ms linear`;
    body.style.opacity = '0';
    setTimeout(() => {
        body.style.opacity = '1';
    }, 2500)
};


function mobileStyle() {
    var mcfeedstoriescontainer = document.querySelector('.mc-feed-stories-container');
    var storiesstory = document.querySelectorAll('.stories-story');
    var mobilebuttons = document.querySelector('.mobile-buttons');
    var mccontainerfeedcontainer = document.querySelector('.mc-container-feed-container');

    mccontainerfeedcontainer.style.transition = 'all 400ms linear';

    mobilebuttons.style.transition = 'all 400ms linear';
    mobilebuttons.style.opacity = '0';
    mobilebuttons.style.display = 'flex';

    mcfeedstoriescontainer.style.transition = 'all 500ms linear';

    storiesstory.forEach((e) => {
        e.style.transition = 'all 500ms linear';
    });


    setTimeout(() => {
        mccontainerfeedcontainer.style = 'transition: all 400ms linear;'
        mobilebuttons.style.opacity = '1';
        mcfeedstoriescontainer.style = 'border: none; background: rgb(255 255 255 / 15%); height: 100px;';


        storiesstory.forEach((e) => {
            e.style = 'min-width: 90px; transition: all 500ms linear;';
        });
    }, 100);
}

function UnmobileStyle() {
    var mcfeedstoriescontainer = document.querySelector('.mc-feed-stories-container');
    var storiesstory = document.querySelectorAll('.stories-story');
    var mobilebuttons = document.querySelector('.mobile-buttons');
    var mccontainerfeedcontainer = document.querySelector('.mc-container-feed-container');

    mccontainerfeedcontainer.style.transition = 'all 400ms linear';

    mobilebuttons.style.transition = 'all 400ms linear';
    mobilebuttons.style.opacity = '0';
    mobilebuttons.style.display = 'flex';

    mcfeedstoriescontainer.style.transition = 'all 500ms linear';

    storiesstory.forEach((e) => {
        e.style.transition = 'all 500ms linear';
    });


    setTimeout(() => {
        mccontainerfeedcontainer.style.margin = '0px'
        mobilebuttons.style.opacity = '0';
        mcfeedstoriescontainer.style = 'transition: all 500ms linear; margin-top: 15px; gap: 5px; height: 110px; width: 100%; display: flex; border-radius: 35px; background: rgba(255, 255, 255, 0.041); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); border: 2px solid rgba(255, 255, 255, 0.18); overflow: hidden;';


        storiesstory.forEach((e) => {
            e.style = 'transition: all 500ms linear;';
        });
    }, 100);
}


function views() {
    var f = document.querySelector("body > main > div.count-viewers")

    var count = parseInt(f.textContent)

    for (let i = 0; i < 5000; i++) {
      setTimeout(() => {
        count += 1;
        f.innerHTML = `<img src="/static/main/svg/eye.svg" alt="svg-image" class="count-viewers-svg">  ${count}`;
      }, i * 10);
    }
}

function dsd() {
    allOpacity()
    document.querySelector("body > main > video.camera-video").play()

    setTimeout(() => {
        document.querySelector("body > main > div.camera-record-story.camera-record-story-show").click()
    }, 4700);
}

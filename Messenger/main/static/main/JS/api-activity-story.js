var dataLoading = true;
var offset_activity_stories = 9;


window.onscroll = function(ev) {
    if (((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) && dataLoading) {

        dataLoading = false;

        $.ajax({
            url: '/api/v1/story/',
            method: 'get',
            dataType: 'json',
            data: {offset: offset_activity_stories, get_type: 'activity'},
            success: function(data){
                dataActivityStories(data.stories)
            }
        });
        
    }
};


function dataActivityStories(stories) {
    if (stories.length == 0) {
        return;
    }

    dataLoading = true;
    offset_activity_stories += 9;
    var result = '';
    
    var selectionMenuContainer = document.querySelector('.selection-menu-container');

    stories.forEach((story) => {
        result += `<a href='/story/${story.author}/?story_id=${story.pk}&activity=True&redirect_to=/activity/stories' class="ccc-story-container">
                    <img class="ccc-story-icon-img" src="${svgStory}" alt="story-svg">
                    <div class="ccc-story-header">
                        <img class="ccc-story-header-img" src="${story.author_avatar}" alt="${story.author}'s image">
                        <span>${story.author_full_name}</span>
                    </div>
                    <video class="ccc-story-img" src="${story.video_content_url}" alt="shared-story" preload="auto"></video>
                </a>`;
    });

    selectionMenuContainer.innerHTML += result;
};

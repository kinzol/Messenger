var tags = [];

function appendTag(element) {
    if (element.value.includes(' ')) {
        return notification(3, 'Tag must not contain spaces')
    } else if (tags.includes(element.value.toLowerCase())) {
        return notification(3, 'You have already added such a tag')
    } else if (tags.length == 5) {
        return notification(3, 'Maximum number of tags 5')
    };

    var tagsContainer = document.querySelector('.post-tags');
    tagsContainer.innerHTML += `<div class="post-tags-tag" onclick="removeTag(this)">#${element.value.toLowerCase()}</div>`;

    tags.push(element.value.toLowerCase());
    element.value = '';
};

function removeTag(element) {
    var tagsContainer = document.querySelector('.post-tags');
    tagsContainer.removeChild(element)
    tags = tags.filter((tag) => tag !== element.innerHTML.replace('#', ''));
};

function checkTextarea() {
    var text = document.querySelector(".post-tags-textarea").value;
    var newLines = text.match(/\n/g) || [];
    var numberOfNewLines = newLines.length;
    
    if (numberOfNewLines > 5) {
        notification(3, 'String hyphens are exceeded! Limit: 5');
        return false;
    };
};

function textareaUndo() {
    var textarea = document.querySelector('.post-tags-textarea');

    textarea.focus();
    document.execCommand("undo");
}


function textareaRedo() {
    var textarea = document.querySelector('.post-tags-textarea');

    textarea.focus();
    document.execCommand("redo");
}



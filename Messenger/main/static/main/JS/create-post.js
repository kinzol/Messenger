var tags = [];
var files = [];

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
        notification(2, 'String hyphens are exceeded! Limit: 5');
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

// window.addEventListener('beforeunload', (e) => {
//     e.preventDefault()
//     console.log(e.returnValue, '<----- Value')
// });

function openChooseFile() {
    document.querySelector('.post-file-input').click();
};

function openFile() {
    var postFileInput = document.querySelector('.post-file-input');
    addNewFile(postFileInput.files[0]);
}

function addNewFile(file) {
    var postFile = document.querySelector('.post-file');
    var postFileAppend = document.querySelector('.post-file-append');
    var postFileTitle = document.querySelector('.post-file-title');
    var postFileAdd = document.querySelector('.post-file-add');

    if (files.length == 7) {
        return notification(2, "Maximum number of files 7")
    };

    var fileUrl = URL.createObjectURL(file)

    if (file.type.includes('image/')) {
        postFile.style.justifyContent = 'flex-start';
        postFileTitle.style.display = 'none';
        postFileAppend.style.display = 'none';
        postFileAdd.style.display = 'flex';
        postFile.innerHTML += `<img onclick="removeFile(this)" src="${fileUrl}" alt="image" class="post-file-file">`;
    
    } else if (file.type.includes('video/')) {
        postFile.style.justifyContent = 'flex-start';
        postFileTitle.style.display = 'none';
        postFileAppend.style.display = 'none';
        postFileAdd.style.display = 'flex';
        postFile.innerHTML += `<video class="post-file-file" muted autoplay loop onclick="removeFile(this)" src="${fileUrl}"></video>`;
    
    } else {
        return notification(3, 'An error occurred while saving the file');
    }; 

    files.push(fileUrl);
};

function removeFile(element) {
    var postFile = document.querySelector('.post-file');

    files = files.filter((file) => file !== element.src);
    postFile.removeChild(element);

    if (files.length == 0) {
        var postFileAppend = document.querySelector('.post-file-append');
        var postFileTitle = document.querySelector('.post-file-title');
        var postFileAdd = document.querySelector('.post-file-add');

        postFileAppend.style.display = 'flex';
        postFileTitle.style.display = 'flex';
        postFileAdd.style.display = 'none';
        postFile.style.justifyContent = 'center';
    };
};

function removeTag(element) {
    var tagsContainer = document.querySelector('.post-tags');
    tagsContainer.removeChild(element)
    tags = tags.filter((tag) => tag !== element.innerHTML.replace('#', ''));
};


const dropZone = document.body;
if (dropZone) {
    var postDrag = document.querySelector('.post-drag');
  
    dropZone.addEventListener("dragenter", function(e) {
        e.preventDefault();
    });
  
    dropZone.addEventListener("dragover", function(e) {
        e.preventDefault();
        postDrag.classList.add('post-drag-show');
    });
  
    dropZone.addEventListener("dragleave", function(e) {
        e.preventDefault();
        postDrag.classList.remove('post-drag-show');
    });

    dropZone.addEventListener("drop", function(e) {
        e.preventDefault();
        postDrag.classList.remove('post-drag-show');
    });
  
    // Это самое важное событие, событие, которое дает доступ к файлам
    postDrag.addEventListener("drop", function(e) {
        e.preventDefault();
        var fileContent = Array.from(e.dataTransfer.files);
        addNewFile(fileContent[0]);
    });
}
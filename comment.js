

export function toggleComments(button, wrapper) {

    wrapper.style.display = 'none';
    button.addEventListener("click",function(){
     if (wrapper.style.display === 'none') {
        wrapper.style.display = 'block';
        button.textContent = 'Hide comments';
    } else {
        wrapper.style.display = 'none';
        button.textContent = 'Show comments';
    }
})
   
}

export function initCommentForm(form, list, nameField, commentField) {

    form.addEventListener('submit', function(e) {
        e.preventDefault();

    var nameValue = nameField.value
    var commentValue = commentField.value

    list.appendChild(createCommentItem(nameValue, commentValue));

    nameField.value = '';
    commentField.value = '';
  });
}

function createCommentItem(name, comment) {
    
        var listItem = document.createElement('li');
        var namePara = document.createElement('p');
        var commentPara = document.createElement('p');

        namePara.textContent = name;
        commentPara.textContent = comment;

        listItem.appendChild(namePara);
        listItem.appendChild(commentPara);

    return listItem
}


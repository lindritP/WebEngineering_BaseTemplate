export function toggleComments(button: HTMLButtonElement, wrapper: HTMLElement) {

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

export function initCommentForm(form: HTMLFormElement, list: HTMLElement, nameField: HTMLInputElement, commentField: HTMLInputElement) {

    form.addEventListener('submit', function(e) {
        e.preventDefault();

    var nameValue = nameField.value
    var commentValue = commentField.value

    if (!nameValue || !commentValue) {
        alert('Please fill in both name and comment fields.');
        return;
    }else {
        list.appendChild(createCommentItem(nameValue, commentValue));
    }

    nameField.value = nameValue;
    commentField.value = '';
  });
}

function createCommentItem(name: string, comment: string) {

        var listItem = document.createElement('li');
        var namePara = document.createElement('p');
        var commentPara = document.createElement('p');

        namePara.textContent = name.trim()
        commentPara.textContent = comment.trim()

        listItem.appendChild(namePara);
        listItem.appendChild(commentPara);

    return listItem
}



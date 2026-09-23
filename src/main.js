import {highlightSearchTerms, clearSearchHighlights, buildRegex} from './search.js';
import {initCommentForm, toggleComments } from './comment.js';
import {fetchBearData} from './fetching.js';

let articleElement = document.querySelector('article');

function handleSearchSubmit(event) {
    event.preventDefault();

    clearSearchHighlights(articleElement);

    var searchKey = this.q.value.trim();
    if (!searchKey) return;

    var regex = buildRegex(searchKey);
    highlightSearchTerms(articleElement, regex);
}

document.querySelector('.search').addEventListener('submit', handleSearchSubmit);


var showHideBtn = document.querySelector('.show-hide');
var commentWrapper = document.querySelector('.comment-wrapper');

toggleComments(showHideBtn, commentWrapper);

var form = document.querySelector('.comment-form');
var nameField = document.querySelector('#name');
var commentField = document.querySelector('#comment');
var list = document.querySelector('.comment-container');

initCommentForm(form, list, nameField, commentField);

fetchBearData();
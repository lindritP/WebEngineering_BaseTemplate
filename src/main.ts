import {highlightSearchTerms, clearSearchHighlights, buildRegex} from './search.ts';
import {initCommentForm, toggleComments } from './comment.js';
import {fetchBearData} from './fetching.js';
import {getElement} from './helper.js';

let articleElement = getElement<HTMLElement>('article');

function handleSearchSubmit(event: Event) {
    event.preventDefault();

    clearSearchHighlights(articleElement);

    const searchInput = getElement<HTMLInputElement>('.search input[name="q"]');
    var searchKey = searchInput.value.trim();
    if (!searchKey) return;

    var regex = buildRegex(searchKey);
    highlightSearchTerms(articleElement, regex);
}


const searchForm = getElement<HTMLFormElement>('.search');

searchForm.addEventListener('submit', handleSearchSubmit);


const showHideBtn = getElement<HTMLButtonElement>('.show-hide');

const commentWrapper = getElement<HTMLDivElement>('.comment-wrapper');

toggleComments(showHideBtn, commentWrapper);

const form = getElement<HTMLFormElement>('.comment-form');
var nameField = getElement<HTMLInputElement>('#name');
var commentField = getElement<HTMLInputElement>('#comment');
var list = getElement<HTMLUListElement>('.comment-container');

initCommentForm(form, list, nameField, commentField);

fetchBearData();
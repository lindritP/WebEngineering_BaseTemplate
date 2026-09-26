import {
  highlightSearchTerms,
  clearSearchHighlights,
  buildRegex,
} from './search.ts';
import { initCommentForm, toggleComments } from './comment.js';
import { fetchBearData } from './api/fetching.js';
import { getElement } from './helper.js';

const articleElement = getElement('article', HTMLElement);

function handleSearchSubmit(event: Event): void {
  event.preventDefault();

  clearSearchHighlights(articleElement);

  const searchInput = getElement('.search input[name="q"]', HTMLInputElement);
  const searchKey = searchInput.value.trim();
  if (searchKey === '') return;

  const regex = buildRegex(searchKey);
  highlightSearchTerms(articleElement, regex);
}

const searchForm = getElement('.search', HTMLFormElement);

searchForm.addEventListener('submit', handleSearchSubmit);

const showHideBtn = getElement('.show-hide', HTMLDivElement);

const commentWrapper = getElement('.comment-wrapper', HTMLDivElement);

toggleComments(showHideBtn, commentWrapper);

const form = getElement('.comment-form', HTMLFormElement);
const nameField = getElement('#name', HTMLInputElement);
const commentField = getElement('#comment', HTMLInputElement);
const list = getElement('.comment-container', HTMLUListElement);

initCommentForm(form, list, nameField, commentField);

// Errors are handled inside fetchBearData, so the promise is ignored on purpose.
void fetchBearData();

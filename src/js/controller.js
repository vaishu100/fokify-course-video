import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeviews.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinnner();

    //0 UPDATE RESULT VIEW TO MARK THE SELECTED SEARCH RESULT
    resultsView.update(model.getSearchReasultsPage());

    //1. LOADING RECIPE
    await model.loadRecipe(id);

    //2. RENDERING RECIPE
    recipeView.render(model.state.recipe);

    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinnner();
    //1 GET SEARCH QUERY
    const query = searchView.getQuery();
    if (!query) return;

    //LOAD SEARCH RESULT
    await model.loadSearchResults(query);
    //RENDER RESULT

    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchReasultsPage());

    //RENDER INITIAL PAGINATION BUTTONS
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //RENDER RESULT
  resultsView.render(model.getSearchReasultsPage(goToPage));

  //RENDER INITIAL PAGINATION BUTTONS
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //UPDATE THE RECIPE SERVINGS(IN STATE)
  model.updateServings(newServings);

  //UPDATE THE VIEW
  recipeView.update(model.state.recipe);
};
const controlAddBookmark = function () {
  //ADD OR REMOVE A BOOKMARK
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //UPDATE RECIPE VIEW
  recipeView.update(model.state.recipe);

  //RENDER BOOKMARKS
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    //SHOW LOADING SPINNER
    addRecipeView.renderSpinnner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    //RENDER RECIPE
    recipeView.render(model.state.recipe);

    //SUCCESS MESSAGE
    addRecipeView.renderMessage();

    //RENDER BOOKMARK VIEW
    bookmarksView.render(model.state.bookmarks);

    //CHANGE ID IN THE URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //CLOSE THE FORM WINDOW
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log('Welcome to the application');
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHnadlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};

init();
// window.addEventListener('hashchange', showRecipe);
// window.addEventListener('load', showRecipe);

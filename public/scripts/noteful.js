/* global $ store api*/
'use strict';

const noteful = (function () {

  function render() {
    console.log('`render` ran.');
    const notesList = generateNotesList(store.notes, store.currentNote);
    $('.js-notes-list').html(notesList);

    const editForm = $('.js-note-edit-form');
    editForm.find('.js-note-title-entry').val(store.currentNote.title);
    editForm.find('.js-note-content-entry').val(store.currentNote.content);
  }

  /**
   * GENERATE HTML FUNCTIONS
   */
  function generateNotesList(list, currentNote) {
    const listItems = list.map(item => `
    <li data-id="${item.id}" class="js-note-element ${currentNote.id === item.id ? 'active' : ''}">
      <a href="#" class="name js-note-show-link">${item.title}</a>
      <button class="removeBtn js-note-delete-button">X</button>
    </li>`);
    return listItems.join('');
  }

  /**
   * HELPERS
   */
  function getNoteIdFromElement(item) {
    const id = $(item).closest('.js-note-element').data('id');
    return id;
  }

  /**
   * EVENT LISTENERS AND HANDLERS
   */
  function handleNoteItemClick() {
    $('.js-notes-list').on('click', '.js-note-show-link', event => {
      event.preventDefault();

      const noteId = getNoteIdFromElement(event.currentTarget);
      api.details(noteId).then(response => {
        store.currentNote = response;
        render();
      });
    });
  }

  function handleNoteSearchSubmit() {
    $('.js-notes-search-form').on('submit', event => {
      event.preventDefault();

      const searchTerm = $('.js-note-search-entry').val();
      store.currentSearchTerm =  searchTerm ? { searchTerm } : {};

      api.search(store.currentSearchTerm).then(response => {
        store.notes = response;
        render();
      });
    });
  }

  function handleNoteFormSubmit() {
    $('.js-note-edit-form').on('submit', function (event) {
      event.preventDefault();

      const editForm = $(event.currentTarget);

      const noteObj = {
        id: store.currentNote.id,
        title: editForm.find('.js-note-title-entry').val(),
        content: editForm.find('.js-note-content-entry').val()
      };

      if (store.currentNote.id) {

        api.update(store.currentNote.id, noteObj)
          .then(updateResponse => {
            updateNote(updateResponse);
            return api.search(store.currentSearchTerm);
          })
          .then(updateNotesList);

      } else {

        api.create(noteObj)
          .then(updateResponse => {
            updateNote(updateResponse);
            return api.search(store.currentSearchTerm);
          })
          .then(updateNotesList);
      }

    });

  }

  // UpdateNote and UpdateNotes List for .thenables

  function updateNote (updateResponse) {
    store.currentNote = updateResponse;
  }

  function updateNotesList (response) {
    store.notes = response;
    render();
  }

  function handleDeleteNote () {
    $('.js-notes-list').on('click', '.js-note-delete-button', event => {
      event.preventDefault();

      console.log('`deleteNote` was clicked!');
      const noteId = getNoteIdFromElement(event.currentTarget);
      console.log(noteId);

      api.delete(noteId)
        .then(() => {
          return api.search(store.currentSearchTerm);
        })
        .then(
          (updateResponse) => {
            store.notes = updateResponse;
            if (noteId === store.currentNote.id) {
              store.currentNote = false;
            }
            render();
          });
    });
  }

  function handleNoteStartNewSubmit() {
    $('.js-start-new-note-form').on('submit', event => {
      event.preventDefault();
      store.currentNote = false;
      render();
    });
  }

  function bindEventListeners() {
    handleNoteItemClick();
    handleNoteSearchSubmit();
    handleNoteFormSubmit();
    handleNoteStartNewSubmit();
    handleDeleteNote();
  }

  // This object contains the only exposed methods from this module:
  return {
    render: render,
    bindEventListeners: bindEventListeners,
  };

}());

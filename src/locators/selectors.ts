export const Selectors = {
  // Global layout
  NAV: {
    LOGO:         '',
    USER_MENU:    '',
    NOTIFICATIONS:  '',
  },

  // Edit & Review
  EDIT_REVIEW: {
    CONFIG_SETTINGS_BUTTON: '#settings-btn',
    AVATAR_QUILL: '.app-avatar-container app-avatar',
    BOOK_SELECT: '#book-select',
    BOOK_LIST_BOX: '.mat-mdc-select-panel mat-option',

    CHAPTER_SELECT: '#chapter-select',
    CHAPTER_LIST_BOX: 'mat-option',
    CHAPTER_LIST_BOX_TEXT: 'span.mdc-list-item__primary-text',
    VERSE_SELECT: '#target-text-area usx-para-contents usx-segment',
    // VERSE_EDITABLE: '#target-text-area usx-para-contents usx-segment',
    VERSE_NOT_EDITABLE: '#target-text-area div.ql-editor',
  },

  // Synchronization page
  SYNCHRONIZATION: {
    CANCEL_BUTTON: 'btn-cancel-sync',
    CANCEL_MESSAGE: 'sync-failure-support-message',
    SNACK_BAR_MESSAGE: 'simple-snack-bar',
  },

  OFFLINE_DOM: {
    SYNC_OFFLINE_MESSAGE: 'offline-text',
    SETTINGS_OFFLINE_MESSAGE: 'offline-text',
  },

  // My Projects page
  MY_PROJECTS: {
    UNCONNECTED_PROJECT: 'div.user-unconnected-project',
    CONNECT_SUBMIT_BUTTON: '#connect-submit-button',
    CONNECT_PROGRESS: 'mat-progress-bar.progress-bar',
  },
  SETTINGS: {
    DANGER_ZONE: 'app-settings h2',
    DELETE_THIS_PROJECT_BUTTON: 'delete-btn',
    DELETE_DIALOG: 'mat-dialog-container',
  },

  // Manage Questions page
  MANAGE_QUESTIONS: {
    CHOOSE_BOOK_HEADER: '#bookPane h1',
    CHOOSE_CHAPTER_HEADER: '#chapterPane h1',
    CHOOSE_VERSE_HEADER: '#versePane h1',
    START_REFERENCE: 'scripture-start',
    START_REFERENCE_DOWN_ARROW: '.mat-mdc-form-field-icon-suffix button',
    END_REFERENCE: 'scripture-end',
    END_REFERENCE_DOWN_ARROW: '.mat-mdc-form-field-icon-suffix button',

    CHOOSE_END_VERSE_HEADER: '#rangeEndPane div',

    QUESTION_TEXTAREA: 'textarea',
    QUESTION_SAVE_ANSWER_BUTTON: 'question-save-btn',

    QUESTION_BOOK_ROW: '#text-with-questions-list .mat-expansion-indicator svg',
    QUESTION_CHAPTER_ROW: '#text-with-questions-list .mat-expansion-panel-content-wrapper .mat-expansion-indicator svg',
    QUESTION_CONTENT_ROW: '#text-with-questions-list span.overflow-ellipsis',
  },

  // Questions and Answers page
  QUESTIONS_AND_ANSWERS: {
    QUESTION_SELECT_WITH_TEXT: '#questions-panel div.question-text',
    QUESTION_HIGHLIGHT: 'usx-segment.question-segment.highlight-segment',
    
  },

  // Banner messages
  BANNER: {
    NO_CHAPTER_PERMISSION_MESSAGE: '#target-text-area .notice-content',
  }


} as const;
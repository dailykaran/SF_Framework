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
    VERSE_SELECT: 'usx-para-contents usx-segment',
  },

  // Synchronization page
  SYNCHRONIZATION: {
    CANCEL_BUTTON: 'btn-cancel-sync',
    CANCEL_MESSAGE: 'sync-failure-support-message',
    SNACK_BAR_MESSAGE: 'simple-snack-bar',
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
  }

} as const;
export const Asserts = {
  // Global layout
  NAV: {
    LOGO:         '',
    AVATAR_MENU:    '',
    NOTIFICATIONS:  '',
  },

  // Edit & Review
  EDIT_REVIEW: {
    NAVIGATION_URL: 'translate',
  },

 // Snack Bar
  SNACK_BAR: {
    SYNC_SUCCESS_MESSAGE: 'Successfully synchronized',
  },

  // synchronization
  SYNCHRONIZATION: {
    SYNC_ERROR_MESSAGE: 'Something went wrong the last time Scripture Forge',
    SYNC_OFFLINE_MESSAGE: 'Please connect to the internet to synchronize this project',
  },

  // Settings
  SETTINGS: {
    OFFLINE_MESSAGE: 'Project settings cannot be changed while offline. Please connect to the internet to make changes.',
    URL: 'settings',
  },

  // Checking page
  CHECKING: {
    NAVIGATION_URL: 'checking',
    CHAPTER: 'scope=chapter', 
  },

  //
  QUESTIONS_AND_ANSWERS: {
    QUESTION_ICON_COLOR: 'rgb(255, 247, 255)',
    QUESTION_HIGHLIGHT_COLOR_ATTRIBUTE: 'data-segment',
    CHAPTER1_VERSE_ONE: 'verse_1_1',
    CHAPTER2_VERSE_ONE: 'verse_2_1',
    QUESTION_COUNT: 'data-question-count',
  },
  // Overview page
  OVERVIEW: {

  },

  // Banner messages
  BANNER: {
    NO_CHAPTER_PERMISSION_MESSAGE: " You don't have permission to edit this chapter, even though you have the Administrator role. Permissions can only be changed in Paratext. ",
  },

} as const;
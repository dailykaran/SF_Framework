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
  // Overview page
  OVERVIEW: {

  }
} as const;
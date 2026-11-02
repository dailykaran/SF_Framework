export const Inputs = {

  // Projects name
  PROJECT_NAME: {
    F03: '- 03F',
    TNN01: '- TransDaugtherProject',
    DSS: '- TransDaugtherProject'
  },

  // Global layout
  NAV: {
    MY_PROJECTS: 'projects',
    CONNECT_PROJECT: 'connect-project',
    AVATAR_MENU:    '',
    NOTIFICATIONS:  '',
  },

  // Edit & Review
  EDIT_REVIEW: {
    NAVIGATION_URL: 'translate',
  },

  //books
  BOOKS: {
    LUKE: 'Luke',
    MARK: 'Mark',
    GENESIS: 'Genesis',
    MATTHEW: 'Matthew',
  },
  
  // Synchronization page
  SYNC_WITH_PARATEXT: {
    NAVIGATION_URL: 'sync',
  },

// Offline message
  OFFLINE: {
    MESSAGE_APPEAR: 'appears when offline',
    MESSAGE_DISAPPEAR: 'disappears when online',
  },

  // Questions & Answers page
  QUESTIONS_ANSWERS: {
    NAVIGATION_URL: 'checking',
  },
  // Settings page
  SETTINGS: {
    NAVIGATION_URL: 'settings',
    PAGE: 'Settings',

  },
  BUTTONS: {
    CONNECT: 'Connect',
    JOIN: 'Join',
    DELETE_PROJECT: 'Delete this project',
    DELETE_DIALOG_BUTTON: 'I understand the consequences, delete this project',

  },
  LINK:{
    EDIT_REVIEW: 'Edit & review',
  },
  LABELS: {
    PROJECT_NAME: 'Project Name',
  },

  SHARE_DIALOG: {
    INVITATION_ROLE: {
      CommunityChecker: 'Community Checker',
      Commenter: 'Commenter',
      Viewer: 'Viewer',
    },
    LINK_TYPE: {
      AnyoneWithTheLink: 'Anyone with the link',
       OneRecipient : ' One recipient '
    },
    LINK_EXPIRES: {
      FourteenDays: '14 days',
      SevenDays: '7 days',
      ThirtyDays: '30 days',
      NinetyDays: '90 days',
      OneYear: '1 year'
    },
    LINK_LOCALIZATION: {
      EnglishUS: 'English (US)',
      EnglishUK: ' English (UK)',
      Spanish: 'Español',
    },
  }

} as const;
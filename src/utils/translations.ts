export type Language = 'no' | 'en';

export const translations = {
  no: {
    // App header
    appTitle: 'Mini-Portfolio',
    appSubtitle: 'Del dine kreative prosjekter og samarbeid med andre',
    
    // Navigation & buttons
    searchUsers: 'Søk Brukere',
    newIdea: 'Nytt Prosjekt',
    logout: 'Logg ut',
    loginRegister: 'Logg inn / Registrer deg',
    
    // Tabs
    myIdeas: 'Mine Prosjekter',
    discover: 'Discover',
    following: 'Følger',
    
    // Discover
    discoverDescription: 'Utforsk delte prosjekter fra fellesskapet',
    followingDescription: 'Brukere du følger',
    
    // Dialog titles
    editIdea: 'Rediger Prosjekt',
    newIdeaTitle: 'Nytt Prosjekt',
    findFollowUsers: 'Finn og Følg Brukere',
    ideaDetails: 'Prosjekt Detaljer',
    
    // Loading
    loading: 'Laster...',
    
    // Login prompt
    loginPrompt: 'Du må logge inn for å opprette egne prosjekter. Vil du logge inn eller registrere deg nå?',
    continueAsGuest: 'Fortsett som gjest',
    
    // Auth form
    login: 'Logg inn',
    signup: 'Registrer deg',
    forgotPassword: 'Glemt passord',
    email: 'E-post',
    password: 'Passord',
    name: 'Navn',
    rememberMe: 'Husk meg',
    backToLogin: 'Tilbake til innlogging',
    sendResetLink: 'Send tilbakestillingslenke',
    resetEmailSent: 'Tilbakestillingslenke sendt til din e-post',
    createAccount: 'Opprett konto',
    alreadyHaveAccount: 'Har du allerede en konto?',
    dontHaveAccount: 'Har du ikke en konto?',
    signupHere: 'Registrer deg her',
    
    // Form fields
    title: 'Tittel',
    titlePlaceholder: 'f.eks. E-handelsplattform',
    description: 'Beskrivelse',
    descriptionPlaceholder: 'Kort sammendrag av prosjektet...',
    details: 'Detaljer',
    detailsPlaceholder: 'Utdypende forklaring, tekniske detaljer, hva du lærte...',
    tags: 'Tags',
    tagsPlaceholder: 'Skriv en tag og trykk Enter',
    images: 'Bilder',
    addImageUrl: 'Legg til bilde-URL',
    imagePlaceholder: 'Lim inn bilde-URL og trykk Enter',
    priority: 'Prioritet',
    low: 'Lav',
    medium: 'Middels',
    high: 'Høy',
    status: 'Status',
    idea: 'Idé',
    inProgress: 'Under arbeid',
    completed: 'Fullført',
    archived: 'Arkivert',
    websiteUrl: 'Nettside URL',
    websiteUrlPlaceholder: 'https://eksempel.no',
    shareIdea: 'Del prosjekt offentlig',
    shareDescription: 'Andre brukere kan se dette prosjektet i Discover',
    collaborators: 'Samarbeidspartnere',
    collaboratorsDescription: 'Inviter andre brukere til å samarbeide om dette prosjektet',
    searchCollaborators: 'Søk etter brukere...',
    add: 'Legg til',
    remove: 'Fjern',
    
    // Buttons
    cancel: 'Avbryt',
    save: 'Lagre',
    edit: 'Rediger',
    delete: 'Slett',
    view: 'Vis',
    close: 'Lukk',
    
    // Empty states
    emptyMyIdeas: 'Du har ingen prosjekter ennå',
    emptyMyIdeasDescription: 'Klikk på \"Nytt Prosjekt\" for å komme i gang',
    emptyDiscover: 'Ingen delte prosjekter tilgjengelig ennå',
    emptyDiscoverDescription: 'Vær den første til å dele et prosjekt!',
    emptyFollowing: 'Du følger ikke noen ennå',
    emptyFollowingDescription: 'Søk etter brukere og følg dem for å se dem her',
    
    // User search
    searchUserPlaceholder: 'Søk etter brukere...',
    follow: 'Følg',
    unfollow: 'Slutt å følge',
    noUsersFound: 'Ingen brukere funnet',
    searchForUsers: 'Søk etter brukere for å finne og følge dem',
    
    // Idea detail
    owner: 'Eier',
    sharedPublicly: 'Delt offentlig',
    private: 'Privat',
    created: 'Opprettet',
    updated: 'Oppdatert',
    website: 'Nettside',
    visitWebsite: 'Besøk nettside',
    
    // Bug tracker
    bugTracker: 'Bug Tracker',
    reportBug: 'Rapporter Bug',
    bugTitle: 'Bug Tittel',
    bugDescription: 'Beskrivelse',
    bugTitlePlaceholder: 'Kort beskrivelse av problemet',
    bugDescriptionPlaceholder: 'Detaljert beskrivelse av bug-en, steg for å reprodusere, etc.',
    severity: 'Alvorlighetsgrad',
    critical: 'Kritisk',
    major: 'Stor',
    minor: 'Liten',
    submitBug: 'Send inn Bug',
    allBugs: 'Alle Bugs',
    myBugs: 'Mine Bugs',
    emptyBugs: 'Ingen bugs rapportert ennå',
    emptyBugsDescription: 'Klikk på \"Rapporter Bug\" for å rapportere et problem',
    emptyMyBugs: 'Du har ikke rapportert noen bugs ennå',
    viewDetails: 'Vis Detaljer',
    bugDetails: 'Bug Detaljer',
    reportedBy: 'Rapportert av',
    comments: 'Kommentarer',
    addComment: 'Legg til kommentar',
    writeComment: 'Skriv en kommentar...',
    postComment: 'Send kommentar',
    open: 'Åpen',
    resolved: 'Løst',
    closed: 'Lukket',
    markAsResolved: 'Merk som løst',
    markAsOpen: 'Merk som åpen',
    markAsClosed: 'Merk som lukket',
    
    // Welcome screen
    welcomeTitle: 'Velkommen til Mini-Portfolio! 🎨',
    welcomeDescription: 'La oss hjelpe deg i gang',
    createFirstIdea: 'Opprett ditt første prosjekt',
    createFirstIdeaDescription: 'Lagre og organiser dine kreative prosjekter',
    shareWithCommunity: 'Del med fellesskapet',
    shareWithCommunityDescription: 'Marker prosjekter som offentlige for å dele dem',
    followOthers: 'Følg andre',
    followOthersDescription: 'Finn inspirerende kreatører og se deres arbeid',
    collaborate: 'Samarbeid',
    collaborateDescription: 'Inviter andre til å jobbe på prosjekter sammen',
    getStarted: 'Kom i gang',
    
    // User profile
    userProfile: 'Brukerprofil',
    publicIdeas: 'Offentlige Prosjekter',
    noPublicIdeas: 'Ingen offentlige prosjekter ennå',
    noPublicIdeasDescription: 'Denne brukeren har ikke delt noen prosjekter ennå',
    backToSearch: 'Tilbake til søk',
    bio: 'Om meg',
    bioPlaceholder: 'Skriv litt om deg selv, din bakgrunn, og hva du liker å jobbe med...',
    editProfile: 'Rediger profil',
    saveProfile: 'Lagre profil',
    viewProfile: 'Vis profil',
    
    // Search & filters
    searchIdeas: 'Søk prosjekter, tags...',
    allStatus: 'Alle Statuser',
    allPriority: 'Alle Prioriteter',
    noMatchingIdeas: 'Ingen prosjekter matcher dine filtre',
    typeToSearch: 'Skriv minst 2 tegn for å søke',
    searching: 'Søker...',
    shared: 'Delt',
    
    // Alert dialogs
    deleteIdea: 'Slette dette prosjektet?',
    deleteIdeaDescription: 'Denne handlingen kan ikke angres. Dette vil permanent slette',
    deleteBug: 'Slette denne bug-rapporten?',
    deleteBugDescription: 'Denne handlingen kan ikke angres.',
  },
  en: {
    // App header
    appTitle: 'Mini-Portfolio',
    appSubtitle: 'Share your creative projects and collaborate with others',
    
    // Navigation & buttons
    searchUsers: 'Search Users',
    newIdea: 'New Project',
    logout: 'Log out',
    loginRegister: 'Log in / Sign up',
    
    // Tabs
    myIdeas: 'My Projects',
    discover: 'Discover',
    following: 'Following',
    
    // Discover
    discoverDescription: 'Explore shared projects from the community',
    followingDescription: 'Users you follow',
    
    // Dialog titles
    editIdea: 'Edit Project',
    newIdeaTitle: 'New Project',
    findFollowUsers: 'Find and Follow Users',
    ideaDetails: 'Project Details',
    
    // Loading
    loading: 'Loading...',
    
    // Login prompt
    loginPrompt: 'You must log in to create your own projects. Would you like to log in or sign up now?',
    continueAsGuest: 'Continue as guest',
    
    // Auth form
    login: 'Log in',
    signup: 'Sign up',
    forgotPassword: 'Forgot password',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    rememberMe: 'Remember me',
    backToLogin: 'Back to login',
    sendResetLink: 'Send reset link',
    resetEmailSent: 'Reset link sent to your email',
    createAccount: 'Create account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signupHere: 'Sign up here',
    
    // Form fields
    title: 'Title',
    titlePlaceholder: 'e.g. E-commerce Platform',
    description: 'Description',
    descriptionPlaceholder: 'Brief summary of the project...',
    details: 'Details',
    detailsPlaceholder: 'Detailed explanation, technical details, what you learned...',
    tags: 'Tags',
    tagsPlaceholder: 'Type a tag and press Enter',
    images: 'Images',
    addImageUrl: 'Add image URL',
    imagePlaceholder: 'Paste image URL and press Enter',
    priority: 'Priority',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    status: 'Status',
    idea: 'Idea',
    inProgress: 'In Progress',
    completed: 'Completed',
    archived: 'Archived',
    websiteUrl: 'Website URL',
    websiteUrlPlaceholder: 'https://example.com',
    shareIdea: 'Share project publicly',
    shareDescription: 'Other users can see this project in Discover',
    collaborators: 'Collaborators',
    collaboratorsDescription: 'Invite other users to collaborate on this project',
    searchCollaborators: 'Search for users...',
    add: 'Add',
    remove: 'Remove',
    
    // Buttons
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    close: 'Close',
    
    // Empty states
    emptyMyIdeas: "You don't have any projects yet",
    emptyMyIdeasDescription: 'Click "New Project" to get started',
    emptyDiscover: 'No shared projects available yet',
    emptyDiscoverDescription: 'Be the first to share a project!',
    emptyFollowing: "You're not seeing any projects from people you follow yet",
    emptyFollowingDescription: 'Search for users and follow them to see them here',
    
    // User search
    searchUserPlaceholder: 'Search for users...',
    follow: 'Follow',
    unfollow: 'Unfollow',
    noUsersFound: 'No users found',
    searchForUsers: 'Search for users to find and follow them',
    
    // Idea detail
    owner: 'Owner',
    sharedPublicly: 'Shared publicly',
    private: 'Private',
    created: 'Created',
    updated: 'Updated',
    website: 'Website',
    visitWebsite: 'Visit website',
    
    // Bug tracker
    bugTracker: 'Bug Tracker',
    reportBug: 'Report Bug',
    bugTitle: 'Bug Title',
    bugDescription: 'Description',
    bugTitlePlaceholder: 'Brief description of the issue',
    bugDescriptionPlaceholder: 'Detailed description of the bug, steps to reproduce, etc.',
    severity: 'Severity',
    critical: 'Critical',
    major: 'Major',
    minor: 'Minor',
    submitBug: 'Submit Bug',
    allBugs: 'All Bugs',
    myBugs: 'My Bugs',
    emptyBugs: 'No bugs reported yet',
    emptyBugsDescription: 'Click "Report Bug" to report an issue',
    emptyMyBugs: "You haven't reported any bugs yet",
    viewDetails: 'View Details',
    bugDetails: 'Bug Details',
    reportedBy: 'Reported by',
    comments: 'Comments',
    addComment: 'Add comment',
    writeComment: 'Write a comment...',
    postComment: 'Post comment',
    open: 'Open',
    resolved: 'Resolved',
    closed: 'Closed',
    markAsResolved: 'Mark as resolved',
    markAsOpen: 'Mark as open',
    markAsClosed: 'Mark as closed',
    
    // Welcome screen
    welcomeTitle: 'Welcome to Mini-Portfolio! 🎨',
    welcomeDescription: "Let's get you started",
    createFirstIdea: 'Create your first project',
    createFirstIdeaDescription: 'Save and organize your creative projects',
    shareWithCommunity: 'Share with the community',
    shareWithCommunityDescription: 'Mark projects as public to share them',
    followOthers: 'Follow others',
    followOthersDescription: 'Find inspiring creators and see their work',
    collaborate: 'Collaborate',
    collaborateDescription: 'Invite others to work on projects together',
    getStarted: 'Get started',
    
    // User profile
    userProfile: 'User Profile',
    publicIdeas: 'Public Projects',
    noPublicIdeas: 'No public projects yet',
    noPublicIdeasDescription: 'This user hasn\'t shared any projects yet',
    backToSearch: 'Back to search',
    bio: 'About me',
    bioPlaceholder: 'Write a bit about yourself, your background, and what you like to work on...',
    editProfile: 'Edit profile',
    saveProfile: 'Save profile',
    viewProfile: 'View profile',
    
    // Search & filters
    searchIdeas: 'Search projects, tags...',
    allStatus: 'All Status',
    allPriority: 'All Priority',
    noMatchingIdeas: 'No projects match your filters',
    typeToSearch: 'Type at least 2 characters to search',
    searching: 'Searching...',
    shared: 'Shared',
    
    // Alert dialogs
    deleteIdea: 'Delete this project?',
    deleteIdeaDescription: 'This action cannot be undone. This will permanently delete',
    deleteBug: 'Delete this bug report?',
    deleteBugDescription: 'This action cannot be undone.',
  },
};

export type TranslationKey = keyof typeof translations.no;

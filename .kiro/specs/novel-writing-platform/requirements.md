# Requirements Document

## Introduction

The Novel Writing Platform is a comprehensive web application designed for authors to write, organize, and manage their novels and stories. The platform provides tools for book management, character building, location/world-building, plot outlining, and writing progress tracking. The application adopts the Treto design theme (Jost font, accent color #fa4729, clean modern layout with dotted background patterns, bordered frames, uppercase headings) and is built with PHP/Laravel backend, MySQL database, and vanilla JavaScript frontend.

## Glossary

- **Platform**: The Novel Writing Platform web application
- **Author**: A registered user of the Platform who creates and manages books
- **Book**: A novel or story project created by an Author, containing chapters, characters, locations, and plot elements
- **Chapter**: A discrete section of a Book containing written prose content
- **Character_Profile**: A detailed record describing a fictional character within a Book, including name, description, traits, relationships, and visual reference
- **Location_Profile**: A detailed record describing a fictional place or setting within a Book, including name, description, geography, and atmosphere
- **Plot_Outline**: A structured representation of a Book's storyline, consisting of ordered plot points and story arcs
- **Plot_Point**: A single event or milestone within a Plot_Outline, containing a title, description, and position in the narrative sequence
- **Writing_Target**: A goal set by an Author specifying a word count to achieve within a defined time period (daily or weekly)
- **Writing_Session**: A recorded period during which an Author actively writes, capturing start time, end time, and words written
- **Writing_Streak**: A consecutive series of days on which an Author met their daily Writing_Target
- **Cover_Image**: An uploaded image file associated with a Book, used as the book's visual cover
- **Editor**: The rich text writing interface where Authors compose Chapter content
- **World_Element**: A custom world-building entry within a Book, categorized by type (magic system, culture, history, technology, religion, etc.)
- **Authentication_System**: The module responsible for user registration, login, logout, and session management
- **Dashboard**: The main landing page after login, displaying an overview of the Author's books and writing statistics

## Requirements

### Requirement 1: User Registration

**User Story:** As a visitor, I want to create an account on the Platform, so that I can access the novel writing tools and save my work.

#### Acceptance Criteria

1. WHEN a visitor submits a registration form with a name between 1 and 100 characters, a valid email address format, and a password between 8 and 128 characters, THE Authentication_System SHALL create a new Author account and redirect to the Dashboard within 3 seconds
2. WHEN a visitor submits a registration form with an email address already associated with an existing account, THE Authentication_System SHALL display an error message indicating the email is already in use without revealing account details of the existing user
3. IF a visitor submits a registration form with a password shorter than 8 characters or longer than 128 characters, THEN THE Authentication_System SHALL display a validation error indicating the accepted password length range
4. IF a visitor submits a registration form with an empty name, a name exceeding 100 characters, or an invalid email address format, THEN THE Authentication_System SHALL display a validation error identifying each invalid field
5. THE Authentication_System SHALL hash all passwords using bcrypt before storing them in the database
6. WHEN a new Author account is created, THE Authentication_System SHALL send a verification email to the registered email address within 60 seconds of account creation

### Requirement 2: User Login and Session Management

**User Story:** As a registered Author, I want to log in to my account, so that I can access my books and writing tools.

#### Acceptance Criteria

1. WHEN an Author submits valid credentials (email and password), THE Authentication_System SHALL create an authenticated session and redirect to the Dashboard within 3 seconds
2. WHEN an Author submits invalid credentials, THE Authentication_System SHALL display an error message indicating that the email or password is incorrect without revealing which specific field failed validation
3. WHEN an authenticated Author clicks the logout button, THE Authentication_System SHALL destroy the session, invalidate the session token, and redirect to the login page
4. WHILE an Author is not authenticated, THE Platform SHALL redirect all routes except the login page, registration page, and password reset pages to the login page
5. IF an Author session has received no user-initiated requests (page navigation, form submission, or content save) for more than 120 minutes, THEN THE Authentication_System SHALL expire the session and redirect the Author to the login page with a message indicating the session has expired
6. IF an Author submits invalid credentials 5 consecutive times for the same email address, THEN THE Authentication_System SHALL lock login attempts for that email for 15 minutes and display a message indicating the account is temporarily locked
7. IF a session expires while the Author has unsaved content in the Editor, THEN THE Platform SHALL preserve the unsaved content in local browser storage and restore it upon re-authentication

### Requirement 3: Password Recovery

**User Story:** As an Author who has forgotten their password, I want to reset it via email, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN an Author requests a password reset with a registered email address, THE Authentication_System SHALL send a password reset link valid for 60 minutes and display a confirmation message indicating that if the email is associated with an account, a reset link has been sent
2. WHEN an Author submits a new password (minimum 8 characters) via a valid reset link, THE Authentication_System SHALL update the password, invalidate the reset token, terminate all existing sessions for that Author, and redirect to the login page
3. IF an Author attempts to use an expired or already-used reset token, THEN THE Authentication_System SHALL display an error message indicating the link is no longer valid and prompt the Author to request a new reset
4. IF an Author requests a password reset with an email address not associated with any account, THEN THE Authentication_System SHALL display the same confirmation message as for a registered email without sending any email
5. IF an Author submits more than 5 password reset requests within a 15-minute period, THEN THE Authentication_System SHALL reject further requests and display a message indicating the Author must wait before trying again

### Requirement 4: Book Management

**User Story:** As an Author, I want to create and manage multiple books, so that I can organize my writing projects separately.

#### Acceptance Criteria

1. WHEN an Author submits a new book form with a title between 1 and 200 characters, THE Platform SHALL create a new Book associated with that Author with a status of "Draft" and display it on the Dashboard
2. THE Platform SHALL display all Books belonging to the authenticated Author on the Dashboard, ordered by last modified date (most recent first)
3. WHEN an Author edits a Book's metadata (title, genre, synopsis, status), THE Platform SHALL validate that the title is between 1 and 200 characters and the synopsis does not exceed 2000 characters, save the changes, and display a confirmation message
4. WHEN an Author deletes a Book, THE Platform SHALL prompt for confirmation before permanently removing the Book and all associated data (chapters, characters, locations, plot points, world elements)
5. THE Platform SHALL support the following Book status values: Draft, In Progress, Completed, and Archived
6. WHEN an Author creates a Book, THE Platform SHALL initialize the Book with default empty structures for chapters, characters, locations, and plot outline
7. IF an Author submits a new book form with a blank title or a title exceeding 200 characters, THEN THE Platform SHALL display a validation error indicating the title must be between 1 and 200 characters and SHALL NOT create the Book

### Requirement 5: Book Cover Management

**User Story:** As an Author, I want to upload and manage cover images for my books, so that I can visually identify and personalize my projects.

#### Acceptance Criteria

1. WHEN an Author uploads an image file (JPEG, PNG, or WebP) as a Cover_Image, THE Platform SHALL validate the file type by MIME type, verify the image has minimum dimensions of 600x900 pixels, store the image associated with the Book, and if a Cover_Image already exists for that Book, replace it and delete the previous file
2. IF an Author uploads a file that is not JPEG, PNG, or WebP format, THEN THE Platform SHALL reject the upload and display an error message specifying accepted formats
3. IF an Author uploads a file exceeding 5 MB in size or with dimensions below 600x900 pixels, THEN THE Platform SHALL reject the upload and display an error message indicating the specific validation failure (size limit or minimum dimensions)
4. WHEN a Cover_Image is uploaded, THE Platform SHALL generate a thumbnail version by scaling and center-cropping the image to exactly 300x450 pixels for display on the Dashboard
5. WHEN an Author removes a Cover_Image, THE Platform SHALL delete the stored file and the associated thumbnail, and display a default placeholder cover on the Book's Dashboard card and detail page
6. THE Platform SHALL display the Cover_Image on the Book's Dashboard card and detail page, or display a default placeholder cover if no Cover_Image has been uploaded
7. IF a Cover_Image upload fails due to a server or storage error, THEN THE Platform SHALL retain any previously existing Cover_Image unchanged and display an error message indicating the upload could not be completed

### Requirement 6: Chapter Management

**User Story:** As an Author, I want to create, organize, and manage chapters within my book, so that I can structure my novel into logical sections.

#### Acceptance Criteria

1. WHEN an Author creates a new Chapter within a Book, THE Platform SHALL assign it the next sequential order number, assign a default title of "Chapter [N]" where N is the order number, and open the Editor
2. WHEN an Author reorders Chapters via drag-and-drop, THE Platform SHALL update all affected Chapter order numbers to maintain a contiguous sequence starting from 1 and persist the new sequence
3. WHEN an Author renames a Chapter with a title between 1 and 200 characters, THE Platform SHALL save the new title and display it in the chapter list
4. IF an Author attempts to rename a Chapter with an empty title or a title exceeding 200 characters, THEN THE Platform SHALL reject the change and display a validation error indicating the allowed length
5. WHEN an Author deletes a Chapter, THE Platform SHALL prompt for confirmation before removing the Chapter and its content, and recalculate order numbers of remaining Chapters to maintain a contiguous sequence
6. THE Platform SHALL display the word count for each Chapter in the chapter list
7. THE Platform SHALL calculate and display the total word count across all Chapters in a Book
8. THE Platform SHALL support a maximum of 500 Chapters per Book

### Requirement 7: Novel Writing Editor

**User Story:** As an Author, I want a rich text editor for writing my novel content, so that I can compose and format my prose effectively.

#### Acceptance Criteria

1. THE Editor SHALL provide text formatting options including bold, italic, underline, strikethrough, headings (H1-H3), block quotes, and ordered/unordered lists
2. WHILE the Author has made at least one content change within the last 30 seconds, THE Editor SHALL auto-save Chapter content every 30 seconds
3. WHEN an Author manually triggers a save (Ctrl+S or save button), THE Editor SHALL persist the current content within 2 seconds and display a save confirmation for at least 3 seconds
4. THE Editor SHALL display a word count for the current Chapter at the bottom of the editing area, updated within 1 second of any content change
5. THE Editor SHALL support full-screen distraction-free writing mode that hides navigation and sidebars
6. WHEN an Author pastes text from an external source, THE Editor SHALL strip unsupported formatting and retain only supported format types as defined in criterion 1
7. THE Editor SHALL maintain an undo/redo history of at least 50 actions within the current editing session
8. THE Editor SHALL preserve paragraph spacing and indentation as configured by the Author
9. IF an auto-save or manual save operation fails, THEN THE Editor SHALL display an error message indicating the save failure and retain the unsaved content in the Editor so the Author can retry
10. WHEN the Editor displays a save confirmation after a successful auto-save or manual save, THE Editor SHALL include a timestamp indicating when the content was last saved

### Requirement 8: Character Builder

**User Story:** As an Author, I want to create and manage detailed character profiles, so that I can maintain consistency in my characters throughout the story.

#### Acceptance Criteria

1. WHEN an Author creates a new Character_Profile within a Book, THE Platform SHALL present a form with required fields for name (maximum 100 characters) and role (protagonist, antagonist, supporting, minor), and optional fields for physical description (maximum 2000 characters), personality traits (maximum 2000 characters), backstory (maximum 5000 characters), motivations (maximum 2000 characters), and notes (maximum 5000 characters)
2. THE Platform SHALL display all Character_Profiles for a Book in a list that is searchable by name and filterable by role
3. WHEN an Author uploads a reference image (JPEG, PNG, or WebP, maximum 5 MB) for a Character_Profile, THE Platform SHALL store and display the image on the character detail page
4. IF an Author uploads a reference image that is not JPEG, PNG, or WebP format or exceeds 5 MB, THEN THE Platform SHALL reject the upload and display an error message indicating the accepted formats and size limit
5. WHEN an Author edits a Character_Profile, THE Platform SHALL save changes and display a confirmation message
6. WHEN an Author deletes a Character_Profile, THE Platform SHALL prompt for confirmation before removing the profile and all relationship connections referencing that character
7. THE Platform SHALL allow Authors to define relationships between Character_Profiles with a relationship type label (maximum 50 characters), where each relationship connects exactly two Character_Profiles
8. THE Platform SHALL display a character relationship map showing connections between Character_Profiles within a Book

### Requirement 9: Location and Place Builder

**User Story:** As an Author, I want to create and manage location profiles for my story settings, so that I can maintain consistent and detailed world geography.

#### Acceptance Criteria

1. WHEN an Author creates a new Location_Profile within a Book, THE Platform SHALL present a form with fields for name, type (city, building, landscape, realm, other), description, atmosphere, notable features, and notes
2. THE Platform SHALL display all Location_Profiles for a Book in a searchable list that matches against name, type, and description, and filterable by type
3. WHEN an Author uploads a reference image (JPEG, PNG, or WebP, maximum 5 MB) for a Location_Profile, THE Platform SHALL store and display the image on the location detail page
4. WHEN an Author edits a Location_Profile, THE Platform SHALL save changes and display a confirmation message
5. WHEN an Author deletes a Location_Profile that has child locations in the hierarchy, THE Platform SHALL prompt for confirmation and reassign all child Location_Profiles to the deleted profile's parent (or to the root level if no parent exists) before removing the profile
6. THE Platform SHALL allow Authors to define hierarchical relationships between Location_Profiles (e.g., a room within a building, a building within a city) up to a maximum depth of 5 levels
7. THE Platform SHALL display a location hierarchy tree showing parent-child relationships between Location_Profiles
8. IF an Author submits a Location_Profile form with an empty name or a name exceeding 200 characters, THEN THE Platform SHALL display a validation error indicating the name must be between 1 and 200 characters
9. IF an Author uploads a reference image for a Location_Profile that is not JPEG, PNG, or WebP format or exceeds 5 MB, THEN THE Platform SHALL reject the upload and display an error message specifying the accepted formats and size limit

### Requirement 10: Plot and Storyline Outline Tool

**User Story:** As an Author, I want to outline my plot with structured plot points, so that I can plan and visualize my story's narrative arc.

#### Acceptance Criteria

1. WHEN an Author creates a new Plot_Point within a Plot_Outline, THE Platform SHALL present a form with fields for title (maximum 150 characters), description (maximum 2000 characters), act (beginning, middle, end), associated characters, associated locations, and status (planned, in progress, completed)
2. WHEN an Author reorders Plot_Points via drag-and-drop, THE Platform SHALL update all affected positions and persist the new sequence within 2 seconds
3. THE Platform SHALL display the Plot_Outline as a horizontal or vertical timeline showing all Plot_Points in their sequential order, with each Plot_Point displaying its title, act, status, and color label
4. WHEN an Author links a Plot_Point to one or more Character_Profiles (up to 20 per Plot_Point), THE Platform SHALL display those characters on the Plot_Point detail view
5. WHEN an Author links a Plot_Point to one or more Location_Profiles (up to 10 per Plot_Point), THE Platform SHALL display those locations on the Plot_Point detail view
6. WHEN an Author deletes a Plot_Point and confirms the deletion prompt, THE Platform SHALL remove the Plot_Point and update the timeline sequence
7. IF an Author cancels the deletion prompt for a Plot_Point, THEN THE Platform SHALL retain the Plot_Point unchanged and return the Author to the previous view
8. THE Platform SHALL allow Authors to assign one color label from a set of at least 8 predefined colors to each Plot_Point for visual categorization on the timeline
9. WHEN an Author edits a Plot_Point and submits the changes, THE Platform SHALL save changes within 2 seconds and display a confirmation notification for at least 3 seconds
10. IF a save operation fails when creating or editing a Plot_Point, THEN THE Platform SHALL display an error notification indicating the failure reason and retain the Author's unsaved input in the form

### Requirement 11: Writing Targets

**User Story:** As an Author, I want to set daily and weekly word count goals, so that I can maintain consistent writing habits and track my progress.

#### Acceptance Criteria

1. WHEN an Author sets a daily Writing_Target, THE Platform SHALL accept a word count value between 1 and 100,000, store the target, and apply it to each calendar day
2. WHEN an Author sets a weekly Writing_Target, THE Platform SHALL accept a word count value between 1 and 500,000, store the target, and apply it to each calendar week (Monday through Sunday)
3. THE Platform SHALL display the current progress toward the active daily Writing_Target as a percentage and progress bar on the Dashboard, where progress equals the total words written across all Chapters of the targeted Book on the current calendar day
4. THE Platform SHALL display the current progress toward the active weekly Writing_Target as a percentage and progress bar on the Dashboard, where progress equals the total words written across all Chapters of the targeted Book during the current calendar week
5. WHEN an Author meets or exceeds their daily Writing_Target, THE Platform SHALL display a visual celebration indicator (accent-colored badge) on the Dashboard
6. THE Platform SHALL allow Authors to set different Writing_Targets for different Books
7. WHEN an Author modifies a Writing_Target, THE Platform SHALL apply the new target starting from the current day without altering historical records
8. IF an Author submits a Writing_Target value that is not a whole number between 1 and 100,000 (daily) or 1 and 500,000 (weekly), THEN THE Platform SHALL reject the input and display a validation error indicating the acceptable range
9. IF no Writing_Target is set for a Book, THEN THE Platform SHALL hide the progress bar and percentage display for that Book on the Dashboard

### Requirement 12: Writing Statistics and Progress Tracking

**User Story:** As an Author, I want to view detailed statistics about my writing activity, so that I can understand my productivity patterns and stay motivated.

#### Acceptance Criteria

1. THE Platform SHALL calculate and display the total word count for each Book on the Dashboard, shown as a whole number
2. IF an Author has an active daily Writing_Target, THEN THE Platform SHALL track and display the current Writing_Streak (consecutive days meeting the daily Writing_Target), starting the count from the most recent unbroken sequence
3. THE Platform SHALL display a calendar heat map showing daily word counts for the past 12 months, using 5 intensity levels (0 words, 1–25% of daily Writing_Target, 26–50%, 51–99%, and 100% or above)
4. THE Platform SHALL calculate and display the average words written per day over the past 30 calendar days, including days with zero words, rounded to the nearest whole number
5. WHEN an Author closes the Editor or navigates away from a Chapter after making edits, THE Platform SHALL record a Writing_Session capturing the elapsed time from first edit to close and the net word count change during that period
6. THE Platform SHALL display a line chart showing cumulative word count progress over time for each Book, plotted at daily granularity for the past 30 days by default
7. THE Platform SHALL display the longest Writing_Streak achieved by the Author as a whole number of consecutive days
8. IF a Book has a target word count set and the Author's average daily word count over the past 30 days is greater than zero, THEN THE Platform SHALL calculate and display the estimated completion date based on remaining words divided by that average
9. IF a Book has no target word count set or the Author's average daily word count over the past 30 days is zero, THEN THE Platform SHALL display a message indicating that the estimated completion date cannot be calculated
10. IF an Author has no active daily Writing_Target, THEN THE Platform SHALL display the Writing_Streak as zero and indicate that a daily Writing_Target must be set to track streaks

### Requirement 13: World-Building Tools

**User Story:** As an Author, I want to create custom world-building entries for my story universe, so that I can document and organize the rules, cultures, and systems of my fictional world.

#### Acceptance Criteria

1. WHEN an Author creates a new World_Element within a Book, THE Platform SHALL present a form with fields for name (required, maximum 150 characters), category (magic system, culture, history, technology, religion, politics, economy, custom), description (maximum 10,000 characters), rules/laws (maximum 5,000 characters), and notes (maximum 5,000 characters)
2. THE Platform SHALL display all World_Elements for a Book grouped by category in a navigable sidebar, with each category expandable to show its contained World_Elements
3. WHEN an Author edits a World_Element, THE Platform SHALL save changes and display a confirmation message
4. WHEN an Author deletes a World_Element, THE Platform SHALL prompt for confirmation before removing the element and any cross-references pointing to it
5. THE Platform SHALL allow Authors to create cross-references (links) between World_Elements within the same Book, displayed as clickable links in the World_Element detail view that navigate to the referenced element
6. THE Platform SHALL allow Authors to create custom categories (maximum 50 characters per category name, unique within the Book) for World_Elements beyond the predefined list
7. THE Platform SHALL display a count of World_Elements per category in the sidebar navigation
8. IF an Author submits the World_Element form with the name field empty, THEN THE Platform SHALL display a validation error indicating that the name is required
9. IF a save or update operation for a World_Element fails, THEN THE Platform SHALL display an error message indicating the failure and retain the Author's entered data in the form

### Requirement 14: Dashboard and Navigation

**User Story:** As an Author, I want a clear and organized dashboard, so that I can quickly access my books and see my writing progress at a glance.

#### Acceptance Criteria

1. WHEN an authenticated Author navigates to the Dashboard, THE Platform SHALL display all Books belonging to that Author as cards showing the Cover_Image (or default placeholder if none uploaded), title, status, word count, and last modified date, ordered by last modified date descending
2. IF an authenticated Author has no Books, THEN THE Platform SHALL display an empty state message with a prompt to create their first Book
3. THE Platform SHALL display a summary statistics panel on the Dashboard showing total words written today (based on the Author's configured time zone), current Writing_Streak in days, and progress toward both the active daily and weekly Writing_Targets as percentages with progress bars
4. THE Platform SHALL provide a persistent sidebar navigation visible on all pages with links to Dashboard, all Books, and account settings, and on viewports below 768px the sidebar SHALL collapse into a toggleable menu accessible via a menu button
5. WHEN an Author clicks on a Book card, THE Platform SHALL navigate to that Book's workspace displaying a tabbed or sectioned navigation providing access to chapters, characters, locations, plot outline, and world-building sections
6. THE Platform SHALL display a quick-access recent activity feed on the Dashboard showing the last 5 edited items across all of the Author's Books, where each item displays the item name, item type (chapter, character, location, or plot point), the associated Book title, and the time elapsed since last edit

### Requirement 15: Design System and Visual Theme

**User Story:** As an Author, I want the platform to have a clean, modern, and visually appealing interface, so that the writing experience is pleasant and distraction-free.

#### Acceptance Criteria

1. THE Platform SHALL use the Jost font family as the primary typeface for all text elements, with a fallback stack of sans-serif, and a base body font size of 18px with 170% line height
2. THE Platform SHALL use #fa4729 as the accent color for interactive elements, highlights, and emphasis
3. THE Platform SHALL use #101010 as the primary text color and #ffffff as the primary background color, maintaining a minimum contrast ratio of 4.5:1 between text and background for all readable content
4. THE Platform SHALL apply a fixed-position dotted background pattern overlay using 2px dots at 10px spacing with an opacity of 6% over the full viewport
5. THE Platform SHALL use bordered frame layouts with a 2px solid border in #101010 and an offset shadow of 7px horizontal and 7px vertical with 0px blur at 18% opacity of the border color for content cards and panels
6. THE Platform SHALL use uppercase text styling with font-weight 600 for labels, navigation items, and section headings
7. THE Platform SHALL be fully responsive, adapting layout for desktop (1200px+), tablet (768px-1199px), and mobile (below 768px) viewports, with no horizontal scrollbar at any supported viewport width
8. THE Platform SHALL maintain a minimum touch target size of 44x44 pixels for all interactive elements on mobile viewports

### Requirement 16: Data Export

**User Story:** As an Author, I want to export my book content, so that I can back up my work or use it in other applications.

#### Acceptance Criteria

1. WHEN an Author requests an export of a Book, THE Platform SHALL generate a downloadable file containing the Book title as the document heading followed by all Chapter content in the selected format
2. THE Platform SHALL support export in plain text (.txt) format with formatting stripped to plain characters, and Markdown (.md) format with rich text formatting converted to equivalent Markdown syntax
3. WHEN an Author exports a Book, THE Platform SHALL include chapter titles as headings in the exported file, ordered by chapter sequence, with each chapter separated by a blank line
4. THE Platform SHALL allow Authors to export individual Chapters separately from the full Book export, with the chapter title as the document heading
5. IF an export operation fails or does not complete within 60 seconds, THEN THE Platform SHALL display an error message indicating the failure reason and suggest the Author retry the operation
6. WHEN an Author initiates an export, THE Platform SHALL present a format selection option (plain text or Markdown) before generating the file

### Requirement 17: Search Functionality

**User Story:** As an Author, I want to search across my book content, so that I can quickly find specific passages, characters, or locations.

#### Acceptance Criteria

1. WHEN an Author enters a search query of at least 2 characters within a Book, THE Platform SHALL perform a case-insensitive substring search and return up to 50 matching results from Chapters, Character_Profiles, Location_Profiles, Plot_Points, and World_Elements
2. THE Platform SHALL highlight the matching text within search results using the accent color to visually distinguish matched portions from surrounding text
3. THE Platform SHALL display search results grouped by content type (chapters, characters, locations, plot points, world elements), with a count of matches shown for each group
4. WHEN an Author clicks a search result, THE Platform SHALL navigate to the corresponding item with the matching text scrolled into the visible viewport
5. THE Platform SHALL return search results within 2 seconds for Books containing up to 200,000 words
6. THE Platform SHALL display each search result with the item title and a text snippet of up to 120 characters surrounding the matching text to provide context
7. IF a search query returns no matching results, THEN THE Platform SHALL display a message indicating no results were found for the given query

### Requirement 18: Account Settings

**User Story:** As an Author, I want to manage my account settings, so that I can update my profile information and preferences.

#### Acceptance Criteria

1. WHEN an Author updates their display name or email address, THE Platform SHALL validate that the display name is between 2 and 50 characters, that the email address is valid and not already associated with another account, save the changes, and display a confirmation message
2. WHEN an Author submits a password change with a valid current password, THE Platform SHALL validate that the new password is at least 8 characters, apply the new password, and display a confirmation message
3. IF an Author submits a password change with an incorrect current password, THEN THE Platform SHALL reject the request and display an error message indicating the current password is incorrect
4. THE Platform SHALL allow Authors to upload a profile avatar image in JPEG, PNG, or WebP format with a maximum file size of 2 MB and maximum dimensions of 500x500 pixels
5. IF an Author uploads a profile avatar that exceeds 2 MB or is not in JPEG, PNG, or WebP format, THEN THE Platform SHALL reject the upload and display an error message indicating the specific validation failure
6. WHEN an Author requests account deletion, THE Platform SHALL require password confirmation and display a warning that all data will be permanently removed after a 30-day grace period, during which the account is deactivated and the Author may cancel the deletion by logging in and confirming reactivation
7. THE Platform SHALL allow Authors to configure their preferred date format (DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD) and time zone selected from the IANA time zone list for display purposes

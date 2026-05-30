# Implementation Plan: Novel Writing Platform

## Overview

This implementation plan covers the full-stack Novel Writing Platform built with PHP/Laravel, MySQL, and vanilla JavaScript. The platform provides authors with tools for writing, organizing, and managing novels — including a rich text editor (Quill.js), character/location builders, plot outlining, writing targets, statistics tracking, world-building tools, and data export. The design follows the Treto theme (Jost font, #fa4729 accent, bordered frames with offset box-shadows, dotted background pattern).

Tasks are ordered to build foundational infrastructure first, then layer features incrementally with each step building on the previous. Testing tasks are placed close to their implementation counterparts.

## Tasks

- [ ] 1. Project setup, configuration, and core infrastructure
  - [ ] 1.1 Initialize Laravel project and configure environment
    - Create a new Laravel project (or configure existing) with PHP 8.1+
    - Configure `.env` for MySQL database connection, file storage (local disk), session driver, and mail settings
    - Install Laravel Breeze for authentication scaffolding
    - Install Quill.js via CDN or npm for the rich text editor
    - Configure `config/filesystems.php` for public disk with covers, characters, locations, and avatars directories
    - Set up `config/session.php` with 120-minute lifetime
    - _Requirements: 2.5, 15.1_

  - [ ] 1.2 Create database migrations in sequence
    - Create all 17 migrations in the order specified in the design: users, books, chapters, characters, character_relationships, locations, plot_points, plot_point_characters, plot_point_locations, writing_targets, writing_sessions, daily_word_counts, world_elements, world_element_references, world_element_categories, login_attempts, password_reset_tokens
    - Include all indexes, foreign keys, enums, and constraints as defined in the MySQL schema
    - Run migrations to verify schema integrity
    - _Requirements: 1.1, 4.1, 6.1, 8.1, 9.1, 10.1, 11.1, 12.5, 13.1_

  - [ ] 1.3 Create Eloquent models with relationships and casts
    - Create `User` model with `books()`, `writingSessions()`, `dailyWordCounts()` relationships, fillable fields, hidden fields, and casts
    - Create `Book` model with SoftDeletes, all relationships (chapters, characters, locations, plotPoints, worldElements, writingTargets, writingSessions), `getTotalWordCountAttribute()` accessor, and `BookStatus` enum cast
    - Create `Chapter` model with `book()` relationship and `content_delta` array cast
    - Create `Character` model with `book()`, `relationships()`, `relatedCharacters()` relationships and `CharacterRole` enum cast
    - Create `CharacterRelationship` model
    - Create `Location` model with `book()`, `parent()`, `children()` relationships and `LocationType` enum cast
    - Create `PlotPoint` model with `book()`, `characters()`, `locations()` relationships and `PlotAct`/`PlotStatus` enum casts
    - Create `WritingTarget`, `WritingSession`, `DailyWordCount` models
    - Create `WorldElement` model with `book()`, `references()`, `referencedBy()` relationships
    - Create `WorldElementCategory` model
    - Create `LoginAttempt` model
    - Create PHP enums: `BookStatus`, `CharacterRole`, `LocationType`, `PlotAct`, `PlotStatus`
    - _Requirements: 4.5, 6.1, 8.1, 9.1, 10.1, 11.1, 13.1_

  - [ ] 1.4 Set up CSS design system and base layout
    - Create `resources/css/app.css` with the full Treto theme CSS (CSS variables, dotted background pattern, typography, cards, buttons, form fields, progress bars, layout, book cards, editor styles, toast notifications, badges, responsive breakpoints)
    - Import Jost font from Google Fonts
    - Implement responsive layout with sidebar (260px desktop, collapsible on mobile <768px)
    - Ensure minimum 44x44px touch targets on mobile
    - Ensure 4.5:1 contrast ratio for all text
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

  - [ ] 1.5 Create Blade layout templates and reusable components
    - Create `resources/views/layouts/app.blade.php` (authenticated layout with sidebar, CSRF meta tag, CSS/JS includes)
    - Create `resources/views/layouts/guest.blade.php` (login/register layout without sidebar)
    - Create Blade components: `sidebar.blade.php`, `book-card.blade.php`, `progress-bar.blade.php`, `toast.blade.php`, `modal.blade.php`, `form-field.blade.php`, `empty-state.blade.php`
    - Set up the persistent sidebar navigation with links to Dashboard, Books, and Settings
    - Implement responsive sidebar toggle (hamburger menu on viewports <768px)
    - _Requirements: 14.4, 15.1, 15.5, 15.6, 15.7_

  - [ ] 1.6 Create middleware classes
    - Create `EnsureAuthenticated` middleware (redirect unauthenticated users to login)
    - Create `RateLimitLogin` middleware (5 attempts per 15 minutes per email)
    - Create `RateLimitPasswordReset` middleware (5 requests per 15 minutes per email)
    - Create `EnsureBookOwnership` middleware (verify authenticated user owns the book)
    - Create `SessionTimeout` middleware (expire sessions after 120 minutes of inactivity)
    - Register middleware in `app/Http/Kernel.php`
    - _Requirements: 2.4, 2.5, 2.6, 3.5_

  - [ ] 1.7 Define all application routes
    - Create `routes/web.php` with all public routes (login, register, forgot-password, reset-password)
    - Create all authenticated routes grouped under auth + session.timeout middleware: dashboard, books (resource), chapters (nested), characters, locations, plot, world-building, writing targets, statistics, export, search, settings
    - Apply `EnsureBookOwnership` middleware to all book-nested routes
    - Apply rate limiting middleware to login and password reset routes
    - _Requirements: 2.4, 14.4_

- [ ] 2. Authentication system
  - [ ] 2.1 Implement registration controller and views
    - Create `AuthController::showRegister()` returning the register Blade view
    - Create `StoreRegistrationRequest` form request with validation: name (required, 1-100 chars), email (required, valid format, unique), password (required, 8-128 chars, confirmed)
    - Create `AuthController::register()` that validates input, hashes password with bcrypt, creates user, sends verification email, logs in, and redirects to dashboard
    - Create `resources/views/auth/register.blade.php` with Treto-styled form showing inline validation errors
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.2 Write property tests for registration validation
    - **Property 10: Registration Input Validation**
    - **Validates: Requirements 1.1, 1.3, 1.4**

  - [ ]* 2.3 Write property test for password storage security
    - **Property 9: Password Storage Security**
    - **Validates: Requirements 1.5**

  - [ ] 2.4 Implement login controller and views
    - Create `AuthController::showLogin()` returning the login Blade view
    - Create `AuthController::login()` with credential validation, login attempt tracking (LoginAttempt model), account lockout after 5 failed attempts for 15 minutes, session creation on success, and redirect to dashboard
    - Create `AuthController::logout()` that destroys session, invalidates token, and redirects to login
    - Create `resources/views/auth/login.blade.php` with Treto-styled form, error messages, and lockout notification
    - Handle session expiry message display when redirected with `?expired=1`
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

  - [ ]* 2.5 Write property test for unauthenticated route protection
    - **Property 11: Unauthenticated Route Protection**
    - **Validates: Requirements 2.4**

  - [ ] 2.6 Implement password recovery
    - Create `AuthController::showForgotPassword()` and `AuthController::forgotPassword()` — send reset link if email exists, always show same confirmation message regardless of email existence
    - Create `AuthController::showResetPassword()` and `AuthController::resetPassword()` — validate token, enforce 60-minute expiry, update password, invalidate token, terminate all sessions, redirect to login
    - Apply rate limiting (5 requests per 15 minutes per email)
    - Handle expired/used token with appropriate error message
    - Create `resources/views/auth/forgot-password.blade.php` and `reset-password.blade.php`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 2.7 Write unit tests for authentication flows
    - Test successful registration, duplicate email rejection, validation errors
    - Test successful login, invalid credentials, account lockout after 5 attempts, lockout expiry
    - Test logout destroys session
    - Test password reset flow end-to-end
    - Test session timeout after 120 minutes
    - _Requirements: 1.1–1.6, 2.1–2.7, 3.1–3.5_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Book management and dashboard
  - [ ] 4.1 Implement BookService
    - Create `App\Services\BookService` with methods: `create()`, `update()`, `delete()`, `uploadCover()`, `removeCover()`, `generateThumbnail()`, `calculateWordCount()`
    - `create()`: create book with status 'draft', associate with user
    - `update()`: validate title (1-200 chars), synopsis (max 2000 chars), update metadata
    - `delete()`: soft delete book (cascades handled by DB foreign keys)
    - `uploadCover()`: validate MIME type (jpeg/png/webp), validate dimensions (min 600x900), store file, replace existing if present
    - `removeCover()`: delete stored file and thumbnail, clear paths on model
    - `generateThumbnail()`: scale and center-crop to 300x450px
    - _Requirements: 4.1, 4.3, 4.4, 5.1, 5.4, 5.5_

  - [ ] 4.2 Implement BookController and form requests
    - Create `StoreBookRequest` (title required, 1-200 chars)
    - Create `UpdateBookRequest` (title 1-200 chars, synopsis max 2000 chars, status in enum values)
    - Create `UploadCoverRequest` (file required, mimes jpeg/png/webp, max 5MB, dimensions min 600x900)
    - Implement `BookController::index()` — list all user's books ordered by updated_at desc
    - Implement `BookController::store()` — create book, redirect to book workspace
    - Implement `BookController::show()` — display book workspace with tabbed navigation (chapters, characters, locations, plot, world-building)
    - Implement `BookController::update()` — update metadata, show confirmation
    - Implement `BookController::destroy()` — confirm and soft-delete
    - Implement `BookController::uploadCover()` and `BookController::removeCover()`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 4.3 Create book-related Blade views
    - Create `resources/views/books/create.blade.php` — new book form with title field
    - Create `resources/views/books/index.blade.php` — grid of book cards with cover, title, status, word count, last modified
    - Create `resources/views/books/show.blade.php` — book workspace with tabbed/sectioned navigation for chapters, characters, locations, plot, world-building
    - Style all views with Treto theme (bordered frames, offset shadows, uppercase headings)
    - _Requirements: 4.1, 4.2, 4.6, 14.5_

  - [ ] 4.4 Implement DashboardController and view
    - Create `DashboardController::index()` — fetch user's books (ordered by updated_at desc), daily/weekly writing progress, current streak, recent activity (last 5 edited items)
    - Create `resources/views/dashboard/index.blade.php` — book cards grid, summary statistics panel (words today, streak, daily/weekly progress bars), recent activity feed, empty state for no books
    - Implement book card component showing cover image (or placeholder), title, status badge, word count, last modified date
    - _Requirements: 14.1, 14.2, 14.3, 14.5, 14.6_

  - [ ]* 4.5 Write property tests for book management
    - **Property 4: Book Title Validation**
    - **Validates: Requirements 4.1, 4.7**

  - [ ]* 4.6 Write property test for book ordering
    - **Property 5: Books Ordered by Last Modified**
    - **Validates: Requirements 4.2, 14.1**

  - [ ]* 4.7 Write property test for book metadata validation
    - **Property 7: Book Metadata Validation**
    - **Validates: Requirements 4.3**

  - [ ]* 4.8 Write property test for book deletion cascade
    - **Property 6: Book Deletion Cascades All Associated Data**
    - **Validates: Requirements 4.4**

- [ ] 5. Chapter management and editor
  - [ ] 5.1 Implement ChapterService
    - Create `App\Services\ChapterService` with methods: `create()`, `updateContent()`, `reorder()`, `delete()`, `calculateWordCount()`
    - `create()`: assign next sequential order_number, default title "Chapter [N]"
    - `updateContent()`: save content_html and content_delta, recalculate word_count
    - `reorder()`: validate all IDs belong to book, update order_numbers in transaction to maintain contiguous [1..N] sequence
    - `delete()`: remove chapter in transaction, decrement order_numbers of subsequent chapters
    - `calculateWordCount()`: strip HTML tags, decode entities, collapse whitespace, count whitespace-separated tokens
    - _Requirements: 6.1, 6.2, 6.5, 6.6, 6.7_

  - [ ] 5.2 Implement EditorService
    - Create `App\Services\EditorService` with methods: `saveContent()`, `stripUnsupportedFormatting()`
    - `saveContent()`: persist delta JSON and HTML, update word count, update book's updated_at
    - `stripUnsupportedFormatting()`: retain only bold, italic, underline, strikethrough, H1-H3, blockquote, ordered/unordered lists; strip all other HTML
    - _Requirements: 7.1, 7.6_

  - [ ] 5.3 Implement ChapterController and form requests
    - Create `UpdateChapterRequest` (title 1-200 chars)
    - Create `SaveContentRequest` (content_delta required as array, content_html required as string)
    - Create `ReorderRequest` (order required as array of chapter IDs)
    - Implement `ChapterController::store()` — create chapter, return JSON
    - Implement `ChapterController::show()` — display editor view
    - Implement `ChapterController::update()` — rename chapter
    - Implement `ChapterController::destroy()` — delete with confirmation
    - Implement `ChapterController::reorder()` — persist new order
    - Implement `ChapterController::saveContent()` — save editor content (used by auto-save and manual save)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.8_

  - [ ] 5.4 Create chapter list and editor Blade views
    - Create `resources/views/chapters/index.blade.php` — sortable chapter list with drag handles, word counts per chapter, total book word count, add chapter button
    - Create `resources/views/chapters/editor.blade.php` — Quill.js editor with toolbar (bold, italic, underline, strikethrough, H1-H3, blockquote, ordered/unordered lists), word count footer, save status indicator with timestamp, fullscreen toggle button
    - Include Quill.js CDN, CSRF meta tag, and editor initialization script
    - _Requirements: 6.1, 6.6, 6.7, 7.1, 7.3, 7.4, 7.5, 7.10_

  - [ ] 5.5 Implement editor JavaScript module
    - Create `resources/js/modules/editor.js` with `EditorModule`: Quill initialization, 30-second auto-save (only when dirty), manual save (Ctrl+S), real-time word count update, fullscreen toggle, paste handler (strip unsupported formatting), undo/redo (50-action history), beforeunload handler to save to localStorage
    - Implement save error handling: display persistent error banner, backup to localStorage, retry with exponential backoff (10s, 20s, 40s, max 120s)
    - Handle 401 responses (session expired): save to localStorage, redirect to login
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

  - [ ] 5.6 Implement drag-and-drop JavaScript module
    - Create `resources/js/modules/drag-drop.js` with `DragDropModule`: initialize sortable containers, handle dragstart/dragover/drop events, persist new order via AJAX to reorder endpoint
    - Apply to chapter list and plot points
    - _Requirements: 6.2, 10.2_

  - [ ] 5.7 Implement local storage module for unsaved content
    - Create `resources/js/modules/local-storage.js` with `LocalStorageModule`: `saveUnsavedContent(chapterId, content)`, `getUnsavedContent(chapterId)`, `clearUnsavedContent(chapterId)`
    - On editor load, check for unsaved content and prompt restore
    - _Requirements: 2.7, 7.9_

  - [ ]* 5.8 Write property tests for word count and chapter ordering
    - **Property 1: Word Count Calculation Accuracy**
    - **Validates: Requirements 6.6, 7.4**

  - [ ]* 5.9 Write property test for total book word count
    - **Property 2: Total Book Word Count Invariant**
    - **Validates: Requirements 6.7, 12.1**

  - [ ]* 5.10 Write property test for ordered sequence contiguity
    - **Property 3: Ordered Sequence Contiguity**
    - **Validates: Requirements 6.2, 6.5, 10.2, 10.6**

  - [ ]* 5.11 Write property test for chapter title validation
    - **Property 8: Chapter Title Validation**
    - **Validates: Requirements 6.3, 6.4**

  - [ ]* 5.12 Write property test for paste formatting sanitization
    - **Property 35: Paste Formatting Sanitization**
    - **Validates: Requirements 7.6**

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Character builder
  - [ ] 7.1 Implement CharacterService
    - Create `App\Services\CharacterService` with methods: `create()`, `update()`, `delete()`, `addRelationship()`, `removeRelationship()`, `getRelationshipMap()`
    - `create()`: validate name (max 100 chars), role (enum), optional fields with length limits
    - `delete()`: remove character and cascade delete all relationship records referencing it
    - `addRelationship()`: validate both characters belong to same book, relationship_type max 50 chars, enforce unique pair
    - `getRelationshipMap()`: return all characters with their connections for visualization
    - _Requirements: 8.1, 8.5, 8.6, 8.7, 8.8_

  - [ ] 7.2 Implement CharacterController and form requests
    - Create `StoreCharacterRequest` (name required max 100, role required in enum, optional text fields with length limits)
    - Create `UpdateCharacterRequest` (same validation as store)
    - Implement `CharacterController::index()` — list characters with search by name and filter by role
    - Implement `CharacterController::store()` — create character, return JSON
    - Implement `CharacterController::update()` — update character, return JSON
    - Implement `CharacterController::destroy()` — delete with confirmation
    - Implement `CharacterController::uploadImage()` — validate JPEG/PNG/WebP max 5MB, store reference image
    - Implement `CharacterController::relationships()` — return relationship map as JSON
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [ ] 7.3 Create character Blade views and relationship map JS
    - Create `resources/views/characters/index.blade.php` — character list with search input, role filter dropdown, character cards showing name/role/image
    - Create `resources/views/characters/show.blade.php` — character detail with all fields, reference image, edit form
    - Create `resources/views/characters/relationships.blade.php` — relationship map visualization
    - Create `resources/js/modules/character-map.js` with `CharacterMapModule`: render character nodes with connections, display relationship type labels
    - _Requirements: 8.1, 8.2, 8.3, 8.7, 8.8_

  - [ ]* 7.4 Write property tests for character management
    - **Property 12: Character Search and Filter**
    - **Validates: Requirements 8.2**

  - [ ]* 7.5 Write property test for character deletion cascade
    - **Property 13: Character Deletion Removes Relationships**
    - **Validates: Requirements 8.6**

  - [ ]* 7.6 Write property test for relationship integrity
    - **Property 14: Character Relationship Structure Integrity**
    - **Validates: Requirements 8.7**

- [ ] 8. Location and place builder
  - [ ] 8.1 Implement LocationService
    - Create `App\Services\LocationService` with methods: `create()`, `update()`, `delete()`, `getHierarchyTree()`, `reassignChildren()`
    - `create()`: validate parent depth (max 4 for 0-indexed, enforcing 5-level limit), set depth based on parent
    - `delete()`: reassign children to deleted location's parent (or root), recalculate depths recursively, then delete
    - `getHierarchyTree()`: build nested tree structure from root locations with recursive children loading
    - _Requirements: 9.1, 9.4, 9.5, 9.6, 9.7_

  - [ ] 8.2 Implement LocationController and form requests
    - Create `StoreLocationRequest` (name required 1-200 chars, type required in enum, optional text fields)
    - Create `UpdateLocationRequest` (same validation)
    - Implement `LocationController::index()` — list locations with search (name, type, description) and filter by type
    - Implement `LocationController::store()` — create location with optional parent_id
    - Implement `LocationController::update()` — update location
    - Implement `LocationController::destroy()` — delete with child reassignment
    - Implement `LocationController::uploadImage()` — validate JPEG/PNG/WebP max 5MB
    - Implement `LocationController::hierarchy()` — return hierarchy tree as JSON
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_

  - [ ] 8.3 Create location Blade views
    - Create `resources/views/locations/index.blade.php` — location list with search, type filter, location cards
    - Create `resources/views/locations/show.blade.php` — location detail with all fields, reference image, parent/children info
    - Create `resources/views/locations/hierarchy.blade.php` — tree visualization of location hierarchy
    - _Requirements: 9.1, 9.2, 9.7_

  - [ ]* 8.4 Write property tests for location management
    - **Property 15: Location Search and Filter**
    - **Validates: Requirements 9.2**

  - [ ]* 8.5 Write property test for location deletion reassignment
    - **Property 16: Location Deletion Reassigns Children**
    - **Validates: Requirements 9.5**

  - [ ]* 8.6 Write property test for hierarchy depth limit
    - **Property 17: Location Hierarchy Depth Limit**
    - **Validates: Requirements 9.6**

- [ ] 9. Plot and storyline outline tool
  - [ ] 9.1 Implement PlotService
    - Create `App\Services\PlotService` with methods: `create()`, `update()`, `delete()`, `reorder()`, `linkCharacters()`, `linkLocations()`
    - `create()`: validate title (max 150), description (max 2000), act (enum), status (enum), assign next position
    - `reorder()`: update positions in transaction to maintain contiguous sequence
    - `delete()`: remove plot point, update positions of subsequent points
    - `linkCharacters()`: validate max 20 characters per plot point, sync pivot table
    - `linkLocations()`: validate max 10 locations per plot point, sync pivot table
    - _Requirements: 10.1, 10.2, 10.4, 10.5, 10.6_

  - [ ] 9.2 Implement PlotController and form requests
    - Create `StorePlotPointRequest` (title required max 150, description max 2000, act in enum, status in enum, color_label optional from 8 predefined colors)
    - Create `UpdatePlotPointRequest` (same validation)
    - Implement `PlotController::index()` — display timeline view with all plot points
    - Implement `PlotController::store()` — create plot point, return JSON
    - Implement `PlotController::update()` — update plot point within 2 seconds, show confirmation for 3 seconds
    - Implement `PlotController::destroy()` — delete with confirmation, update timeline
    - Implement `PlotController::reorder()` — persist new sequence
    - _Requirements: 10.1, 10.2, 10.3, 10.6, 10.7, 10.8, 10.9, 10.10_

  - [ ] 9.3 Create plot Blade views and timeline JS
    - Create `resources/views/plot/index.blade.php` — timeline view showing plot points in sequence with title, act, status, color label; forms for create/edit with character and location linking
    - Create `resources/js/modules/plot-timeline.js` with `PlotTimelineModule`: render horizontal/vertical timeline, handle drag-and-drop reorder, display color labels
    - Apply drag-drop module for plot point reordering
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.8_

  - [ ]* 9.4 Write property tests for plot management
    - **Property 18: Plot Point Creation Validation**
    - **Validates: Requirements 10.1**

  - [ ]* 9.5 Write property test for plot point link limits
    - **Property 19: Plot Point Link Limits**
    - **Validates: Requirements 10.4, 10.5**

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Writing targets and statistics
  - [ ] 11.1 Implement WritingTargetService
    - Create `App\Services\WritingTargetService` with methods: `setTarget()`, `getDailyProgress()`, `getWeeklyProgress()`, `checkTargetMet()`
    - `setTarget()`: validate daily (1-100,000) or weekly (1-500,000) word count, upsert target (unique per book/user/type)
    - `getDailyProgress()`: calculate words written today for the book, compute percentage as `min(100, floor(W/T*100))`
    - `getWeeklyProgress()`: calculate words written this week (Monday-Sunday), compute percentage
    - `checkTargetMet()`: return boolean if current words >= target
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9_

  - [ ] 11.2 Implement StatisticsService
    - Create `App\Services\StatisticsService` with methods: `getTotalWordCount()`, `getCurrentStreak()`, `getLongestStreak()`, `getAverageDailyWords()`, `getHeatmapData()`, `getProgressChartData()`, `recordSession()`, `getEstimatedCompletion()`
    - `getCurrentStreak()`: count consecutive days (ending today or yesterday) where daily words >= daily target; return 0 if no daily target set
    - `getLongestStreak()`: find maximum consecutive sequence in full history
    - `getAverageDailyWords()`: sum of last 30 days / 30, rounded to nearest whole number
    - `getHeatmapData()`: return 12 months of daily data with intensity levels (0-4) based on target percentage thresholds
    - `getProgressChartData()`: cumulative word count at daily granularity for past 30 days
    - `recordSession()`: create WritingSession record, update DailyWordCount aggregate
    - `getEstimatedCompletion()`: `today + ceil((target - current) / avgDaily)` days; return null if no target or avg is 0
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10_

  - [ ] 11.3 Implement WritingTargetController and StatisticsController
    - Create `StoreTargetRequest` (type required in daily/weekly, word_count required integer with range validation)
    - Implement `WritingTargetController::store()` and `WritingTargetController::update()`
    - Implement `StatisticsController::show()` — display statistics page for a book
    - Implement `StatisticsController::heatmap()` — return heatmap JSON data
    - Implement `StatisticsController::progressChart()` — return progress chart JSON data
    - _Requirements: 11.1, 11.2, 12.1–12.10_

  - [ ] 11.4 Create statistics Blade views and chart JS
    - Create `resources/views/statistics/index.blade.php` — statistics page with total word count, current streak, longest streak, average daily words, estimated completion date, heatmap, progress chart, progress bars for daily/weekly targets
    - Create `resources/js/modules/charts.js` with `ChartsModule`: `renderHeatmap()` (calendar grid with 5 intensity levels), `renderProgressChart()` (line chart for cumulative words over 30 days), `renderProgressBar()` (animated progress bar with percentage)
    - Display celebration badge when daily target is met
    - Handle cases where estimated completion cannot be calculated (no target or zero average)
    - _Requirements: 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.6, 12.7, 12.8, 12.9, 12.10_

  - [ ] 11.5 Integrate writing session recording into editor
    - Modify editor save flow to track session start time (first edit) and calculate duration on save/navigate away
    - Call `StatisticsService::recordSession()` when editor is closed or user navigates away after making edits
    - Update `DailyWordCount` aggregate table on each content save
    - _Requirements: 12.5_

  - [ ]* 11.6 Write property tests for writing targets
    - **Property 20: Writing Target Validation**
    - **Validates: Requirements 11.1, 11.2, 11.8**

  - [ ]* 11.7 Write property test for progress calculation
    - **Property 21: Writing Progress Calculation**
    - **Validates: Requirements 11.3, 11.4**

  - [ ]* 11.8 Write property test for streak calculation
    - **Property 22: Writing Streak Calculation**
    - **Validates: Requirements 12.2**

  - [ ]* 11.9 Write property test for heat map intensity
    - **Property 23: Heat Map Intensity Classification**
    - **Validates: Requirements 12.3**

  - [ ]* 11.10 Write property test for average daily words
    - **Property 24: Average Daily Words Calculation**
    - **Validates: Requirements 12.4**

  - [ ]* 11.11 Write property test for longest streak
    - **Property 25: Longest Streak Calculation**
    - **Validates: Requirements 12.7**

  - [ ]* 11.12 Write property test for estimated completion
    - **Property 26: Estimated Completion Date Calculation**
    - **Validates: Requirements 12.8**

- [ ] 12. World-building tools
  - [ ] 12.1 Implement WorldBuildingService
    - Create `App\Services\WorldBuildingService` with methods: `create()`, `update()`, `delete()`, `addCrossReference()`, `removeCrossReference()`, `getGroupedByCategory()`
    - `create()`: validate name (required, max 150), category (predefined or custom within book), description (max 10,000), rules_laws (max 5,000), notes (max 5,000)
    - `delete()`: remove element and cascade delete all cross-reference records (source and target)
    - `addCrossReference()`: validate both elements belong to same book, create bidirectional or unidirectional link
    - `getGroupedByCategory()`: return elements grouped by category with count per category
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [ ] 12.2 Implement WorldElementController and form requests
    - Create `StoreWorldElementRequest` (name required max 150, category required, description max 10000, rules_laws max 5000, notes max 5000)
    - Implement `WorldElementController::index()` — display world elements grouped by category in sidebar with counts
    - Implement `WorldElementController::store()` — create element, return JSON
    - Implement `WorldElementController::update()` — update element, show confirmation
    - Implement `WorldElementController::destroy()` — delete with confirmation, remove cross-references
    - Handle custom category creation (max 50 chars, unique within book)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9_

  - [ ] 12.3 Create world-building Blade views and JS
    - Create `resources/views/world/index.blade.php` — category sidebar (expandable, showing element count per category), element detail view with cross-reference links, create/edit forms
    - Create `resources/js/modules/world-builder.js` with `WorldBuilderModule`: render category tree, handle cross-reference creation (select target element), navigate to referenced elements
    - _Requirements: 13.1, 13.2, 13.5, 13.6, 13.7_

  - [ ]* 12.4 Write property tests for world-building
    - **Property 27: World Element Creation Validation**
    - **Validates: Requirements 13.1**

  - [ ]* 12.5 Write property test for category grouping
    - **Property 28: World Element Grouping by Category**
    - **Validates: Requirements 13.2, 13.7**

  - [ ]* 12.6 Write property test for deletion cascade
    - **Property 29: World Element Deletion Removes Cross-References**
    - **Validates: Requirements 13.4**

  - [ ]* 12.7 Write property test for custom category uniqueness
    - **Property 30: Custom Category Uniqueness**
    - **Validates: Requirements 13.6**

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Export functionality
  - [ ] 14.1 Implement ExportService
    - Create `App\Services\ExportService` with methods: `exportBookAsText()`, `exportBookAsMarkdown()`, `exportChapterAsText()`, `exportChapterAsMarkdown()`, `htmlToPlainText()`, `htmlToMarkdown()`
    - `exportBookAsText()`: book title (uppercase) as heading, chapters in order with titles as headings, content stripped to plain text, chapters separated by blank lines
    - `exportBookAsMarkdown()`: book title as `# heading`, chapter titles as `## headings`, HTML converted to Markdown syntax (bold→**, italic→*, strikethrough→~~, headings→#, blockquote→>, lists→-)
    - `htmlToPlainText()`: convert block elements to newlines, strip all tags, decode entities, clean whitespace
    - `htmlToMarkdown()`: regex-based conversion of supported HTML to Markdown equivalents, strip remaining tags
    - Individual chapter export with chapter title as document heading
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [ ] 14.2 Implement ExportController
    - Create `ExportRequest` (format required, in txt/md)
    - Implement `ExportController::book()` — generate StreamedResponse with appropriate Content-Disposition header, handle timeout (60 seconds max)
    - Implement `ExportController::chapter()` — export single chapter
    - Create `resources/views/export/options.blade.php` — format selection (plain text or Markdown) before generating file
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

  - [ ]* 14.3 Write property test for export content integrity
    - **Property 32: Export Content Integrity**
    - **Validates: Requirements 16.1, 16.2, 16.3**

- [ ] 15. Search functionality
  - [ ] 15.1 Implement SearchService
    - Create `App\Services\SearchService` with methods: `search()`, `searchChapters()`, `searchCharacters()`, `searchLocations()`, `searchPlotPoints()`, `searchWorldElements()`, `generateSnippet()`
    - `search()`: require minimum 2-character query, perform case-insensitive LIKE search across all content types, cap at 50 results, group by type with counts
    - `searchChapters()`: search title and content_html
    - `searchCharacters()`: search name, physical_description, personality_traits, backstory
    - `searchLocations()`: search name, type, description
    - `searchPlotPoints()`: search title, description
    - `searchWorldElements()`: search name, description, rules_laws
    - `generateSnippet()`: extract up to 120 characters surrounding the match with ellipsis for truncation
    - _Requirements: 17.1, 17.2, 17.3, 17.5, 17.6, 17.7_

  - [ ] 15.2 Implement SearchController and frontend module
    - Create `SearchRequest` (query required, min 2 chars)
    - Implement `SearchController::search()` — return JSON with grouped results, counts, and snippets
    - Create `resources/js/modules/search.js` with `SearchModule`: debounced search input, render results grouped by type with counts, highlight matching text with accent color, navigate to item on click
    - Create `resources/views/search/results.blade.php` — search interface within book workspace
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

  - [ ]* 15.3 Write property tests for search
    - **Property 33: Search Results Correctness**
    - **Validates: Requirements 17.1, 17.3**

  - [ ]* 15.4 Write property test for snippet generation
    - **Property 34: Search Snippet Generation**
    - **Validates: Requirements 17.6**

- [ ] 16. Account settings
  - [ ] 16.1 Implement SettingsController
    - Create `UpdateProfileRequest` (name 2-50 chars, email valid and unique excluding current user)
    - Create `UpdatePasswordRequest` (current_password required and verified, new_password min 8 chars, confirmed)
    - Implement `SettingsController::show()` — display settings page
    - Implement `SettingsController::updateProfile()` — update name and email
    - Implement `SettingsController::updatePassword()` — verify current password, update to new
    - Implement `SettingsController::uploadAvatar()` — validate JPEG/PNG/WebP max 2MB max 500x500, store avatar
    - Implement `SettingsController::deleteAccount()` — require password confirmation, soft-delete with 30-day grace period, deactivate account
    - Implement `SettingsController::updatePreferences()` — save timezone (IANA) and date format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

  - [ ] 16.2 Create settings Blade view
    - Create `resources/views/settings/index.blade.php` — profile section (name, email, avatar upload), password change section, preferences section (timezone dropdown, date format radio), danger zone (account deletion with warning about 30-day grace period)
    - Style with Treto theme
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

  - [ ]* 16.3 Write property tests for account settings
    - **Property 36: Profile Update Validation**
    - **Validates: Requirements 18.1**

  - [ ]* 16.4 Write property test for timezone and date format
    - **Property 37: Timezone and Date Format Preferences**
    - **Validates: Requirements 18.7**

- [ ] 17. Image upload module and notifications
  - [ ] 17.1 Implement image upload JavaScript module
    - Create `resources/js/modules/image-upload.js` with `ImageUploadModule`: client-side validation (file type, size), upload via AJAX with progress indicator, show preview on success, handle errors gracefully
    - Apply to book covers, character reference images, location reference images, and avatar uploads
    - _Requirements: 5.1, 5.2, 5.3, 5.7, 8.3, 8.4, 9.3, 9.9, 18.4, 18.5_

  - [ ] 17.2 Implement notifications JavaScript module
    - Create `resources/js/modules/notifications.js` with `NotificationModule`: `success()`, `error()`, `info()` methods displaying toast notifications with Treto styling, auto-dismiss after 3 seconds for success, persistent for errors until dismissed
    - _Requirements: 7.3, 7.9, 7.10, 10.9, 10.10_

  - [ ] 17.3 Implement sidebar JavaScript module
    - Create `resources/js/modules/sidebar.js` with `SidebarModule`: `init()`, `toggle()`, `setActive()` for responsive sidebar behavior, highlight current route
    - _Requirements: 14.4_

- [ ] 18. Dashboard integration and recent activity
  - [ ] 18.1 Implement recent activity feed
    - Query last 5 edited items across all user's books (chapters, characters, locations, plot points) ordered by updated_at desc
    - Display item name, type, associated book title, and time elapsed since last edit
    - Wire into dashboard view
    - _Requirements: 14.6_

  - [ ]* 18.2 Write property test for recent activity ordering
    - **Property 31: Recent Activity Feed Ordering**
    - **Validates: Requirements 14.6**

- [ ] 19. Frontend property-based tests (JavaScript)
  - [ ]* 19.1 Set up Jest and fast-check for frontend testing
    - Install Jest and fast-check as dev dependencies
    - Configure Jest for the JavaScript modules
    - Create test directory structure: `tests/JavaScript/property/` and `tests/JavaScript/unit/`
    - _Requirements: 7.4, 7.6, 16.2, 17.6_

  - [ ]* 19.2 Write frontend property test for word count
    - **Property 1: Word Count Calculation Accuracy (JavaScript)**
    - Test `EditorModule.getWordCount()` with fast-check random strings
    - **Validates: Requirements 7.4**

  - [ ]* 19.3 Write frontend property test for paste sanitization
    - **Property 35: Paste Formatting Sanitization (JavaScript)**
    - Test `EditorModule.handlePaste()` with fast-check random HTML
    - **Validates: Requirements 7.6**

  - [ ]* 19.4 Write frontend property test for search snippet
    - **Property 34: Search Snippet Generation (JavaScript)**
    - Test snippet generation with fast-check random content and queries
    - **Validates: Requirements 17.6**

  - [ ]* 19.5 Write frontend property test for export preview
    - **Property 32: Export Content Integrity (JavaScript)**
    - Test client-side export preview formatting
    - **Validates: Requirements 16.2**

- [ ] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical boundaries
- Property tests validate universal correctness properties defined in the design document (37 properties total)
- Unit tests validate specific examples and edge cases
- The tech stack is PHP/Laravel backend, MySQL database, vanilla JavaScript frontend with Quill.js editor
- All views follow the Treto design theme (Jost font, #fa4729 accent, bordered frames, offset shadows, dotted background, uppercase headings)
- File storage uses Laravel's filesystem abstraction (local disk for dev, S3-compatible for production)
- Session timeout is 120 minutes of inactivity
- Rate limiting is applied to login (5/15min), password reset (5/15min), registration (3/min/IP), auto-save (60/min), search (30/min)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.4"] },
    { "id": 2, "tasks": ["1.3", "1.5"] },
    { "id": 3, "tasks": ["1.6", "1.7"] },
    { "id": 4, "tasks": ["2.1", "2.4"] },
    { "id": 5, "tasks": ["2.2", "2.3", "2.5", "2.6"] },
    { "id": 6, "tasks": ["2.7"] },
    { "id": 7, "tasks": ["4.1", "5.1", "5.2"] },
    { "id": 8, "tasks": ["4.2", "4.3", "5.3", "5.4"] },
    { "id": 9, "tasks": ["4.4", "5.5", "5.6", "5.7"] },
    { "id": 10, "tasks": ["4.5", "4.6", "4.7", "4.8", "5.8", "5.9", "5.10", "5.11", "5.12"] },
    { "id": 11, "tasks": ["7.1", "8.1", "9.1"] },
    { "id": 12, "tasks": ["7.2", "8.2", "9.2"] },
    { "id": 13, "tasks": ["7.3", "8.3", "9.3"] },
    { "id": 14, "tasks": ["7.4", "7.5", "7.6", "8.4", "8.5", "8.6", "9.4", "9.5"] },
    { "id": 15, "tasks": ["11.1", "11.2", "12.1"] },
    { "id": 16, "tasks": ["11.3", "11.4", "12.2"] },
    { "id": 17, "tasks": ["11.5", "12.3"] },
    { "id": 18, "tasks": ["11.6", "11.7", "11.8", "11.9", "11.10", "11.11", "11.12", "12.4", "12.5", "12.6", "12.7"] },
    { "id": 19, "tasks": ["14.1", "15.1", "16.1"] },
    { "id": 20, "tasks": ["14.2", "15.2", "16.2"] },
    { "id": 21, "tasks": ["14.3", "15.3", "15.4", "16.3", "16.4"] },
    { "id": 22, "tasks": ["17.1", "17.2", "17.3"] },
    { "id": 23, "tasks": ["18.1"] },
    { "id": 24, "tasks": ["18.2"] },
    { "id": 25, "tasks": ["19.1"] },
    { "id": 26, "tasks": ["19.2", "19.3", "19.4", "19.5"] }
  ]
}
```

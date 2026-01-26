# Design Guidelines

## Brand Identity
**Purpose**: A developer utility app for managing and testing API endpoints (given Node.js backend context).

**Aesthetic Direction**: Brutally minimal — stark, essential, maximum whitespace. Developer-focused with emphasis on readability and speed. Dark mode by default for developer comfort.

**Memorable Element**: Ultra-clean typography with monospace code snippets and instant visual feedback on API responses.

## Navigation Architecture
**Type**: Tab Navigation (3 tabs)

**Screens**:
1. **Endpoints** (Tab 1) - Browse and manage saved API endpoints
2. **New Request** (Tab 2, center) - Core action for testing endpoints
3. **Profile** (Tab 3) - Settings and user preferences

## Screen-by-Screen Specifications

### 1. Endpoints Screen
- **Header**: Transparent, title "Endpoints", right button (+ icon)
- **Layout**: ScrollView list
- **Insets**: top: headerHeight + 24, bottom: tabBarHeight + 24
- **Empty State**: Show empty-endpoints.png illustration with "No endpoints yet" text
- **Components**: Card list with endpoint method badge, URL, and last used timestamp

### 2. New Request Screen
- **Header**: Transparent, title "Test Request"
- **Layout**: Scrollable form
- **Insets**: top: headerHeight + 24, bottom: tabBarHeight + 24
- **Components**: Method selector dropdown, URL input, Send button (primary CTA), Response area with code syntax highlighting
- **Submit**: Floating button at bottom

### 3. Profile Screen
- **Header**: Transparent, title "Profile"
- **Layout**: ScrollView
- **Insets**: top: headerHeight + 24, bottom: tabBarHeight + 24
- **Components**: Avatar (generated), display name field, theme toggle, app version

## Color Palette
- **Primary**: #00D9FF (cyan - striking tech accent)
- **Background**: #0A0A0A (near-black)
- **Surface**: #1A1A1A (elevated elements)
- **Text Primary**: #FFFFFF
- **Text Secondary**: #8A8A8A
- **Success**: #00FF88
- **Error**: #FF3B30

## Typography
- **Primary Font**: SF Mono (system monospace for dev aesthetic)
- **Scale**: Title 24px/Bold, Body 16px/Regular, Caption 14px/Regular

## Assets to Generate
1. **icon.png** - App icon, cyan terminal/bracket symbol on dark background
2. **splash-icon.png** - Same as icon.png
3. **empty-endpoints.png** - Minimal illustration of empty list/folder, WHERE: Endpoints screen empty state
4. **avatar-dev.png** - Default user avatar with abstract developer icon, WHERE: Profile screen
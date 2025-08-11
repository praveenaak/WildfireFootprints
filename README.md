# Wildfire Footprints

This project visualizes the atmospheric impact of wildfires across the United States using advanced modeling data.

## Features

### Intro Page
- **Welcome Screen**: New users are greeted with an informative intro page that explains the tool's purpose and features
- **Tabbed Navigation**: The intro page includes tabs for About, Features, and Feedback sections
- **Demo Modal**: Users can access a demo (placeholder for future implementation)
- **Persistent Preference**: The intro page is shown only once per user (stored in localStorage)
- **Developer Reset**: Developers can reset the intro preference by running `window.resetIntro()` in the browser console

### Interactive Map
- Explore wildfire atmospheric footprints across multiple locations
- Interactive controls and real-time visualization
- Time series animation capabilities
- Multi-location data comparison

### Air Quality Metrics
- PM2.5 concentration visualization
- Relationship analysis between wildfires and air quality
- Scientific modeling data integration

## Development

### Getting Started

```bash
npm install
npm start
```

### Building for Production

```bash
npm run build
```

### Intro Page Management

The intro page preference is managed through utility functions in `src/utils/introUtils.ts`:

- `hasSeenIntro()`: Check if user has seen the intro
- `markIntroSeen()`: Mark intro as seen
- `resetIntroPreference()`: Reset the preference (available as `window.resetIntro()` in browser console)

### Project Structure

- `src/components/IntroPage.tsx`: Main intro page component
- `src/components/IntroPage.css`: Intro page styling with theme-consistent utilities
- `src/utils/introUtils.ts`: Intro page preference management utilities

## Styling

The intro page uses a comprehensive CSS utility system that matches the application's theme colors:

- **Brand Colors**: Olympic Park Obsidian, Snowbird White, Moab Mahogany, Spiral Jetty Sage, Great Salt Lake Green
- **Typography**: Sora and Red Hat Display fonts
- **Responsive Design**: Mobile-friendly with responsive grid layouts

## About

This tool is supported by the Wilkes Center for Climate Science and Policy and provides valuable insights into wildfire environmental impacts.

## Feedback

Submit bug reports, feature requests, and technical feedback through [GitHub Issues](https://github.com/wilkes-center/wildfire-footprints/issues).

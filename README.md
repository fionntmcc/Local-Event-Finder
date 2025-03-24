# Local Event Finder
by Fionn McCarthy

Local Event Finder is a mobile application that helps users discover local events happening around them. The app uses the PredictHQ API to fetch event data and displays it on a map using Google Maps. Users can search for events, view event details, get directions, and set notifications for upcoming events.

## Features

- Search for local events by category, location, and date.
- View event details including title, description, date, location, and category.
- Display events on a map with markers.
- Get directions to event locations using Google Maps.
- Set notifications for upcoming events.
- Share events with others.

## Prerequisites

- Node.js and npm installed
- Ionic CLI installed
- Capacitor CLI installed
- Android Studio installed
- Google Maps API key
- PredictHQ API key

## Installation

1. Clone the repository:

```sh
git clone https://github.com/your-username/local-event-finder.git
cd event-finder
```

2. Install dependencies:

```sh
npm install
```

3. Add Capacitor to the project:

```sh
npx cap init
```

4. Add the Android platform:

```sh
npx cap add android
```

5. Configure the Google Maps API key:

- Open `src/index.html` and add your Google Maps API key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
```

6. Configure the PredictHQ API key:

- Open `src/environments/environment.ts` and add your PredictHQ API key:

```typescript
export const environment = {
  production: false,
  event_finder_api_key: 'YOUR_PREDICTHQ_API_KEY',
  event_finder_api_url: 'https://api.predicthq.com/v1/events'
};
```

## Running the App

1. Build the project:

```sh
npm run build
```

2. Sync the project with Capacitor:

```sh
npx cap sync
```

3. Open the project in Android Studio:

```sh
npx cap open android
```

4. Run the app on an Android emulator:

- In Android Studio, click on the "Run" button or press `Shift + F10` to build and run the app on the selected emulator.

## Usage

- Launch the app on your Android emulator.
- Drag and drop your location marker to search for events in different locations.
- Use the search bar to search for events with a query.
- Filter events by category.
- Sort events by alphabetical order, category, distance or date.
- Tap on an event marker on the map to view event details.
- Use the "Get Directions" button to open Google Maps with directions to the event location.
- Use the "Set Notification" button to schedule a notification for the event.
- Use the "Share Event" button to share the event with others.
- Mark local events to receive notification reminders ahead of time.
- Toggle dark mode and notifications on the settings page.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- [PredictHQ](https://www.predicthq.com/) for providing the event data API.
- [Google Maps](https://developers.google.com/maps) for providing the mapping API.
- [Ionic Framework](https://ionicframework.com/) for providing the mobile app framework.
- [Capacitor](https://capacitorjs.com/) for providing the native runtime for web apps.

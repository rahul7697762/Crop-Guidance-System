# Crop Guidance System - Frontend

This is the frontend for the Crop Guidance System, a web application that helps farmers with crop recommendations, weather forecasts, soil analysis, and market insights.

## Features

- User authentication (sign up, sign in, sign out)
- Responsive design for all devices
- Multi-language support
- Protected routes
- Form validation
- Error handling
- Modern UI with Tailwind CSS
- TypeScript support

## Tech Stack

- React 18
- TypeScript
- React Router v6
- Firebase Authentication
- Tailwind CSS
- React Hook Form
- React Icons
- Axios
- i18next (for internationalization)

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase project with Authentication enabled

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env` file in the project root with the following variables:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   REACT_APP_API_BASE_URL=your_api_base_url
   ```

## Available Scripts

In the project directory, you can run:

### `npm start` or `yarn start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test` or `yarn test`

Launches the test runner in interactive watch mode.

### `npm run build` or `yarn build`

Builds the app for production to the `build` folder.

### `npm run eject`

**Note: This is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

## Project Structure

```
src/
  ├── assets/               # Static assets (images, fonts, etc.)
  ├── components/           # Reusable UI components
  │   ├── common/           # Common components (buttons, inputs, etc.)
  │   └── layout/           # Layout components (header, footer, etc.)
  ├── pages/                # Page components
  │   ├── auth/             # Authentication pages
  │   └── dashboard/        # Dashboard pages
  ├── services/             # API services and utilities
  ├── hooks/                # Custom React hooks
  ├── contexts/             # React contexts
  ├── utils/                # Utility functions
  ├── types/                # TypeScript type definitions
  ├── i18n/                 # Internationalization files
  ├── App.tsx               # Main App component
  └── index.tsx             # Entry point
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

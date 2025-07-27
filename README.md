# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Overview

This UI allows you to monitor and control Debezium connectors via the REST API
exposed by a running Debezium Connect instance. Configure the host of your
Debezium service (e.g. `http://localhost:8083`) and you'll be able to view,
create, pause, resume and delete connectors directly from the browser.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

When the UI loads, navigate to **Change Host** in the top bar and enter the URL
of your Debezium Connect instance (e.g. `http://localhost:8083`). The host
setting is persisted in your browser so it is remembered on refresh. Once
connected, the dashboard will list all available connectors and allow you to
control them. Use the **Home** button in the top bar to quickly return to the
dashboard and refresh the connector list.

## Connector Configuration

The creation wizard automatically adds the required `topic.prefix` property to
new connectors. It also sets
`schema.history.internal.kafka.bootstrap.servers` to `kafka:9092` by default so
that MySQL connectors start without additional manual configuration.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

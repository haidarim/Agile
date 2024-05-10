
# RoadSafe Sweden

RoadSafe Sweden is a web application that provides real-time traffic information and displays it on a map. 
Users can select specific regions to view accident data, and the application visualizes this data on a map.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Usage](#usage)

## Features

- Real-time traffic information.
- Select specific regions to filter data.
- Interactive map with markers for accidents.
- Clustering of markers for improved map performance.
- Clicking on an accident in the table zooms to its location on the map.

## Technologies Used

- [React](https://reactjs.org/): Frontend framework for building the user interface.
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview): Used for map integration.
- [MarkerClustererPlus](https://github.com/googlemaps/v3-utility-library/tree/master/markerclustererplus): Library for clustering markers on the map.
- [Trafikverket API](https://www.trafikverket.se/): Provides real-time traffic data.

## Getting Started

To get started with this project, follow these steps:

1. Clone the repository: `git clone https://github.com/yourusername/roadsafe-sweden.git`
2. Navigate to the project folder: `cd my-app`
3. Install the necessary dependencies: `npm install`
4. Start and run the development server: `npm run start`

## Usage

1. Select a region from the dropdown menu to filter traffic data for that region.
2. The table displays accident information. Click on a row to zoom to the accident location on the map.
3. Interact with the map to explore accident locations by pressing marker clusters and accident markers.




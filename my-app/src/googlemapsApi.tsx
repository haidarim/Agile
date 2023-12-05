import React, { useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import {
  fetchApiData,
  ApiResponse,
  extractAndSwitchCoordinates,
  mapSearchInputToRegion,
  formatCreationTime,
} from "./apiConnection";
import MarkerClusterer from "@googlemaps/markerclustererplus";

// Calculate the average coordinates from the API data.
export const calculateAverageCoordinates = (data: ApiResponse[]) => {
  let totalLat = 0;
  let totalLng = 0;

  data.forEach((item) => {
    const coordinates = extractAndSwitchCoordinates(item.geometry);
    const [latitude, longitude] = coordinates.split(" ").map(Number);

    if (!isNaN(latitude) && !isNaN(longitude)) {
      totalLat += latitude;
      totalLng += longitude;
    } else {
      console.error("Invalid coordinates:", coordinates);
    }
  });

  if (data.length === 0) {
    console.error("Data is empty. Cannot calculate average coordinates.");
    return {
      avgLat: null,
      avgLng: null,
    };
  }

  return {
    avgLat: totalLat / data.length,
    avgLng: totalLng / data.length,
  };
};

// Define the props for the GoogleMapsApi component.
interface GoogleMapsApiProps {
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  searchInput: string;
  setMapInstance: React.Dispatch<React.SetStateAction<google.maps.Map | null>>;
}

// Initialize the previousInfoWindow variable to manage open info windows.
let previousInfoWindow: google.maps.InfoWindow;

// Define the GoogleMapsApi component.
function GoogleMapsApi({
  setSearchInput,
  searchInput,
  setMapInstance,
}: GoogleMapsApiProps) {
  // State to store API data.
  const [, setApiData] = useState<ApiResponse[]>([]);

  useEffect(() => {
    const mapElement = document.getElementById("map");

    if (!mapElement) {
      console.error("Element with id 'map' not found in the DOM.");
      return;
    }

    const API_KEY = "your google api key";
    const loader = new Loader({
      apiKey: API_KEY,
    });

    loader.load().then(async () => {
      try {
        // Define the geographical bounds of Sweden.
        const swedenBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(55.34, 11.14),
          new google.maps.LatLng(69.07, 24.19)
        );

        // Create the Google Map instance.
        const map = new google.maps.Map(mapElement, {
          center: { lat: 63, lng: 16 },
          restriction: {
            latLngBounds: swedenBounds,
            strictBounds: false,
          },
          minZoom: 4.75,
        });

        setMapInstance(map);

        // Determine the current region based on search input.
        // Define filters for the API request based on the current region.

        const currentRegion = mapSearchInputToRegion(searchInput);
        let filters;
        if (currentRegion === 0) {
          filters =
            `<GT name='Deviation.CreationTime' value='$dateadd(-2.00:15:00)'/>` +
            `<EQ name='Deviation.MessageType' value='Olycka'/>`;
        } else {
          filters =
            `<GT name='Deviation.CreationTime' value='$dateadd(-2.00:15:00)'/>` +
            `<EQ name='Deviation.MessageType' value='Olycka'/>` +
            `<EQ name='Deviation.CountyNo' value='${currentRegion}'/>`;
        }

        // Fetch data from the API based on the filters.
        const data: ApiResponse[] = await fetchApiData(filters);
        setApiData(data);

        // Initialize an array to store markers.
        const markers: google.maps.Marker[] = [];

        // Calculate and set the map center based on data.
        const calculateAndSetCenter = () => {
          // When there are no accidents the entire map is selected, show Sweden
          if (data.length === 0 || currentRegion === 0) {
            map.setCenter({ lat: 63, lng: 16 });
            map.setZoom(4);
          } else {
            const { avgLat, avgLng } = calculateAverageCoordinates(data);
            if (avgLat !== null && avgLng !== null) {
              map.setCenter({ lat: avgLat, lng: avgLng });
              map.setZoom(8);
            }
          }
        };

        // Create markers for each API data point.
        data.forEach((item: ApiResponse, index: number) => {
          const coordinates = extractAndSwitchCoordinates(item.geometry);
          const [latitude, longitude] = coordinates.split(" ");

          const marker = new google.maps.Marker({
            position: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
            map: map,
            title: `Marker ${index + 1}`,
          });

          markers.push(marker);

          // Create an InfoWindow to display accident details when a makrer id clicked.
          const infoWindow: google.maps.InfoWindow = new google.maps.InfoWindow(
            {
              content: `
      <div style="font-family: Arial, sans-serif; border: 1px solid #ccc; padding: 10px; background-color: #f9f9f9; max-width: 250px; border-radius: 8px;">
      <h4 style="margin-top: 0; color: #333;">Accident Details</h4>
      <hr style="margin: 10px 0;">
      <p><strong>Message:</strong> <span style="color: #007BFF;">${
        item.message
      }</span></p>
      <p><strong>Location:</strong> <span style="color: #007BFF;">${coordinates}</span></p>
      <p><strong>Severity:</strong> <span style="color: #007BFF;">${
        item.severity
      }</span></p>
      <p><strong>Creation Time:</strong> <span style="color: #007BFF;">${formatCreationTime(
        item.creationTime
      )}</span></p>
      </div>
      `,
            }
          );

          // Add a click event listener to each marker to display an info window.
          marker.addListener("click", () => {
            if (previousInfoWindow) {
              previousInfoWindow.close();
            }
            previousInfoWindow = infoWindow;
            infoWindow.open(map, marker);
            map.setZoom(14);
            map.panTo(marker.getPosition()!);
          });
        });

        // Configure marker clustering options.
        const options = {
          imagePath:
            "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
          gridSize: 50,
          maxZoom: 15,
        };

        // Create a marker cluster with the markers.
        const markerCluster = new MarkerClusterer(map, markers, options);

        // Calculate and set the map center.
        calculateAndSetCenter();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    });
  }, [searchInput, setMapInstance]);

  return (
    <div>
      <div id="map" style={{ width: "100%", height: "80vh" }} />
    </div>
  );
}

export default GoogleMapsApi;

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import * as Regions from './Regions.json';

// Type Definitions
interface RegionMapping {
  [key: string]: number;
}

// Interface defining the shape of API response data
export interface ApiResponse {
  message: string;
  locationDescriptor: string;
  creationTime: string;
  geometry: string;
  region: number;
  severity: string;
}

const { regions, regionMapping }: { regions: string[], regionMapping: RegionMapping } = Regions;

// API Constants
const API_URL = "https://api.trafikinfo.trafikverket.se/v2/data.json";
const API_HEADERS = {
  "Content-Type": "application/xml",
};

// Function to fetch data from the API
  export const fetchApiData = async (filters: string): Promise<ApiResponse[]> => {
     try {
    const xmlPayload =
      "<REQUEST>" +
      "<LOGIN authenticationkey='efde0eae7f8e4dd7a12dea7b58134e2c'/>" +
      "<QUERY objecttype='Situation' schemaversion='1.5' includedeletedobjects='true'>" +
      "<FILTER>" +
      filters +
      "</FILTER>" +
      "<INCLUDE>Deviation.CreationTime</INCLUDE>" +
      "<INCLUDE>Deviation.MessageType</INCLUDE>" +
      "<INCLUDE>Deviation.Message</INCLUDE>" +
      "<INCLUDE>Deviation.SeverityText</INCLUDE>" +
      "<INCLUDE>Deviation.Geometry.Point.WGS84</INCLUDE>" +
      "<INCLUDE>Deviation.LocationDescriptor</INCLUDE>" +
      "</QUERY>" +
      "</REQUEST>";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: API_HEADERS,
      body: xmlPayload,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const responseData = await response.json();

    // Extract each "Situation" item from the API responseData and map them into the apiData array which consists of ApiResponse objects
    const apiData: ApiResponse[] =
    responseData.RESPONSE.RESULT[0].Situation.map((situation: any) => ({
    message: situation.Deviation[0].Message,
    locationDescriptor: situation.Deviation[0].LocationDescriptor,
    geometry: situation.Deviation[0].Geometry["Point"]["WGS84"],
    creationTime: situation.Deviation[0].CreationTime,
    region: situation.Deviation[0].CountyNo,
    severity: situation.Deviation[0].SeverityText,
    })).reverse();

    return apiData;
  } catch (error) {
    throw error;
  }
    };

  // Function that formats the time from 2023-09-14T00:15:04.620+02:00 to 14/9/2023, 00:15:04
  export const formatCreationTime = (isoTimestamp: string) => {
  const date = new Date(isoTimestamp);
  return date.toLocaleString();
    };

  // Function that removes "POINT" and switches langitude and latitude because to open them in maps it was reversed
  export const extractAndSwitchCoordinates = (geometry: string) => {
  const [longitude, latitude] = geometry
    .replace("POINT (", "")
    .replace(")", "")
    .split(" ");
  return `${latitude} ${longitude}`;
  };

  // A function to map search input to region code
  export const mapSearchInputToRegion = (input: string): number => {
  return regionMapping[input] || 0;
  };

  interface ApiConnectionProps {
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  // SearchInput prop
  searchInput: string; 
  // Add mapInstance as a prop
  mapInstance: google.maps.Map | null; 
    }

  export const ApiConnection: React.FC<ApiConnectionProps> = ({
  setSearchInput,
  searchInput,
  mapInstance,
  }) => {
  const [data, setData] = useState<ApiResponse[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<string>(""); // State variable to store filters
  const [region, setRegion] = useState<number>(0);

  // Event handler to update the searchInput state variable and region
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const inputValue = e.target.value;
  setSearchInput(inputValue); 

  // Map the input to a region code
  const region = mapSearchInputToRegion(inputValue);
  setRegion(region);
    };


  useEffect(() => {
  // Function to fetch data and update state
  const fetchData = async () => {
         try {
  // Update filters based on the search input
      let filters;
      if (region === 0) {
      filters =
      `<GT name='Deviation.CreationTime' value='$dateadd(-2.00:15:00)'/>` +
      `<EQ name='Deviation.MessageType' value='Olycka'/>`;
          setFilters(filters); 
        } else {
      filters =
      `<GT name='Deviation.CreationTime' value='$dateadd(-2.00:15:00)'/>` +
      `<EQ name='Deviation.MessageType' value='Olycka'/>` +
      `<EQ name='Deviation.CountyNo' value='${region}'/>`;
      // Set the updated filters in state
      setFilters(filters); 
        }


  const apiData: ApiResponse[] = await fetchApiData(filters);
  setData(apiData);
  setLoading(false);
  } catch (err: any) {
  setError(err.message || "An error occurred");
  setLoading(false);
      }
      };

  fetchData();
   }, [searchInput, region]);

  // Function to render table rows based on the data
  const renderTableRows = () => {
    if (!data) {
    return null;
    }

    const handleTableRowClick = (geometry: string) => {
      // Extract latitude and longitude from the geometry field
      const coordinates = extractAndSwitchCoordinates(geometry);
      const [latitude, longitude] = coordinates.split(" ");

      // Use the map to zoom to the clicked accident's coordinates
      if (mapInstance) {
          mapInstance.setZoom(14); 
          mapInstance.panTo(
          new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude))
            );
          }
        };

    return data.map((item: ApiResponse, index: number) => (
        <tr key={index} onClick={() => handleTableRowClick(item.geometry)}>
        <td>{item.message}</td>
        <td>{item.locationDescriptor}</td>
        <td>{formatCreationTime(item.creationTime)}</td>
        </tr>
    ));
        };

  return (
    <div>
      {/* Search field for traffic information */}
      <div className="search-container">
        <select
          className="search-input"
          value={searchInput}
          onChange={handleRegionChange}
        >
          <option value="">Select a region</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Information</th>
                <th>Location</th>
                <th>Creation Time</th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
      )}
    </div>
    );
  };

  export default ApiConnection;

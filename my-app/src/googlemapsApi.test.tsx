import { calculateAverageCoordinates } from "./googlemapsApi";
import {
  fetchApiData,
  extractAndSwitchCoordinates,
  ApiResponse,
} from "./apiConnection";

//helper function, generates random strings
function calculateAverageNumbers(data: ApiResponse[]) {
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
}

test("TestingCalculateAverageCoordinates", async () => {
  let filters =
    `<GT name='Deviation.CreationTime' value='$dateadd(-2.00:15:00)'/>` +
    `<EQ name='Deviation.MessageType' value='Olycka'/>`;
  let data: ApiResponse[] = await fetchApiData(filters);

  expect(calculateAverageCoordinates(data)).toEqual(
    calculateAverageNumbers(data)
  );
});

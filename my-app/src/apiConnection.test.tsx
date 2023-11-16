import {
  fetchApiData,
  extractAndSwitchCoordinates,
  mapSearchInputToRegion,
  ApiResponse,
} from "./apiConnection";

/*extractAndSwitchCoordinatesTest
 *   case: If the method/function gives right output.
 */

//helper function, generates random strings
function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

test("extractAndSwitchCoordinatesTest", () => {
  let i = 0;
  let latitude: string;
  let longitude: string;
  let tested: string;
  while (i <= 1000) {
    longitude = generateRandomString(1000);
    latitude = generateRandomString(1000);
    tested = latitude + " " + longitude;
    expect(extractAndSwitchCoordinates(longitude + " " + latitude)).toBe(
      tested
    );
    i++;
  }
});

const regionsNo = [
  1, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 17, 18, 19, 20, 21, 22, 23, 24, 25,
];

const regions = [
  "Stockholms län",
  "Uppsala län",
  "Södermanlands län",
  "Östergötlands län",
  "Jönköpings län",
  "Kronobergs län",
  "Kalmar län",
  "Gotlands län",
  "Blekinge län",
  "Skåne län",
  "Hallands län",
  "Västra Götalands län",
  "Värmlands län",
  "Örebro län",
  "Västmanlands län",
  "Dalarnas län",
  "Gävleborgs län",
  "Västernorrlands län",
  "Jämtlands län",
  "Västerbottens län",
  "Norrbottens län",
];

//ApiConnection Component test
// case: give some input value and check if the data becomes updated!
test("ApiConnection component", () => {
  let i = 0;
  regions.forEach(async (e) => {
    let filters =
      `<GT name='Deviation.CreationTime' value='$dateadd(-2.00:15:00)'/>` +
      `<EQ name='Deviation.MessageType' value='Olycka'/>` +
      `<EQ name='Deviation.CountyNo' value='${e}'/>`;
    let apiData: ApiResponse[] = await fetchApiData(filters);
    apiData.forEach((item) => {
      expect(item.region).toBe(regionsNo[i]);
    });
    i++;
  });
});

//mapSearchInputtoRegionTest:
test("mapSearchInputToRegion", () => {
  let i = 0;
  regions.forEach((e) => {
    let tested: boolean = mapSearchInputToRegion(e) === regionsNo[i];
    expect(tested).toBe(true);
    i++;
  });
});

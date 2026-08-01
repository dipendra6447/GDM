export interface CityData {
  name: string;
  defaultZip: string;
}

export interface StateData {
  code: string;
  name: string;
  cities: CityData[];
}

export interface CountryData {
  code: string;
  name: string;
  states: StateData[];
}

export const COUNTRIES_DATA: CountryData[] = [
  {
    code: "US",
    name: "United States",
    states: [
      {
        code: "CA",
        name: "California",
        cities: [
          { name: "San Francisco", defaultZip: "94105" },
          { name: "Los Angeles", defaultZip: "90001" },
          { name: "San Jose", defaultZip: "95110" },
          { name: "San Diego", defaultZip: "92101" },
          { name: "Sacramento", defaultZip: "95814" },
          { name: "Palo Alto", defaultZip: "94301" },
          { name: "Irvine", defaultZip: "92602" },
          { name: "Oakland", defaultZip: "94601" },
          { name: "Fresno", defaultZip: "93650" }
        ]
      },
      {
        code: "NY",
        name: "New York",
        cities: [
          { name: "New York City", defaultZip: "10001" },
          { name: "Buffalo", defaultZip: "14201" },
          { name: "Rochester", defaultZip: "14604" },
          { name: "Albany", defaultZip: "12207" },
          { name: "Syracuse", defaultZip: "13202" },
          { name: "Yonkers", defaultZip: "10701" }
        ]
      },
      {
        code: "TX",
        name: "Texas",
        cities: [
          { name: "Austin", defaultZip: "78701" },
          { name: "Houston", defaultZip: "77001" },
          { name: "Dallas", defaultZip: "75201" },
          { name: "San Antonio", defaultZip: "78201" },
          { name: "Fort Worth", defaultZip: "76101" },
          { name: "El Paso", defaultZip: "79901" }
        ]
      },
      {
        code: "FL",
        name: "Florida",
        cities: [
          { name: "Miami", defaultZip: "33101" },
          { name: "Orlando", defaultZip: "32801" },
          { name: "Tampa", defaultZip: "33601" },
          { name: "Jacksonville", defaultZip: "32201" },
          { name: "Fort Lauderdale", defaultZip: "33301" },
          { name: "Tallahassee", defaultZip: "32301" }
        ]
      },
      {
        code: "WA",
        name: "Washington",
        cities: [
          { name: "Seattle", defaultZip: "98101" },
          { name: "Bellevue", defaultZip: "98004" },
          { name: "Redmond", defaultZip: "98052" },
          { name: "Tacoma", defaultZip: "98401" },
          { name: "Spokane", defaultZip: "99201" }
        ]
      },
      {
        code: "IL",
        name: "Illinois",
        cities: [
          { name: "Chicago", defaultZip: "60601" },
          { name: "Naperville", defaultZip: "60540" },
          { name: "Aurora", defaultZip: "60502" },
          { name: "Springfield", defaultZip: "62701" }
        ]
      },
      {
        code: "MA",
        name: "Massachusetts",
        cities: [
          { name: "Boston", defaultZip: "02108" },
          { name: "Cambridge", defaultZip: "02138" },
          { name: "Worcester", defaultZip: "01601" },
          { name: "Springfield", defaultZip: "01101" }
        ]
      },
      {
        code: "GA",
        name: "Georgia",
        cities: [
          { name: "Atlanta", defaultZip: "30301" },
          { name: "Savannah", defaultZip: "31401" },
          { name: "Augusta", defaultZip: "30901" }
        ]
      },
      {
        code: "NC",
        name: "North Carolina",
        cities: [
          { name: "Charlotte", defaultZip: "28201" },
          { name: "Raleigh", defaultZip: "27601" },
          { name: "Durham", defaultZip: "27701" }
        ]
      },
      {
        code: "CO",
        name: "Colorado",
        cities: [
          { name: "Denver", defaultZip: "80201" },
          { name: "Boulder", defaultZip: "80301" },
          { name: "Colorado Springs", defaultZip: "80901" }
        ]
      }
    ]
  },
  {
    code: "CA",
    name: "Canada",
    states: [
      {
        code: "ON",
        name: "Ontario",
        cities: [
          { name: "Toronto", defaultZip: "M5H 2N2" },
          { name: "Ottawa", defaultZip: "K1P 1J1" },
          { name: "Mississauga", defaultZip: "L5B 1M2" }
        ]
      },
      {
        code: "BC",
        name: "British Columbia",
        cities: [
          { name: "Vancouver", defaultZip: "V6B 1A1" },
          { name: "Victoria", defaultZip: "V8W 1P6" },
          { name: "Burnaby", defaultZip: "V5H 4M2" }
        ]
      },
      {
        code: "QC",
        name: "Quebec",
        cities: [
          { name: "Montreal", defaultZip: "H3B 1A1" },
          { name: "Quebec City", defaultZip: "G1R 2L3" }
        ]
      }
    ]
  },
  {
    code: "UK",
    name: "United Kingdom",
    states: [
      {
        code: "ENG",
        name: "England",
        cities: [
          { name: "London", defaultZip: "EC1A 1BB" },
          { name: "Manchester", defaultZip: "M1 1AG" },
          { name: "Birmingham", defaultZip: "B1 1AA" }
        ]
      },
      {
        code: "SCT",
        name: "Scotland",
        cities: [
          { name: "Edinburgh", defaultZip: "EH1 1YZ" },
          { name: "Glasgow", defaultZip: "G1 1XQ" }
        ]
      }
    ]
  },
  {
    code: "IN",
    name: "India",
    states: [
      {
        code: "MH",
        name: "Maharashtra",
        cities: [
          { name: "Mumbai", defaultZip: "400001" },
          { name: "Pune", defaultZip: "411001" }
        ]
      },
      {
        code: "KA",
        name: "Karnataka",
        cities: [
          { name: "Bengaluru", defaultZip: "560001" },
          { name: "Mysuru", defaultZip: "570001" }
        ]
      },
      {
        code: "DL",
        name: "Delhi",
        cities: [
          { name: "New Delhi", defaultZip: "110001" }
        ]
      }
    ]
  }
];

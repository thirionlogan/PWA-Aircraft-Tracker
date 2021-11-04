import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  Popup,
  useMap,
  Tooltip,
} from 'react-leaflet';
import { icon } from 'leaflet';
import { getAllStates } from '../../client';

interface AircraftState {
  icao24: string;
  callsign: string;
  origin_country: string;
  time_position: number;
  last_contact: number;
  longitude: number;
  latitude: number;
  baro_altitude: number;
  on_ground: boolean;
  velocity: number;
  true_track: number;
  vertical_rate: number;
  sensors: number[];
  geo_altitude: number;
  squawk: string;
  spi: boolean;
  position_source: number;
}

const stateToObject = ([
  icao24,
  callsign,
  origin_country,
  time_position,
  last_contact,
  longitude,
  latitude,
  baro_altitude,
  on_ground,
  velocity,
  true_track,
  vertical_rate,
  sensors,
  geo_altitude,
  squawk,
  spi,
  position_source,
]: [
  string,
  string,
  string,
  number,
  number,
  number,
  number,
  number,
  boolean,
  number,
  number,
  number,
  number[],
  number,
  string,
  boolean,
  number
]): AircraftState => ({
  icao24,
  callsign,
  origin_country,
  time_position,
  last_contact,
  longitude,
  latitude,
  baro_altitude,
  on_ground,
  velocity,
  true_track,
  vertical_rate,
  sensors,
  geo_altitude,
  squawk,
  spi,
  position_source,
});

function CurrentPositionMarker({
  currentLocation,
}: {
  currentLocation: GeolocationPosition | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      currentLocation?.coords
        ? [currentLocation.coords.latitude, currentLocation.coords.longitude]
        : [40.7608, -111.891]
    );
  }, [currentLocation]);
  return currentLocation?.coords ? (
    <Marker
      position={[
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
      ]}
    >
      <Popup>
        <ul>
          <li>Current Position:</li>
          <li>Latitude: {currentLocation.coords.latitude}</li>
          <li>Longitude: {currentLocation.coords.longitude}</li>
        </ul>
      </Popup>
      <Tooltip>Current Position</Tooltip>
    </Marker>
  ) : null;
}

function Map() {
  const [markers, setMarkers] = useState<AircraftState[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition>();

  const loadStates = () => {
    getAllStates()
      .then(({ data: { states } }) => {
        const aircraft = states
          .map(stateToObject)
          .filter(
            ({ on_ground, latitude, longitude }: AircraftState) =>
              !on_ground && !!latitude && !!longitude
          );

        setMarkers(aircraft);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadStates();
    const intervalId = setInterval(loadStates, 60 * 1000);
    navigator.geolocation.getCurrentPosition((geolocationPosition) => {
      setCurrentLocation(geolocationPosition);
    });

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const airplaneIcon = icon({
    iconUrl: 'airplane.svg',
    iconAnchor: [32, 32],
  });
  return (
    <div>
      <MapContainer
        center={[40.7608, -111.891]}
        zoom={13}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <CurrentPositionMarker currentLocation={currentLocation} />
        {markers.map(
          ({
            icao24,
            latitude,
            longitude,
            callsign,
            velocity,
            baro_altitude,
          }) => (
            <Marker
              key={icao24}
              position={[latitude, longitude]}
              icon={airplaneIcon}
            >
              <Popup>
                <ul>
                  <li>Callsign: {callsign}</li>
                  <li>Latitude: {latitude}</li>
                  <li>Longitude: {longitude}</li>
                  {velocity ? <li>Velocity: {velocity} m/s</li> : null}
                  {baro_altitude ? (
                    <li>
                      Barometric Altitude:{' '}
                      {(baro_altitude as number).toLocaleString()} meters
                    </li>
                  ) : null}
                </ul>
              </Popup>
              <Tooltip>{callsign}</Tooltip>
            </Marker>
          )
        )}
      </MapContainer>
    </div>
  );
}

export default Map;

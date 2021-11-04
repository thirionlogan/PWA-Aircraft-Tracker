import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet';
import { icon } from 'leaflet';
import { getAllStates } from '../../client';

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
]) => ({
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

function Map() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    getAllStates().then(({ data: { states } }) => {
      const aircraft = states
        .map(stateToObject)
        .filter(
          ({
            on_ground,
            latitude,
            longitude,
          }: {
            on_ground: boolean;
            latitude: number;
            longitude: number;
          }) => !on_ground && !!latitude && !!longitude
        );

      setMarkers(aircraft);
    });
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
              </Popup>{' '}
            </Marker>
          )
        )}
      </MapContainer>
    </div>
  );
}

export default Map;

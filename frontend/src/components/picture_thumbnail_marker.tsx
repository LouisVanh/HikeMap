'use client';

import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

export type PictureWithData = {
  pic_id: string;
  pic_url_preview: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
};

interface Props {
  pictures: PictureWithData[];
}

export default function PictureThumbnailMarkers({ pictures }: Props) {
  return (
    <>
      {pictures.map(pic => {
        const [lng, lat] = pic.location.coordinates;

        const icon = L.divIcon({
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          html: `
            <div class="thumbnail-marker">
              <img src="${pic.pic_url_preview}" alt="Nature picture" />
            </div>
          `,
        });

        return (
          <Marker
            key={pic.pic_id}
            position={[lat, lng]}
            icon={icon}
          />
        );
      })}
    </>
  );
}


import { openDB } from 'idb';

const DB_NAME = 'hikemap-db';
const DB_VERSION = 1;

export const getHikeDb = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('locations')) {
                db.createObjectStore('locations', { keyPath: 'timestamp' });
            }
            if (!db.objectStoreNames.contains('photos')) {
                db.createObjectStore('photos', { autoIncrement: true });
            }
        },
    });
};

export const saveLocation = async (lat: number, lng: number) => {
    const db = await getHikeDb();
    await db.put('locations', {
        lat,
        lng,
        timestamp: Date.now(),
    });
};

export const savePhoto = async (image: File, lat: number, lng: number, type: 'regular' | 'food') => {
    const db = await getHikeDb();
    await db.add('photos', {
        image,
        lat,
        lng,
        type,
        timestamp: Date.now(),
    });
};

export const getAllLocations = async () => {
    const db = await getHikeDb();
    return db.getAll('locations');
};

export const getAllPhotos = async () => {
    const db = await getHikeDb();
    return db.getAll('photos');
};

export const clearHikeData = async () => {
    const db = await getHikeDb();
    await db.clear('locations');
    await db.clear('photos');
};

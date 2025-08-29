import path from 'path';

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

export const APP_DOMAIN = {
  APP_DOMAIN: 'APP_DOMAIN',
};

export const JWT = {
  JWT_SECRET: 'JWT_SECRET',
};

export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp');
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');

export const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const THIRTY_DAYS = 24 * 60 * 60 * 1000 * 30; 



import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Cegah Font Awesome menambahkan CSS secara otomatis saat runtime untuk menghindari FOUC di Next.js
config.autoAddCss = false;

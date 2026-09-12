'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faHouse,
  faUser,
  faGraduationCap,
  faCode,
  faLaptopCode,
  faBriefcase,
  faCertificate,
  faEnvelope,
  faPlus,
  faPenToSquare,
  faTrashCan,
  faCircleCheck,
  faArrowUpRightFromSquare,
  faCircleXmark,
  faEye,
  faBars,
  faXmark,
  faPalette,
  faDatabase,
  faServer,
  faSpinner,
  faGaugeHigh,
  faUserGear,
  faInbox,
  faSun,
  faMoon,
  faRightFromBracket,
  faPhone,
  faLocationDot,
  faDownload,
  faCheck,
  faSliders,
  faLayerGroup,
  faCalendarCheck,
  faGlobe,
  faImage,
  faCloudArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import {
  faReact,
  faNodeJs,
  faGithub,
  faLinkedin,
  faDocker,
  faPython,
  faJs,
  faHtml5,
  faCss3Alt,
  faWhatsapp,
} from '@fortawesome/free-brands-svg-icons';

const ICON_MAP: Record<string, IconDefinition> = {
  // Solid
  'fa-solid fa-house': faHouse,
  'fa-solid fa-user': faUser,
  'fa-solid fa-graduation-cap': faGraduationCap,
  'fa-solid fa-code': faCode,
  'fa-solid fa-laptop-code': faLaptopCode,
  'fa-solid fa-briefcase': faBriefcase,
  'fa-solid fa-certificate': faCertificate,
  'fa-solid fa-envelope': faEnvelope,
  'fa-solid fa-plus': faPlus,
  'fa-solid fa-pen-to-square': faPenToSquare,
  'fa-solid fa-trash-can': faTrashCan,
  'fa-solid fa-circle-check': faCircleCheck,
  'fa-solid fa-arrow-up-right-from-square': faArrowUpRightFromSquare,
  'fa-solid fa-circle-xmark': faCircleXmark,
  'fa-solid fa-eye': faEye,
  'fa-solid fa-bars': faBars,
  'fa-solid fa-xmark': faXmark,
  'fa-solid fa-palette': faPalette,
  'fa-solid fa-database': faDatabase,
  'fa-solid fa-server': faServer,
  'fa-solid fa-spinner': faSpinner,
  'fa-solid fa-gauge-high': faGaugeHigh,
  'fa-solid fa-user-gear': faUserGear,
  'fa-solid fa-inbox': faInbox,
  'fa-solid fa-sun': faSun,
  'fa-solid fa-moon': faMoon,
  'fa-solid fa-right-from-bracket': faRightFromBracket,
  'fa-solid fa-phone': faPhone,
  'fa-solid fa-location-dot': faLocationDot,
  'fa-solid fa-download': faDownload,
  'fa-solid fa-check': faCheck,
  'fa-solid fa-sliders': faSliders,
  'fa-solid fa-layer-group': faLayerGroup,
  'fa-solid fa-calendar-check': faCalendarCheck,
  'fa-solid fa-globe': faGlobe,
  'fa-solid fa-image': faImage,
  'fa-solid fa-cloud-arrow-up': faCloudArrowUp,

  // Brands
  'fa-brands fa-react': faReact,
  'fa-brands fa-node-js': faNodeJs,
  'fa-brands fa-github': faGithub,
  'fa-brands fa-linkedin': faLinkedin,
  'fa-brands fa-docker': faDocker,
  'fa-brands fa-python': faPython,
  'fa-brands fa-js': faJs,
  'fa-brands fa-html5': faHtml5,
  'fa-brands fa-css3-alt': faCss3Alt,
  'fa-brands fa-whatsapp': faWhatsapp,
};

interface VIconProps {
  name: string;
  className?: string;
  spin?: boolean;
}

export function VIcon({ name, className = '', spin = false }: VIconProps) {
  const icon = ICON_MAP[name] || (name.startsWith('fa-brands') ? faCode : faCode);

  return (
    <FontAwesomeIcon
      icon={icon}
      className={className}
      spin={spin || name.includes('fa-spin')}
      aria-hidden="true"
    />
  );
}

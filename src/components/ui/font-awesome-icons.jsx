"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAtom,
  faBeaker,
  faBookOpen,
  faBrain,
  faBullseye,
  faChartLine,
  faChevronDown,
  faClock,
  faFilter,
  faFire,
  faFlask,
  faGamepad,
  faGear,
  faGraduationCap,
  faMagnifyingGlass,
  faMedal,
  faMicroscope,
  faPercent,
  faRankingStar,
  faShapes,
  faSquareRootVariable,
  faTrophy,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  faBookmark,
  faCircleCheck,
  faFileLines,
  faLightbulb,
} from "@fortawesome/free-regular-svg-icons";

export const prepziiIcons = {
  achievements: faMedal,
  analytics: faChartLine,
  battle: faGamepad,
  biology: faMicroscope,
  chemistry: faFlask,
  chapter: faBookOpen,
  completed: faCircleCheck,
  discount: faPercent,
  filters: faFilter,
  formulaCards: faLightbulb,
  leaderboard: faRankingStar,
  maths: faSquareRootVariable,
  navigation: faChevronDown,
  physics: faAtom,
  profile: faUser,
  pyq: faFileLines,
  saved: faBookmark,
  search: faMagnifyingGlass,
  settings: faGear,
  streak: faFire,
  target: faBullseye,
  tests: faBrain,
  timer: faClock,
  trophy: faTrophy,
  apparatus: faBeaker,
  subjects: faShapes,
  learning: faGraduationCap,
};

export function PrepZiiIcon({ icon, className = "", title, ...props }) {
  return (
    <FontAwesomeIcon
      icon={icon}
      className={className}
      title={title}
      aria-hidden={title ? undefined : "true"}
      {...props}
    />
  );
}

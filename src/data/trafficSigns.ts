// Indian Traffic Signs Database - Based on Indian Road Safety Handbook

export interface TrafficSign {
  id: string;
  name: string;
  category: 'mandatory' | 'cautionary' | 'informative';
  description: string;
  shape: 'circular' | 'triangular' | 'rectangular' | 'octagonal';
  backgroundColor: string;
  textColor: string;
  rule: string;
  penalty?: string;
  iconName: string; // Lucide icon name for simulation
}

export const INDIAN_TRAFFIC_SIGNS: TrafficSign[] = [
  // Mandatory Signs (Circular - Red Border, White Background)
  {
    id: 'stop',
    name: 'Stop Sign',
    category: 'mandatory',
    description: 'Complete stop required before proceeding',
    shape: 'octagonal',
    backgroundColor: '#DC2626',
    textColor: '#FFFFFF',
    rule: 'Come to a complete stop before the stop line or intersection',
    penalty: '₹500 fine and/or 3 months imprisonment',
    iconName: 'OctagonStop'
  },
  {
    id: 'no-entry',
    name: 'No Entry',
    category: 'mandatory',
    description: 'Entry prohibited for all vehicles',
    shape: 'circular',
    backgroundColor: '#FFFFFF',
    textColor: '#DC2626',
    rule: 'No vehicle shall enter this area',
    penalty: '₹1000 fine for wrong way driving',
    iconName: 'Ban'
  },
  {
    id: 'speed-limit-40',
    name: 'Speed Limit 40',
    category: 'mandatory',
    description: 'Maximum speed limit 40 km/h',
    shape: 'circular',
    backgroundColor: '#FFFFFF',
    textColor: '#DC2626',
    rule: 'Do not exceed 40 km/h speed limit',
    penalty: '₹1000-2000 for over-speeding',
    iconName: 'Gauge'
  },
  {
    id: 'no-overtaking',
    name: 'No Overtaking',
    category: 'mandatory',
    description: 'Overtaking prohibited',
    shape: 'circular',
    backgroundColor: '#FFFFFF',
    textColor: '#DC2626',
    rule: 'Overtaking is not permitted in this zone',
    penalty: '₹1000 fine for dangerous overtaking',
    iconName: 'ArrowRightLeft'
  },

  // Cautionary Signs (Triangular - Red Border, White Background)
  {
    id: 'sharp-turn-left',
    name: 'Sharp Turn Left',
    category: 'cautionary',
    description: 'Sharp left turn ahead - reduce speed',
    shape: 'triangular',
    backgroundColor: '#FFFFFF',
    textColor: '#DC2626',
    rule: 'Reduce speed and take caution for sharp left turn',
    iconName: 'TurnLeft'
  },
  {
    id: 'sharp-turn-right',
    name: 'Sharp Turn Right',
    category: 'cautionary',
    description: 'Sharp right turn ahead - reduce speed',
    shape: 'triangular',
    backgroundColor: '#FFFFFF',
    textColor: '#DC2626',
    rule: 'Reduce speed and take caution for sharp right turn',
    iconName: 'TurnRight'
  },
  {
    id: 'school-zone',
    name: 'School Zone',
    category: 'cautionary',
    description: 'School ahead - drive carefully',
    shape: 'triangular',
    backgroundColor: '#FFFFFF',
    textColor: '#DC2626',
    rule: 'Reduce speed to 25 km/h in school zones during school hours',
    penalty: '₹1000 fine for over-speeding in school zone',
    iconName: 'GraduationCap'
  },
  {
    id: 'pedestrian-crossing',
    name: 'Pedestrian Crossing',
    category: 'cautionary',
    description: 'Pedestrian crossing ahead',
    shape: 'triangular',
    backgroundColor: '#FFFFFF',
    textColor: '#DC2626',
    rule: 'Give way to pedestrians at zebra crossing',
    penalty: '₹500 fine for not giving way to pedestrians',
    iconName: 'Users'
  },

  // Informative Signs (Rectangular - Blue Background, White Text)
  {
    id: 'hospital',
    name: 'Hospital',
    category: 'informative',
    description: 'Hospital nearby',
    shape: 'rectangular',
    backgroundColor: '#2563EB',
    textColor: '#FFFFFF',
    rule: 'Hospital services available nearby',
    iconName: 'Cross'
  },
  {
    id: 'parking',
    name: 'Parking',
    category: 'informative',
    description: 'Parking area available',
    shape: 'rectangular',
    backgroundColor: '#2563EB',
    textColor: '#FFFFFF',
    rule: 'Designated parking area',
    iconName: 'Car'
  },
  {
    id: 'fuel-station',
    name: 'Fuel Station',
    category: 'informative',
    description: 'Fuel station ahead',
    shape: 'rectangular',
    backgroundColor: '#2563EB',
    textColor: '#FFFFFF',
    rule: 'Fuel station services available',
    iconName: 'Fuel'
  }
];

export const SPEED_LIMITS = [20, 25, 30, 40, 50, 60, 70, 80, 100];

export const LANE_DETECTION_RULES = {
  laneWidth: { min: 3.0, max: 3.75 }, // meters
  laneMarkings: {
    solid: 'No crossing allowed',
    dashed: 'Crossing allowed when safe',
    doubleSolid: 'Absolutely no crossing'
  },
  safeFollowingDistance: {
    city: 3, // seconds
    highway: 4 // seconds
  }
};

export const ROAD_SAFETY_RULES = [
  {
    id: 'seatbelt',
    title: 'Seat Belt Usage',
    description: 'All occupants must wear seat belts',
    penalty: '₹1000 fine'
  },
  {
    id: 'helmet',
    title: 'Helmet for Two-Wheelers',
    description: 'Both rider and pillion must wear ISI marked helmets',
    penalty: '₹1000 fine and/or 3 months imprisonment'
  },
  {
    id: 'mobile-phone',
    title: 'Mobile Phone Usage',
    description: 'Using mobile phone while driving is prohibited',
    penalty: '₹5000 fine for first offense'
  }
];
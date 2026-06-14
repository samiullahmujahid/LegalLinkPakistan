export interface LocationData {
  [province: string]: {
    [district: string]: string[];
  };
}

export const pakistanLocations: LocationData = {
  'Punjab': {
    'Sialkot': ['Sialkot', 'Daska', 'Pasrur', 'Sambrial'],
    'Lahore': ['Lahore Cantonment', 'Lahore City', 'Model Town', 'Shalimar', 'Raiwind'],
    'Rawalpindi': ['Rawalpindi', 'Gujar Khan', 'Taxila', 'Kahuta', 'Kallar Syedan', 'Murree', 'Kotli Sattian'],
    'Faisalabad': ['Faisalabad City', 'Faisalabad Sadar', 'Chak Jhumra', 'Jaranwala', 'Samundri', 'Tandlianwala'],
    'Gujranwala': ['Gujranwala City', 'Gujranwala Sadar', 'Kamoke', 'Nowshera Virkan', 'Wazirabad'],
    'Multan': ['Multan City', 'Multan Sadar', 'Shujabad', 'Jalalpur Pirwala'],
    'Sargodha': ['Sargodha', 'Bhalwal', 'Shahpur', 'Sillanwali', 'Kot Momin'],
    'Bahawalpur': ['Bahawalpur', 'Ahmadpur East', 'Hasilpur', 'Yazman', 'Khairpur Tamewali'],
  },
  'Sindh': {
    'Karachi': ['Karachi Central', 'Karachi East', 'Karachi South', 'Karachi West', 'Korangi', 'Malir', 'Keamari'],
    'Hyderabad': ['Hyderabad City', 'Hyderabad Latifabad', 'Qasimabad', 'Hyderabad Rural'],
    'Sukkur': ['Sukkur City', 'Rohri', 'Pano Aqil', 'Salehpat'],
    'Larkana': ['Larkana', 'Ratodero', 'Dokri', 'Bakrani'],
    'Mirpur Khas': ['Mirpur Khas', 'Digri', 'Kotli Ghulam Mohammad'],
  },
  'Balochistan': {
    'Quetta': ['Quetta City', 'Quetta Sadar'],
    'Gwadar': ['Gwadar', 'Pasni', 'Ormara', 'Jiwani'],
    'Khuzdar': ['Khuzdar', 'Wadh', 'Nal', 'Zehri'],
    'Loralai': ['Loralai', 'Duki'],
  },
  'KPK': {
    'Peshawar': ['Peshawar City', 'Peshawar Sadar', 'Shah Alam', 'Badbher'],
    'Abbottabad': ['Abbottabad', 'Havelian'],
    'Mardan': ['Mardan', 'Takht Bhai', 'Katlang'],
    'Swat': ['Babuzai', 'Kabal', 'Barikot', 'Matta', 'Khwazakhela'],
    'Dera Ismail Khan': ['Dera Ismail Khan', 'Paharpur', 'Kulachi'],
  },
  'Balochistan ': { // Trim-handling case
    'Quetta': ['Quetta City', 'Quetta Sadar'],
  },
  'ICT': {
    'Islamabad': ['Islamabad']
  }
};

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { pakistanLocations } from '../../utils/locationsData';

interface LocationSelectorProps {
  province: string;
  district: string;
  tehsil: string; // maps to city
  onProvinceChange: (province: string) => void;
  onDistrictChange: (district: string) => void;
  onTehsilChange: (tehsil: string) => void;
  errors?: {
    province?: string | boolean;
    district?: string | boolean;
    tehsil?: string | boolean;
  };
  styleType?: 'client' | 'lawyer';
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  province,
  district,
  tehsil,
  onProvinceChange,
  onDistrictChange,
  onTehsilChange,
  errors = {},
  styleType = 'client',
}) => {
  const provinceList = useMemo(() => {
    return Object.keys(pakistanLocations).map((p) => ({ label: p, value: p }));
  }, []);

  const districtList = useMemo(() => {
    if (province) {
      const provinceKey = Object.keys(pakistanLocations).find(
        (p) => p.trim().toLowerCase() === province.trim().toLowerCase()
      );
      if (provinceKey && pakistanLocations[provinceKey]) {
        return Object.keys(pakistanLocations[provinceKey]).map((d) => ({ label: d, value: d }));
      }
    }
    return [];
  }, [province]);

  const tehsilList = useMemo(() => {
    if (province && district) {
      const provinceKey = Object.keys(pakistanLocations).find(
        (p) => p.trim().toLowerCase() === province.trim().toLowerCase()
      );
      if (provinceKey && pakistanLocations[provinceKey]) {
        const districtKey = Object.keys(pakistanLocations[provinceKey]).find(
          (d) => d.trim().toLowerCase() === district.trim().toLowerCase()
        );
        if (districtKey && pakistanLocations[provinceKey][districtKey]) {
          return pakistanLocations[provinceKey][districtKey].map((t) => ({ label: t, value: t }));
        }
      }
    }
    return [];
  }, [province, district]);

  const handleProvinceChange = (item: any) => {
    onProvinceChange(item.value);
    onDistrictChange('');
    onTehsilChange('');
  };

  const handleDistrictChange = (item: any) => {
    onDistrictChange(item.value);
    onTehsilChange('');
  };

  const handleTehsilChange = (item: any) => {
    onTehsilChange(item.value);
  };

  const isClient = styleType === 'client';
  const customStyles = isClient ? clientStyles : lawyerStyles;

  return (
    <View style={styles.container}>
      {/* 1. Province Selection */}
      <View style={styles.dropdownWrapper}>
        {!isClient && <Text style={styles.fieldLabel}>Province:</Text>}
        <Dropdown
          style={[
            customStyles.dropdown,
            errors.province ? styles.errorBorder : null,
          ]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={provinceList}
          labelField="label"
          valueField="value"
          placeholder="Select Province"
          value={province}
          onChange={handleProvinceChange}
        />
        {errors.province && typeof errors.province === 'string' && (
          <Text style={styles.errorText}>{errors.province}</Text>
        )}
      </View>

      {/* 2. District Selection */}
      <View style={styles.dropdownWrapper}>
        {!isClient && <Text style={styles.fieldLabel}>District:</Text>}
        {province ? (
          <Dropdown
            style={[
              customStyles.dropdown,
              errors.district ? styles.errorBorder : null,
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={districtList}
            labelField="label"
            valueField="value"
            placeholder="Select District"
            value={district}
            onChange={handleDistrictChange}
          />
        ) : (
          <View style={[customStyles.dropdown, styles.disabledStyle, { justifyContent: 'center' }]}>
            <Text style={styles.placeholderStyle}>Select Province first</Text>
          </View>
        )}
        {errors.district && typeof errors.district === 'string' && (
          <Text style={styles.errorText}>{errors.district}</Text>
        )}
      </View>

      {/* 3. Tehsil Selection */}
      <View style={styles.dropdownWrapper}>
        {!isClient && <Text style={styles.fieldLabel}>Tehsil:</Text>}
        {district ? (
          <Dropdown
            style={[
              customStyles.dropdown,
              errors.tehsil ? styles.errorBorder : null,
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={tehsilList}
            labelField="label"
            valueField="value"
            placeholder="Select Tehsil"
            value={tehsil}
            onChange={handleTehsilChange}
          />
        ) : (
          <View style={[customStyles.dropdown, styles.disabledStyle, { justifyContent: 'center' }]}>
            <Text style={styles.placeholderStyle}>Select District first</Text>
          </View>
        )}
        {errors.tehsil && typeof errors.tehsil === 'string' && (
          <Text style={styles.errorText}>{errors.tehsil}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dropdownWrapper: {
    marginBottom: 10,
    width: '100%',
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#64748b',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#000',
  },
  errorBorder: {
    borderColor: 'red',
    borderWidth: 1.5,
  },
  disabledStyle: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  errorText: {
    color: 'red',
    fontSize: 11,
    marginTop: 2,
    marginLeft: 5,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
});

const clientStyles = StyleSheet.create({
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#001a4d',
  },
});

const lawyerStyles = StyleSheet.create({
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#001a4d',
  },
});

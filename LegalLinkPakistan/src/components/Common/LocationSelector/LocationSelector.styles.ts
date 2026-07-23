import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dropdownWrapper: {
    marginBottom: 12,
    width: '100%',
  },
  placeholderStyle: {
    fontSize: 15,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 15,
    color: '#000',
  },
  errorBorder: {
    borderColor: 'red',
    borderWidth: 1.5,
  },
  disabledStyle: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E0E0E0',
  },
  errorText: {
    color: 'red',
    fontSize: 11,
    marginTop: 2,
    marginLeft: 5,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '600',
  },
});

export const clientStyles = StyleSheet.create({
  dropdown: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

export const lawyerStyles = StyleSheet.create({
  dropdown: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

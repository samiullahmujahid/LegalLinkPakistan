import { StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from './theme';

export const globalStyles = StyleSheet.create({
  // Main screen container
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  // Centered wrapper for all auth screens
  inner: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'center',
  },
  // Logo and Brand header section
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  brandName: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    marginTop: 10 
  },
  // Section titles (Login, Signup, etc.)
  screenTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.primary 
  },
  // Instruction text found in designs
  instructionText: {
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  // Footer navigation styles
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 20 
  },
  footerText: { 
    color: COLORS.gray, 
    fontSize: 14 
  },
  linkText: { 
    color: COLORS.primary, 
    fontWeight: 'bold', 
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  form: {
    width: '100%'
  },
  subTitle: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 30,
    textAlign: 'center'
  }
});

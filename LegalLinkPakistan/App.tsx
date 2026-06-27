import 'react-native-gesture-handler';
import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  // Stripe Publishable Key
  const stripePublishableKey = "pk_test_51TZxfDA5CYCDUfgYR5Kbd6Dgd6ft2yLP1Tz33G2EzGVa7TsGubcJBbXnBcirSPFzoDgZYjrIF977lVRj4EbDjlbJ00IKvY3a0y";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripeProvider 
          publishableKey={stripePublishableKey}
          merchantIdentifier="merchant.com.legallink" // Required for iOS, ignored on Android
        >
          <AppNavigator />
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Header from '../../../components/Common/Header';

const TrackComplaint = ({ navigation, route }: any) => {
  // Assume status comes from navigation params
  const { status } = route.params || { status: 'PENDING' };

  const getStepColor = (stepStatus: string) => (status === stepStatus ? '#001a4d' : '#ccc');

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Track Complaint" />

      <View style={styles.trackContainer}>
        {['PENDING', 'IN-PROGRESS', 'RESOLVED'].map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={[styles.circle, { backgroundColor: getStepColor(step) }]} />
            <Text style={[styles.stepText, { color: getStepColor(step) }]}>{step}</Text>
            {index < 2 && <View style={styles.line} />}
          </View>
        ))}
      </View>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Current Status: {status}</Text>
        <Text style={styles.infoDesc}>Your complaint is currently being handled by our admin team.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  trackContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 50, paddingHorizontal: 20 },
  step: { alignItems: 'center', flex: 1 },
  circle: { width: 20, height: 20, borderRadius: 10 },
  stepText: { fontSize: 12, fontWeight: 'bold', marginTop: 10 },
  line: { position: 'absolute', top: 10, left: '50%', width: '100%', height: 2, backgroundColor: '#ccc', zIndex: -1 },
  infoBox: { margin: 30, padding: 20, backgroundColor: '#f9f9f9', borderRadius: 10 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#001a4d' },
  infoDesc: { marginTop: 10, color: '#666' }
});

export default TrackComplaint;

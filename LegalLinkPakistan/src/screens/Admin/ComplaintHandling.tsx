import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import styles from './ComplaintHandling.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatusCard from '../../components/Common/StatusCard/StatusCard';
import Header from '../../components/Common/Header/Header';

const ComplaintHandling = ({ navigation }: any) => {
    const [activeTab, setActiveTab] = useState('Client'); // 'Client' or 'Lawyer'
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComplaints();
    }, [activeTab]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const token = (await AsyncStorage.getItem('adminToken'))?.replace(/['"]+/g, '');
            // If activeTab is 'Client', send 'client'; if 'Lawyer', send 'lawyer'
            const typeParam = activeTab.toLowerCase(); 
            
            const response = await axios.get(`https://mug-work-public.ngrok-free.dev/api/complaints/all?type=${typeParam}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true' 
                }
            });

            if (response.data && Array.isArray(response.data.complaints)) {
                setComplaints(response.data.complaints);
            } else {
                setComplaints([]);
            }
        } catch (err: any) {
            console.error("Fetch Error:", err);
            Alert.alert("Error", "Could not load complaints. Please check your connection.");
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header 
                title="Complaint Handling" 
                showBackButton={true} 
            />

            <View style={styles.tabContainer}>
                {['Client', 'Lawyer'].map((tab) => (
                    <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabButton}>
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        {activeTab === tab && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#001a4d" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={complaints}
                    keyExtractor={(item: any) => item._id}
                    renderItem={({ item }) => (
                        <StatusCard
                            title={item.subject || "No Subject"}
                            avatarUri={item.clientId?.profilePic ? `https://mug-work-public.ngrok-free.dev${item.clientId.profilePic.startsWith('/') ? '' : '/'}${item.clientId.profilePic}` : null}
                            line1={`C: ${item.clientId?.name || "Client Not Found"}`}
                            line2={`L: ${item.lawyerId?.name || "Lawyer Not Found"}`}
                            onPress={() => navigation.navigate('ComplaintDetails', { id: item._id })}
                            theme="light"
                            containerStyle={{ marginHorizontal: 16 }}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="alert-circle-outline" size={50} color="#ccc" />
                            <Text style={styles.emptyText}>No complaints found for {activeTab}.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};



export default ComplaintHandling;

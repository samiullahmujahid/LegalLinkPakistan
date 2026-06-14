import React, { useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/Common/Header';
import { useNotifications } from '../../components/Common/NotificationProvider';
import { COLORS } from '../../theme/theme';

export const NotificationsScreen = () => {
  const { 
    notifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    handleNotificationRedirect 
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return 'chat-processing-outline';
      case 'booking':
        return 'calendar-clock';
      case 'complaint':
        return 'alert-circle-outline';
      default:
        return 'bell-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'chat':
        return COLORS.info;
      case 'booking':
        return COLORS.success;
      case 'complaint':
        return COLORS.danger;
      default:
        return COLORS.primary;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const handleItemPress = (item: any) => {
    if (!item.isRead) {
      markAsRead(item._id);
    }
    handleNotificationRedirect(item.data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Notifications" 
        rightElement={
          notifications.some(n => !n.isRead) ? (
            <TouchableOpacity onPress={markAllAsRead} style={styles.readAllBtn}>
              <Text style={styles.readAllText}>Mark read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const iconName = getNotificationIcon(item.type);
          const iconColor = getNotificationColor(item.type);

          return (
            <TouchableOpacity 
              style={[styles.card, !item.isRead && styles.unreadCard]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              {/* Type-based Circular Icon */}
              <View style={[styles.iconContainer, { backgroundColor: iconColor + '12' }]}>
                <Icon name={iconName} size={22} color={iconColor} />
              </View>

              {/* Title & Body content */}
              <View style={styles.detailsContainer}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.title, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatTimestamp(item.createdAt)}
                  </Text>
                </View>
                <Text style={styles.body} numberOfLines={2}>
                  {item.body}
                </Text>
              </View>

              {/* Unread indicator dot */}
              {!item.isRead && (
                <View style={styles.unreadDot} />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="bell-off-outline" size={48} color="#94a3b8" />
            </View>
            <Text style={styles.emptyText}>All caught up!</Text>
            <Text style={styles.emptySubText}>New notifications and updates will show up here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBg,
  },
  readAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  readAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    padding: 15,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    borderColor: COLORS.primary + '18',
    backgroundColor: COLORS.primary + '03',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  timeText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  body: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  }
});

export default NotificationsScreen;

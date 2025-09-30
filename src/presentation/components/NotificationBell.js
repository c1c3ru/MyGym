import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { 
  IconButton, 
  Badge, 
  Modal, 
  Card, 
  Title, 
  Paragraph, 
  Text,
  Button,
  Divider,
  List
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '@contexts/NotificationContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const NotificationBell = ({ color = 'COLORS.COLORS.white', size = 24 }) => {
  const { 
    unreadNotifications, 
    unreadCount, 
    markNotificationAsRead, 
    loadUserNotifications,
    pushNotificationsEnabled,
    requestNotificationPermissions
  } = useNotification();
  
  const [modalVisible, setModalVisible] = useState(false);

  const handleNotificationPress = (notification) => {
    markNotificationAsRead(notification.id);
    // Aqui você pode adicionar navegação baseada no tipo da notificação
    if (notification.data?.screen) {
      // navigation.navigate(notification.data.screen);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return 'card-outline';
      case 'class':
        return 'school-outline';
      case 'graduation':
        return 'trophy-outline';
      case 'general':
        return 'information-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment':
        return '#f44336';
      case 'class':
        return '#2196f3';
      case 'graduation':
        return '#ff9800';
      case 'general':
        return COLORS.primary[500];
      default:
        return 'COLORS.gray[600]';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const notificationDate = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  };

  return (
    <>
      <View style={styles.container}>
        <IconButton
          icon="bell"
          iconColor={color}
          size={size}
          onPress={() => setModalVisible(true)}
        />
        {unreadCount > 0 && (
          <Badge style={styles.badge} size={16}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </View>

      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
          <Card style={styles.modalCard}>
            <Card.Title
              title="Notificações"
              subtitle={`${unreadCount} não lida${unreadCount !== 1 ? 's' : ''}`}
              left={(props) => <Ionicons name="notifications" size={24} color={COLORS.info[500]} />}
              right={(props) => (
                <IconButton
                  icon="close"
                  onPress={() => setModalVisible(false)}
                />
              )}
            />
            
            <Divider />
            
            {!pushNotificationsEnabled && (
              <Card.Content style={styles.permissionCard}>
                <View style={styles.permissionContent}>
                  <Ionicons name="notifications-off" size={32} color={COLORS.warning[500]} />
                  <Text style={styles.permissionTitle}>
                    Notificações Desabilitadas
                  </Text>
                  <Text style={styles.permissionText}>
                    Ative as notificações para receber lembretes importantes
                  </Text>
                  <Button
                    mode="contained"
                    onPress={requestNotificationPermissions}
                    style={styles.permissionButton}
                  >
                    Ativar Notificações
                  </Button>
                </View>
              </Card.Content>
            )}

            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
              {unreadNotifications.length === 0 ? (
                <Card.Content style={styles.emptyState}>
                  <Ionicons name="checkmark-circle" size={48} color={COLORS.primary[500]} />
                  <Text style={styles.emptyText}>
                    Todas as notificações foram lidas!
                  </Text>
                </Card.Content>
              ) : (
                unreadNotifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    onPress={() => handleNotificationPress(notification)}
                    style={styles.notificationItem}
                  >
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Ionicons
                          name={getNotificationIcon(notification.type)}
                          size={20}
                          color={getNotificationColor(notification.type)}
                        />
                        <Text style={styles.notificationTime}>
                          {formatDate(notification.createdAt)}
                        </Text>
                      </View>
                      
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                    </View>
                    
                    <View style={styles.unreadIndicator} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {unreadNotifications.length > 0 && (
              <>
                <Divider />
                <Card.Actions>
                  <Button
                    onPress={() => {
                      loadUserNotifications();
                      setModalVisible(false);
                    }}
                  >
                    Atualizar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => setModalVisible(false)}
                  >
                    Fechar
                  </Button>
                </Card.Actions>
              </>
            )}
          </Card>
        </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error[500],
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: SPACING.lg,
  },
  modalCard: {
    maxHeight: '80%',
    backgroundColor: 'COLORS.COLORS.white',
  },
  permissionCard: {
    backgroundColor: 'COLORS.COLORS.white3e0',
    margin: SPACING.base,
    borderRadius: BORDER_RADIUS.md,
  },
  permissionContent: {
    alignItems: 'center',
    padding: SPACING.base,
  },
  permissionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    color: COLORS.warning[500],
  },
  permissionText: {
    fontSize: FONT_SIZE.base,
    textAlign: 'center',
    color: 'COLORS.text.secondary',
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: COLORS.warning[500],
  },
  notificationsList: {
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: 'COLORS.gray[100]',
    backgroundColor: 'COLORS.background.light',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  notificationTime: {
    fontSize: FONT_SIZE.sm,
    color: 'COLORS.text.secondary',
    marginLeft: 8,
  },
  notificationTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: 'COLORS.text.primary',
    marginBottom: SPACING.xs,
  },
  notificationMessage: {
    fontSize: 13,
    color: 'COLORS.text.secondary',
    lineHeight: 18,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.info[500],
    marginLeft: 8,
    marginTop: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: 'COLORS.text.secondary',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default NotificationBell;

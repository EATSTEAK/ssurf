import React, { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/shared/ui/primitives/Button';
import { ThemedText } from '@/shared/ui/primitives/ThemedText';

const styles = StyleSheet.create((theme) => ({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.gap(3),
    width: '80%',
    maxWidth: 400,
    gap: theme.gap(3),
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.gap(2),
    width: '100%',
  },
}));

export type LogoutModalProps = {
  onClose: () => void;
  onLogout: () => Promise<void> | void;
  visible: boolean;
};

export const LogoutModal = ({ visible, onClose, onLogout }: LogoutModalProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
      onClose();
    } catch {
      setError(true);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const onCloseWhileError = () => {
    setError(false);
    onClose();
  };

  if (isLoggingOut) {
    return (
      <Modal animationType="fade" transparent visible={visible}>
        <Pressable style={styles.overlay}>
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalContent}>
            <ThemedText style={styles.title} typography="headingLg">
              로그아웃 중...
            </ThemedText>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal animationType="fade" onRequestClose={onCloseWhileError} transparent visible={visible}>
        <Pressable onPress={onCloseWhileError} style={styles.overlay}>
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalContent}>
            <ThemedText style={styles.title} typography="headingLg">
              오류 발생
            </ThemedText>
            <ThemedText style={styles.message} typography="bodyLg">
              로그아웃하지 못했어요. 다시 시도해주세요.
            </ThemedText>
            <View style={styles.buttonContainer}>
              <Button onPress={onCloseWhileError} variant="primary">
                닫기
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.overlay}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalContent}>
          <ThemedText style={styles.title} typography="headingLg">
            로그아웃
          </ThemedText>
          <ThemedText style={styles.message} typography="bodyLg">
            정말 로그아웃 하시겠습니까?
          </ThemedText>
          <View style={styles.buttonContainer}>
            <Button onPress={onClose} style={{ flexShrink: 1 }} variant="secondary">
              취소
            </Button>
            <Button onPress={handleLogout} style={{ flexShrink: 1 }} variant="error">
              로그아웃
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

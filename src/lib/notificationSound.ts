/**
 * Notification Sound Service
 * Phát âm thanh thông báo khi có tin nhắn mới
 */

class NotificationSoundService {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      // Sử dụng file âm thanh thông báo có sẵn
      this.audio = new Audio("/assets/audio/thong_bao_mess.mp3");
      this.audio.volume = 0.6; // 60% volume
    }
  }

  /**
   * Phát âm thanh thông báo
   */
  play() {
    if (!this.isEnabled || !this.audio) return;

    try {
      // Reset audio về đầu trước khi play (để có thể play liên tục)
      this.audio.currentTime = 0;
      this.audio.play().catch((error) => {
        console.warn("Cannot play notification sound:", error);
      });
    } catch (error) {
      console.warn("Error playing notification sound:", error);
    }
  }

  /**
   * Bật âm thanh thông báo
   */
  enable() {
    this.isEnabled = true;
  }

  /**
   * Tắt âm thanh thông báo
   */
  disable() {
    this.isEnabled = false;
  }

  /**
   * Set volume (0 - 1)
   */
  setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Check xem âm thanh có được bật không
   */
  isNotificationEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const notificationSound = new NotificationSoundService();

// Export helper function để sử dụng trong components
export const playNotificationSound = () => {
  notificationSound.play();
};

export const enableNotificationSound = () => {
  notificationSound.enable();
};

export const disableNotificationSound = () => {
  notificationSound.disable();
};

export default notificationSound;


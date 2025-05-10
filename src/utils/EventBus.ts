/**
 * Uygulama içinde olayları yayınlamak ve dinlemek için basit bir EventBus sistemi
 */
type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Record<string, EventCallback[]> = {};

  /**
   * Bir olaya abone ol
   * @param event Olay adı
   * @param callback Olay tetiklendiğinde çağrılacak fonksiyon
   * @returns Aboneliği kaldırmak için kullanılabilecek fonksiyon
   */
  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);

    // Aboneliği kaldırmak için kullanılabilecek fonksiyon döndürür
    return () => {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    };
  }

  /**
   * Bir olayı tetikle
   * @param event Olay adı
   * @param args Olayla birlikte gönderilecek değişkenler
   */
  publish(event: string, ...args: any[]): void {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach((callback) => callback(...args));
    }
  }

  /**
   * Bir olaya olan tüm abonelikleri kaldır
   * @param event Olay adı
   */
  clear(event: string): void {
    delete this.events[event];
  }
}

// Singleton olarak kullanmak için tek bir örnek oluştur
const eventBus = new EventBus();

export default eventBus;

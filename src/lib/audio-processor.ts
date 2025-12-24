/**
 * Audio Processor Utility
 * Xử lý audio stream với noise gate và filter để giảm tiếng ồn
 */

export interface AudioProcessorOptions {
  noiseGateThreshold?: number; // Ngưỡng để kích hoạt noise gate (0-1, mặc định 0.01)
  highPassFrequency?: number; // Tần số high-pass filter (Hz, mặc định 80)
  smoothingTimeConstant?: number; // Thời gian làm mượt (0-1, mặc định 0.8)
}

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private noiseGateThreshold: number;
  private highPassFrequency: number;
  private isProcessing: boolean = false;
  private animationFrameId: number | null = null;
  private lowPassFilter: BiquadFilterNode | null = null;

  constructor(options: AudioProcessorOptions = {}) {
    this.noiseGateThreshold = options.noiseGateThreshold || 0.015;
    this.highPassFrequency = options.highPassFrequency || 100;
  }

  /**
   * Xử lý audio stream với noise gate và filter
   */
  async processAudioStream(inputStream: MediaStream): Promise<MediaStream> {
    try {
      // Tạo AudioContext
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Resume AudioContext nếu bị suspended (do browser autoplay policy)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Tạo source node từ input stream
      this.sourceNode = this.audioContext.createMediaStreamSource(inputStream);

      // Tạo destination node để output stream
      this.destinationNode = this.audioContext.createMediaStreamDestination();

      // Tạo gain node cho noise gate (bắt đầu với gain thấp)
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0.1; // Gain tối thiểu thay vì 0

      // Tạo high-pass filter để loại bỏ tiếng ồn tần số thấp
      this.filterNode = this.audioContext.createBiquadFilter();
      this.filterNode.type = "highpass";
      this.filterNode.frequency.value = this.highPassFrequency;
      this.filterNode.Q.value = 1;

      // Tạo low-pass filter để loại bỏ tiếng ồn tần số cao (tiếng rít)
      this.lowPassFilter = this.audioContext.createBiquadFilter();
      this.lowPassFilter.type = "lowpass";
      this.lowPassFilter.frequency.value = 6000; // Giữ lại tần số dưới 8kHz (đủ cho giọng nói)
      this.lowPassFilter.Q.value = 1;

      // Tạo analyser node để phân tích mức độ âm thanh
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Kết nối các node: source -> highpass -> lowpass -> gain -> analyser -> destination
      this.sourceNode.connect(this.filterNode);
      this.filterNode.connect(this.lowPassFilter!);
      this.lowPassFilter!.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.destinationNode);

      // Bắt đầu xử lý noise gate
      this.startNoiseGate();

      // Trả về output stream (kết hợp với video tracks từ input stream)
      const outputStream = new MediaStream();

      // Thêm audio track từ destination
      this.destinationNode.stream.getAudioTracks().forEach((track) => {
        outputStream.addTrack(track);
      });

      // Thêm video tracks từ input stream (nếu có)
      inputStream.getVideoTracks().forEach((track) => {
        outputStream.addTrack(track);
      });

      return outputStream;
    } catch (error) {
      console.error("[AudioProcessor] Error processing audio:", error);
      // Nếu lỗi, trả về stream gốc
      return inputStream;
    }
  }

  /**
   * Noise gate: chỉ truyền audio khi có tiếng nói (âm thanh vượt ngưỡng)
   */
  private startNoiseGate() {
    if (!this.analyserNode || !this.gainNode || !this.audioContext) {
      return;
    }

    this.isProcessing = true;
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateNoiseGate = () => {
      if (!this.isProcessing || !this.analyserNode || !this.gainNode) {
        return;
      }

      // Lấy dữ liệu âm thanh (sử dụng time domain để đo mức độ chính xác hơn)
      this.analyserNode.getByteTimeDomainData(dataArray);

      // Tính toán mức độ âm thanh (RMS - Root Mean Square)
      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128; // Normalize về -1 to 1
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / bufferLength); // RMS value

      // Noise gate với hysteresis và gain động
      const currentGain = this.gainNode.gain.value;
      const thresholdOn = this.noiseGateThreshold;
      const thresholdOff = this.noiseGateThreshold * 0.1; // Ngưỡng tắt thấp hơn

      if (rms > thresholdOn) {
        // Có tiếng nói - tăng gain lên (gain tăng theo mức độ âm thanh)
        const targetGain = Math.min(1.0, 0.3 + (rms - thresholdOn) * 2);
        if (Math.abs(currentGain - targetGain) > 0.1) {
          this.gainNode.gain.setTargetAtTime(
            targetGain,
            this.audioContext!.currentTime,
            0.01 // Attack time nhanh
          );
        }
      } else if (rms < thresholdOff) {
        // Không có tiếng nói - giảm gain xuống (nhưng không tắt hoàn toàn)
        const targetGain = Math.max(0.05, currentGain * 0.8); // Giảm dần
        if (currentGain > 0.1) {
          this.gainNode.gain.setTargetAtTime(
            targetGain,
            this.audioContext!.currentTime,
            0.2 // Release time chậm
          );
        }
      }

      this.animationFrameId = requestAnimationFrame(updateNoiseGate);
    };

    updateNoiseGate();
  }

  /**
   * Dừng xử lý audio
   */
  stop() {
    this.isProcessing = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Disconnect các node
    try {
      this.sourceNode?.disconnect();
      this.filterNode?.disconnect();
      this.lowPassFilter?.disconnect();
      this.gainNode?.disconnect();
      this.analyserNode?.disconnect();
      this.destinationNode?.disconnect();
    } catch (error) {
      // Ignore errors khi disconnect
    }

    // Đóng AudioContext
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {
        // Ignore close errors
      });
    }

    this.sourceNode = null;
    this.filterNode = null;
    this.lowPassFilter = null;
    this.gainNode = null;
    this.analyserNode = null;
    this.destinationNode = null;
    this.audioContext = null;
  }
}

/**
 * Helper function để xử lý audio stream với noise reduction
 */
export async function processAudioWithNoiseReduction(
  inputStream: MediaStream,
  options?: AudioProcessorOptions
): Promise<MediaStream> {
  const processor = new AudioProcessor(options);
  try {
    return await processor.processAudioStream(inputStream);
  } catch (error) {
    console.error("[processAudioWithNoiseReduction] Error:", error);
    // Nếu lỗi, trả về stream gốc
    return inputStream;
  }
}

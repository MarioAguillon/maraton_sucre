import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  EVENT_DATE_LABEL,
  EVENT_ROUTE_LABEL,
  EVENT_START_TIME_LABEL,
  REGISTRATION_FEE_LABEL,
} from '../../config/event.config';

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

@Component({
  imports: [],
  selector: 'app-hero',
  styleUrl: './hero.scss',
  templateUrl: './hero.html',
})
export class Hero {
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('videoPlayer');

  readonly dateLabel = EVENT_DATE_LABEL;
  readonly routeLabel = EVENT_ROUTE_LABEL;
  readonly startTimeLabel = EVENT_START_TIME_LABEL;
  readonly feeLabel = REGISTRATION_FEE_LABEL;

  /** Autoplay solo si el usuario no pidió menos movimiento ni ahorro de datos. */
  readonly autoplayAllowed = signal(this.shouldAutoplay());
  /** El vídeo se descarga solo cuando hay autoplay o el usuario pulsa "play". */
  readonly videoRequested = signal(this.autoplayAllowed());
  readonly isPlaying = signal(false);

  /** Pausa manual del usuario: no reanudar automáticamente al volver a ver el hero. */
  private userPaused = false;

  constructor() {
    afterNextRender(() => {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onMotionChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          this.autoplayAllowed.set(false);
          this.pause();
        }
      };
      motionQuery.addEventListener('change', onMotionChange);
      this.destroyRef.onDestroy(() => motionQuery.removeEventListener('change', onMotionChange));

      this.observeVisibility();
      if (this.autoplayAllowed()) this.play();
    });
  }

  toggleVideo(): void {
    if (this.isPlaying()) {
      this.userPaused = true;
      this.pause();
      return;
    }
    this.userPaused = false;
    if (!this.videoRequested()) {
      // Primera reproducción solicitada: renderiza <source> y reproduce tras el render.
      this.videoRequested.set(true);
      afterNextRender(
        () => {
          this.videoRef()?.nativeElement.load();
          this.play();
        },
        { injector: this.injector },
      );
      return;
    }
    this.play();
  }

  private play(): void {
    const video = this.videoRef()?.nativeElement;
    if (!video) return;
    video.muted = true;
    video
      .play()
      .then(() => this.isPlaying.set(true))
      .catch(() => this.isPlaying.set(false)); // Autoplay bloqueado: queda el botón de play.
  }

  private pause(): void {
    this.videoRef()?.nativeElement.pause();
    this.isPlaying.set(false);
  }

  /** Pausa el vídeo fuera de pantalla para ahorrar CPU/batería. */
  private observeVisibility(): void {
    const video = this.videoRef()?.nativeElement;
    if (!video || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!this.videoRequested()) return;
        if (!entry.isIntersecting && this.isPlaying()) {
          video.pause();
          this.isPlaying.set(false);
        } else if (entry.isIntersecting && !this.isPlaying() && !this.userPaused && this.autoplayAllowed()) {
          this.play();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(video);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private shouldAutoplay(): boolean {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    if (connection?.saveData) return false;
    if (connection?.effectiveType && /(^|-)2g$|^3g$/.test(connection.effectiveType)) return false;
    return true;
  }
}

import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-hero',
  styleUrl: './hero.scss',
  templateUrl: './hero.html',
})
export class Hero implements AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    if (this.videoPlayer?.nativeElement) {
      const vid = this.videoPlayer.nativeElement;
      vid.muted = true;
      vid.defaultMuted = true;
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay en espera de interacción:', err);
          const resumePlay = () => {
            vid.play().catch(() => {});
          };
          document.addEventListener('click', resumePlay, { once: true });
          document.addEventListener('touchstart', resumePlay, { once: true });
          document.addEventListener('scroll', resumePlay, { once: true });
        });
      }
    }
  }
}

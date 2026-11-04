import { Component, OnInit, OnDestroy, signal } from '@angular/core';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  imports: [],
  selector: 'app-countdown',
  styleUrl: './countdown.scss',
  templateUrl: './countdown.html',
})
export class Countdown implements OnInit, OnDestroy {
  timeLeft = signal<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly eventDate = new Date('2027-01-09T06:45:00-05:00');

  ngOnInit(): void {
    this.updateCountdown();
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const distance = this.eventDate.getTime() - now;

    if (distance <= 0) {
      this.timeLeft.set({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      if (this.intervalId) clearInterval(this.intervalId);
      return;
    }

    this.timeLeft.set({
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    });
  }

  padZero(value: number): string {
    return value.toString().padStart(2, '0');
  }
}

import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { Countdown } from './components/countdown/countdown';
import { Categories } from './components/categories/categories';
import { RouteMap } from './components/route-map/route-map';
import { About } from './components/about/about';
import { Registration } from './components/registration/registration';
import { Sponsors } from './components/sponsors/sponsors';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Header,
    Hero,
    Countdown,
    Categories,
    RouteMap,
    About,
    Registration,
    Sponsors,
    Footer,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = '¼ Maratón Bolívar - Sucre';
}

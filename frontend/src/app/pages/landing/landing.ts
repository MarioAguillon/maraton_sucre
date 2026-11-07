import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Hero } from '../../components/hero/hero';
import { Countdown } from '../../components/countdown/countdown';
import { Categories } from '../../components/categories/categories';
import { RouteMap } from '../../components/route-map/route-map';
import { About } from '../../components/about/about';
import { Registration } from '../../components/registration/registration';
import { Sponsors } from '../../components/sponsors/sponsors';
import { Footer } from '../../components/footer/footer';
import { WhatsappFab } from '../../components/whatsapp-fab/whatsapp-fab';

/** Landing pública del evento (ruta '/'). */
@Component({
  selector: 'app-landing',
  imports: [Header, Hero, Countdown, Categories, RouteMap, About, Registration, Sponsors, Footer, WhatsappFab],
  templateUrl: './landing.html',
})
export class Landing {}

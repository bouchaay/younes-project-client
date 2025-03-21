import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  address: string = "123 Rue Beauté, 75000 Paris, France";
  phone: string = "+33 1 23 45 67 89";
  email: string = "contact@salonbeaute.com";
  mapSrc: string = "https://www.google.com/maps/embed?..."; // Mettez votre lien Google Maps ici
}

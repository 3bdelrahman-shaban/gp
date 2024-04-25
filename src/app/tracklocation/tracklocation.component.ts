import { Component, OnInit } from '@angular/core';
import { AuthserviceService } from '../authservice.service';
import { DatePipe } from '@angular/common';
declare const google: any;
@Component({
  selector: 'app-tracklocation',
  templateUrl: './tracklocation.component.html',
  styleUrl: './tracklocation.component.css'
})
export class TracklocationComponent implements OnInit {
constructor(private auth:AuthserviceService,private datePipe: DatePipe,){}
userlocation:any

ngOnInit(): void {
    this.auth.getlocation().subscribe((data)=>{
      this.userlocation=data[0]
    })
    this.loadGoogleMaps(() => {
      this.initMap();
    });
    
}

loadGoogleMaps(callback: () => void): void {
  if (typeof google === 'undefined') {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDrdv2-Yq-YSoYMHVdPY-murMwmhrbS7bs&callback=initMap';
    script.async = true;
    script.defer = true;
    window['initMap'] = () => {
      callback();
    };
    document.body.appendChild(script);
  } else {
    callback();
  }
}
initMap(): void {
  const map = new google.maps.Map(document.getElementById('map')!, {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 15
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const pos = {
        lat:this.userlocation.lat,
        lng: this.userlocation.lng
      };

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'location': pos }, (results: any, status: any) => {
        if (status === 'OK') {
          if (results[0]) {
            const datee = new Date();
            const formattedDateTime = this.formatDateAndTime(datee);
            const location = {
              from: this.auth.loginUser.email,
              to: this.auth.loginUser.userguard.guardemail,
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
              result: results[0].formatted_address,
              time: formattedDateTime.time,
              date: formattedDateTime.date
            };
            this.auth.insertlocation(location).subscribe((data)=>{
              console.log(data)
            })
          }
        } else {
          console.log(`Geocoder failed due to: ${status}`);
        }
      });

      map.setCenter(pos);
      new google.maps.Marker({
        position: pos,
        map: map,
        title: 'Your Location'
      });
    }, (error) => {
      this.handleLocationError(error);
    });
  } else {
    this.handleLocationError({ code: 0 });
  }
}
formatDateAndTime(datee: Date): { time: string, date: string } {
  const formattedDateTime = this.datePipe.transform(datee, 'dd-MM hh.mm')!;
  const dateParts = formattedDateTime.split(' ');
  const date = dateParts[0];
  const time = dateParts[1];

  return {
    date: date,
    time: time
  };
}
handleLocationError(error: any): void {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.log("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.log("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.log("An unknown error occurred.");
      break;
  }
}
}

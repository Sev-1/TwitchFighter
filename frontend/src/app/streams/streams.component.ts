import { Component, OnInit, SecurityContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IStream } from 'src/app/streams/models/stream.model'
import { mockStreams } from 'src/app/streams/models/stream.mock'
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-streams',
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.css']
})
export class StreamsComponent implements OnInit {
  streams: IStream[];

  constructor(
    private sanitizer: DomSanitizer,
    private streamService: StreamService
  ) { 
    // this.sanitizer = sanitizer;
    this.streams = mockStreams;
  }

  async ngOnInit() {
    let data = await this.streamService.getStreams();
    console.log("Data from stream service is: " + JSON.stringify(data));
    data.forEach(stream => {
      stream.streamUrl = "https://player.twitch.tv/?channel=" + stream.twitchUserName;
      stream.href = stream.streamUrl;
      // stream.href = 
      stream.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(stream.streamUrl);
      stream.safeHref = this.sanitizer.bypassSecurityTrustResourceUrl(stream.href);
      console.log("Url " + stream.streamUrl + " -- safe url: " + stream.safeUrl);
      console.log("href of " + stream.href + " -- safe url: " + stream.safeHref);
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private streamBaseUrl: string = `${environment.baseUrl}/stream`;

  constructor(
    private http: HttpClient
  ) { }

  async getStreams() : Promise<IStream[]>{
    const url = this.streamBaseUrl;
    try {
      return await this.http.get<IStream[]>(url).toPromise<IStream[]>();
    } catch {
      return Promise.resolve([]);
    }
  }
}
import { Component, OnInit, SecurityContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IStream } from 'src/app/streams/models/stream.model'
import { mockStreams } from 'src/app/streams/models/stream.mock'
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-streams',
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.css']
})
export class StreamsComponent implements OnInit {
  streams: IStream[];

  constructor(
    private streamService: StreamService,
    private sanitizer: DomSanitizer
  ) { 
  }

  async ngOnInit() {
    this.streams = await this.streamService.getStreams();
    console.log("Streams received from back end are: " + JSON.stringify(this.streams));
    this.streams.forEach(stream => {
      stream.streamUrl = "https://player.twitch.tv/?channel=" + stream.twitchUserName;
      stream.href = stream.streamUrl;
      console.log("Stream info after set href: " + JSON.stringify(stream));
      console.log("StreamUrl is: " + stream.streamUrl);
      stream.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(stream.streamUrl);
      stream.safeHref = this.sanitizer.bypassSecurityTrustResourceUrl(stream.href);
      console.log("Url " + stream.streamUrl + " -- safe url: " + stream.safeUrl);
      console.log("href of " + stream.href + " -- safe url: " + stream.safeHref);
    });
    console.log("this streams after the sanitize: " + JSON.stringify(this.streams));
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

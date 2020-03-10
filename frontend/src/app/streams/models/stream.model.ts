import { SafeUrl } from '@angular/platform-browser';

export interface IStream {
    twitchUserName: string;
    streamUrl: string;
    _id: string;
    __v: number;
    href?: string;
    safeUrl?: SafeUrl;
    safeHref?: SafeUrl;
    
}
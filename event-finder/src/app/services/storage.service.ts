// import necessary packages
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // initialise storage
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public async set(key: string, value: any) {
    let res = await this._storage?.set(key, value);
    console.log(res);
  }
  
  // return key's value
  public async get(key: string) {
    return await this._storage?.get(key);
  }

  // remove key-value pair 
  // returns true if item is removed, else returns false 
  public async remove(key: string) {
    return await this.storage.remove(key);
  }

  // return keyset
  public async keySet() {
    return await this.storage.keys();
  }

  // completely clears database
  public async clearDB() {
    return await this.storage.clear();
  }

}
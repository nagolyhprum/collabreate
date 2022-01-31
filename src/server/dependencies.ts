export class Dependencies implements IDependencies {
    _map : Record<string, any> = {}
    set(name : ModuleName, value : any) {
        this._map[name] = value;
    }
    get(name : ModuleName) {
        return this._map[name]
    }
    add(name : ModuleName, value : any) {
        this._map[name] = this._map[name] || [];
        this._map[name].push(value);
    }
    list(name : ModuleName) {
        return this._map[name] || []
    }
}
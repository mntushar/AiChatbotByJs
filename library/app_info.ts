class AppInfo{
    static mainUrl = process.env.NEXT_PUBLIC_MAIN_URL;
    static apiUrl = `${this.mainUrl}/api`;
}

export default AppInfo;
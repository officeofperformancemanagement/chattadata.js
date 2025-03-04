class ChattaData {
  constructor({ username, password }) {
    this.username = username;
    this.password = password;
    this._metadata_cache = {};
  }

  static async init({ username, password }) {
    // to-do: try to connect

    return new ChattaData({ username, password });
  }

  // async csv () {}
  // async json () {}

  async headers() {
    return {
      Authorization:
        "Basic " +
        Buffer.from(this.username + ":" + this.password).toString("base64")
    };
  }

  async meta({ id }) {
    if (!(id in this._metadata_cache)) {
      const headers = await this.headers();
      const url = `https://internal.chattadata.org/api/views/${id}.json`;
      const res = await fetch(url, { headers });
      const result = await res.json();
      if (typeof result === "object" && result.error === true) {
        console.error(result);
        throw new Error("[chattadata] failed to fetch metadata");
      }
      this._metadata_cache[id] = result;
    }
    return this._metadata_cache[id];
  }

  async get_column_names({ id }) {
    const meta = await this.meta({ id });
    return meta.columns.map(column => column.name);
  }

  async put_csv({ id, csv }) {
    const headers = await this.headers();

    if (csv) {
      headers["Content-Type"] = "text/csv";
    }

    const body = csv ? csv : undefined;

    const res = await fetch(
      `https://internal.chattadata.org/resource/${id}.json`,
      {
        method: "PUT",
        headers,
        body
      }
    );
    const result = await res.json();
    if (typeof result === "object" && result.error === true) {
      console.error(result);
      throw new Error("[chattadata] failed to fetch metadata");
    }
    return result;
  }
}

if (typeof define === "function" && define.amd) {
  define(function () {
    return { ChattaData };
  });
}

if (typeof module === "object") {
  module.exports = { ChattaData };
}

if (typeof self === "object") {
  self.ChattaData = ChattaData;
}

if (typeof window === "object") {
  window.ChattaData = ChattaData;
}

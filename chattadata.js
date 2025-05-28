class ChattaData {
  constructor({ username, password, authorization }) {
    this.authorization = authorization;
    this.username = username;
    this.password = password;
    this._metadata_cache = {};
  }

  static async init({ authorization, username, password }) {
    // to-do: try to connect

    return new ChattaData({ authorization, username, password });
  }

  // async csv () {}
  // async json () {}

  async headers() {
    const results = {};
    if (this.username && this.password) {
      results.Authorization =
        "Basic " +
        Buffer.from(this.username + ":" + this.password).toString("base64");
    } else if (this.authorization) {
      results.Authorization = this.authorization;
    }
    return results;
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

  async get_csv({ id }) {
    const headers = await this.headers();

    const res = await fetch(
      `https://internal.chattadata.org/api/views/${id}/rows.csv?accessType=DOWNLOAD`,
      {
        method: "GET",
        headers
      }
    );
    const result = await res.text();
    if (typeof result === "string" && result.startsWith("<")) {
      console.error(result);
      throw new Error("[chattadata] failed to get dataset as csv");
    }
    return result;
  }

  async post_csv({ id, csv }) {
    const headers = await this.headers();

    if (csv) {
      headers["Content-Type"] = "text/csv";
    }

    const body = csv ? csv : undefined;

    const res = await fetch(
      `https://internal.chattadata.org/resource/${id}.json`,
      {
        method: "POST",
        headers,
        body
      }
    );
    const result = await res.json();
    if (typeof result === "object" && result.error === true) {
      console.error(result);
      throw new Error("[chattadata] failed to post csv");
    }
    return result;
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
      throw new Error("[chattadata] failed to put csv");
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

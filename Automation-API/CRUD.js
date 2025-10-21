const chai = require('chai');
const { expect } = chai;
chai.use(require('chai-json-schema'));

const baseUrl = 'https://reqres.in/api';
const headers = {
  "x-api-key": "reqres-free-v1",
  "Content-Type": "application/json"
};

// ini untuk json Schema
const schemas = {
  user: {
    type: "object",
    required: ["id", "email", "first_name", "last_name", "avatar"],
    properties: {
      id: { type: "integer" },
      email: { type: "string", pattern: "^\\S+@\\S+\\.\\S+$" },
      first_name: { type: "string" },
      last_name: { type: "string" },
      avatar: { type: "string" }
    }
  },
  usersList: {
    type: "object",
    required: ["page", "per_page", "total", "total_pages", "data"],
    properties: {
      page: { type: "number" },
      per_page: { type: "number" },
      total: { type: "number" },
      total_pages: { type: "number" },
      data: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "email", "first_name", "last_name", "avatar"],
          properties: {
            id: { type: "number" },
            email: { type: "string", pattern: "^\\S+@\\S+\\.\\S+$" },
            first_name: { type: "string" },
            last_name: { type: "string" },
            avatar: { type: "string" }
          }
        }
      },
      support: {
        type: "object",
        properties: {
          url: { type: "string" },
          text: { type: "string" }
        }
      }
    }
  },
  resource: {
    type: "object",
    required: ["id", "name", "year", "color", "pantone_value"],
    properties: {
      id: { type: "number" },
      name: { type: "string" },
      year: { type: "number" },
      color: { type: "string" },
      pantone_value: { type: "string" }
    }
  },
  resourcesList: {
    type: "object",
    required: ["page", "per_page", "total", "total_pages", "data"],
    properties: {
      page: { type: "number" },
      per_page: { type: "number" },
      total: { type: "number" },
      total_pages: { type: "number" },
      data: { type: "array" },
      support: {
        type: "object",
        properties: {
          url: { type: "string" },
          text: { type: "string" }
        }
      }
    }
  },
  createdUser: {
    type: "object",
    required: ["name", "job", "id", "createdAt"],
    properties: {
      name: { type: "string" },
      job: { type: "string" },
      id: { type: "string" },
      createdAt: { 
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$"
      }
    }
  },
  updatedUser: {
    type: "object",
    required: ["updatedAt"],
    properties: {
      name: { type: "string" },
      job: { type: "string" },
      updatedAt: { 
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$"
      }
    }
  },
  error: {
    type: "object",
    required: ["error"],
    properties: {
      error: { type: "string" }
    }
  }
};

// ini untuk Test data
const testData = {
  validUser: {
    id: 2,
    name: "Hafiz Hamdani",
    job: "QA Engineer"
  },
  updateUser: {
    name: "Hafiz Hamdani",
    job: "Senior QA Engineer"
  },
  patchUser: {
    job: "Lead QA Engineer"
  },
  pagination: {
    page: 2
  }
};

describe("ReqRes API Automation – CRUD Tests (Hafiz Hamdani)", () => {

  describe("GET /users - List Users", () => {
    let response, body, responseTime;

    before(async () => {
      const startTime = Date.now();
      response = await fetch(`${baseUrl}/users?page=${testData.pagination.page}`, { headers });
      responseTime = Date.now() - startTime;
      body = await response.json();
    });

    it("should return valid status code", () => {
      expect(response.status).to.be.oneOf([200, 201, 204]);
    });

    it("should respond within 2 seconds", () => {
      expect(responseTime).to.be.below(2000);
    });

    it("should return application/json content type", () => {
      expect(response.headers.get('content-type')).to.include('application/json');
    });

    it("should match expected JSON schema", () => {
      expect(body).to.be.jsonSchema(schemas.usersList);
    });

    it("should return non-empty data array", () => {
      expect(body.data).to.be.an('array').that.is.not.empty;
    });

    it("should have valid email format for all users", () => {
      body.data.forEach(user => {
        expect(user.email).to.match(/^\S+@\S+\.\S+$/);
      });
    });

    it("should contain all required fields for each user", () => {
      body.data.forEach(user => {
        expect(user).to.have.all.keys("id", "email", "first_name", "last_name", "avatar");
      });
    });

    it("should have valid pagination metadata", () => {
      expect(body.page).to.be.a("number");
      expect(body.per_page).to.be.a("number");
      expect(body.total).to.be.a("number");
      expect(body.total_pages).to.be.at.least(1);
    });

    it("should include support information", () => {
      expect(body.support).to.be.an("object");
      expect(body.support.url).to.be.a("string").that.is.not.empty;
      expect(body.support.text).to.be.a("string").that.is.not.empty;
    });
  });

  describe("GET /users/:id - Get Single User", () => {
    let response, body, responseTime;

    before(async () => {
      const startTime = Date.now();
      response = await fetch(`${baseUrl}/users/${testData.validUser.id}`, { headers });
      responseTime = Date.now() - startTime;
      body = await response.json();
    });

    it("should return valid status code", () => {
      expect(response.status).to.be.oneOf([200, 201, 204]);
    });

    it("should respond within 2 seconds", () => {
      expect(responseTime).to.be.below(2000);
    });

    it("should return application/json content type", () => {
      expect(response.headers.get('content-type')).to.include('application/json');
    });

    it("should contain all required user fields", () => {
      expect(body.data).to.include.keys("id", "email", "first_name", "last_name", "avatar");
    });

    it("should match user schema", () => {
      expect(body.data).to.be.jsonSchema(schemas.user);
    });

    it("should have valid email format", () => {
      expect(body.data.email).to.match(/^\S+@\S+\.\S+$/);
    });

    it("should have non-empty first name and last name", () => {
      expect(body.data.first_name).to.be.a("string").that.is.not.empty;
      expect(body.data.last_name).to.be.a("string").that.is.not.empty;
    });

    it("should have valid avatar URL", () => {
      expect(body.data.avatar).to.match(/^https?:\/\/[\w./-]+$/);
    });

    it("should return correct user ID", () => {
      expect(body.data.id).to.equal(testData.validUser.id);
    });
  });

  describe("POST /users - Create User", () => {
    let response, body, responseTime;

    before(async () => {
      const payload = {
        name: testData.validUser.name,
        job: testData.validUser.job
      };
      const startTime = Date.now();
      response = await fetch(`${baseUrl}/users`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      responseTime = Date.now() - startTime;
      body = await response.json();
    });

    it("should return valid status code", () => {
      expect(response.status).to.be.oneOf([200, 201, 204]);
    });

    it("should respond within 2 seconds", () => {
      expect(responseTime).to.be.below(2000);
    });

    it("should return application/json content type", () => {
      expect(response.headers.get('content-type')).to.include('application/json');
    });

    it("should generate user ID", () => {
      expect(body).to.have.property("id");
      expect(body.id).to.be.a("string").that.is.not.empty;
    });

    it("should contain all required fields", () => {
      expect(body).to.have.all.keys("name", "job", "id", "createdAt");
    });

    it("should have valid ISO 8601 createdAt timestamp", () => {
      expect(body.createdAt).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });

    it("should match created user schema", () => {
      expect(body).to.be.jsonSchema(schemas.createdUser);
    });
  });

  describe("PUT /users/:id - Update User (Full)", () => {
    let response, body, responseTime;

    before(async () => {
      const payload = {
        name: testData.updateUser.name,
        job: testData.updateUser.job
      };
      const startTime = Date.now();
      response = await fetch(`${baseUrl}/users/${testData.validUser.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload)
      });
      responseTime = Date.now() - startTime;
      body = await response.json();
    });

    it("should return valid status code", () => {
      expect(response.status).to.be.oneOf([200, 201, 204]);
    });

    it("should respond within 2 seconds", () => {
      expect(responseTime).to.be.below(2000);
    });

    it("should return application/json content type", () => {
      expect(response.headers.get('content-type')).to.include('application/json');
    });

    it("should include updatedAt timestamp", () => {
      expect(body).to.have.property("updatedAt");
    });

    it("should have valid ISO 8601 updatedAt timestamp", () => {
      expect(body.updatedAt).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });

    it("should contain updated fields", () => {
      expect(body).to.have.any.keys("name", "job", "updatedAt");
    });

    it("should match updated user schema", () => {
      expect(body).to.be.jsonSchema(schemas.updatedUser);
    });
  });

  describe("PATCH /users/:id - Update User (Partial)", () => {
    let response, body, responseTime;

    before(async () => {
      const payload = {
        job: testData.patchUser.job
      };
      const startTime = Date.now();
      response = await fetch(`${baseUrl}/users/${testData.validUser.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload)
      });
      responseTime = Date.now() - startTime;
      body = await response.json();
    });

    it("should return valid status code", () => {
      expect(response.status).to.be.oneOf([200, 201, 204]);
    });

    it("should respond within 2 seconds", () => {
      expect(responseTime).to.be.below(2000);
    });

    it("should return application/json content type", () => {
      expect(response.headers.get('content-type')).to.include('application/json');
    });

    it("should include updatedAt timestamp", () => {
      expect(body).to.have.property("updatedAt");
    });

    it("should have valid ISO 8601 updatedAt timestamp", () => {
      expect(body.updatedAt).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });

    it("should contain updated fields", () => {
      expect(body).to.have.any.keys("job", "updatedAt");
    });
  });

  describe("DELETE /users/:id - Delete User", () => {
    let response, responseTime, bodyText;

    before(async () => {
      const startTime = Date.now();
      response = await fetch(`${baseUrl}/users/${testData.validUser.id}`, {
        method: "DELETE",
        headers
      });
      responseTime = Date.now() - startTime;
      bodyText = await response.text();
    });

    it("should return 204 No Content status", () => {
      expect(response.status).to.equal(204);
    });

    it("should respond within 2 seconds", () => {
      expect(responseTime).to.be.below(2000);
    });

    it("should return empty response body", () => {
      expect(bodyText).to.be.empty;
    });

    it("should not include Content-Type header", () => {
      expect(response.headers.has("Content-Type")).to.be.false;
    });
  });

  describe("GET /unknown - List Resources", () => {
    let response, body, responseTime;

    before(async () => {
      const startTime = Date.now();
      response = await fetch(`${baseUrl}/unknown`, { headers });
      responseTime = Date.now() - startTime;
      body = await response.json();
    });

    it("should return valid status code", () => {
      expect(response.status).to.be.oneOf([200, 201, 204]);
    });

    it("should respond within 2 seconds", () => {
      expect(responseTime).to.be.below(2000);
    });

    it("should return application/json content type", () => {
      expect(response.headers.get('content-type')).to.include('application/json');
    });

    it("should match expected JSON schema", () => {
      expect(body).to.be.jsonSchema(schemas.resourcesList);
    });

    it("should return non-empty data array", () => {
      expect(body.data).to.be.an('array').that.is.not.empty;
    });

    it("should contain all required fields for each resource", () => {
      body.data.forEach(resource => {
        expect(resource).to.have.all.keys("id", "name", "year", "color", "pantone_value");
      });
    });

    it("should have valid pagination metadata", () => {
      expect(body.page).to.be.a("number");
      expect(body.per_page).to.be.a("number");
      expect(body.total).to.be.a("number");
      expect(body.total_pages).to.be.at.least(1);
    });

    it("should include support information", () => {
      expect(body.support).to.be.an("object");
      expect(body.support.url).to.be.a("string").that.is.not.empty;
      expect(body.support.text).to.be.a("string").that.is.not.empty;
    });
  });

});
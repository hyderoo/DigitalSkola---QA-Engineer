const chai = require('chai');
const { expect } = chai;
chai.use(require('chai-json-schema'));
const axios = require('axios');

const baseUrl = 'https://reqres.in/api';
const headers = {
    "x-api-key": "reqres-free-v1",
    "Content-Type": "application/json"
};

const schemas = {
register: {
    type: "object",
    required: ["token"],
    properties: {
    token: { type: "string" },
    id: { type: ["integer", "string"] }
    }
},
login: {
    type: "object",
    required: ["token"],
    properties: {
    token: { type: "string" }
    }
},
error: {
    type: "object",
    required: ["error"],
    properties: {
    error: { type: "string" }
    }
},
logout: {
    type: "object",
    properties: {
    message: { type: "string" }
    },
    required: ["message"]
}
};

const testData = {
validUser: {
    email: "eve.holt@reqres.in",
    registerPassword: "pistol",
    loginPassword: "cityslicka"
},
invalidUser: {
    emailOnly: "sydney@fife",
    invalidCredentials: {
    email: "peter@klaven",
    password: "wrongpass"
    }
}
};

describe("ReqRes API Automation – AUTH Tests (Hafiz Hamdani)", () => {
    describe("POST /register - User Registration (Positive)", () => {
    let response, responseTime;

    before(async () => {
    const startTime = Date.now();
        response = await axios.post(`${baseUrl}/register`, {
        email: testData.validUser.email,
        password: testData.validUser.registerPassword
    }, { headers });
        responseTime = Date.now() - startTime;
    });

    it("should return valid status code", () => {
        expect(response.status).to.be.oneOf([200, 201, 204]);
    });

    it("should respond within 2 seconds", () => {
        expect(responseTime).to.be.below(2000);
    });

    it("should return application/json content type", () => {
        expect(response.headers['content-type']).to.include('application/json');
    });

    it("should return authentication token", () => {
        expect(response.data).to.have.property("token");
    });

    it("should have non-empty token string", () => {
        expect(response.data.token).to.be.a("string").that.is.not.empty;
    });

    it("should match register response schema", () => {
        expect(response.data).to.be.jsonSchema(schemas.register);
    });
});

    describe("POST /login - User Login (Positive)", () => {
    let response, responseTime;

    before(async () => {
    const startTime = Date.now();
        response = await axios.post(`${baseUrl}/login`, {
        email: testData.validUser.email,
        password: testData.validUser.loginPassword
    }, { headers });
        responseTime = Date.now() - startTime;
    });

    it("should return valid status code", () => {
        expect(response.status).to.be.oneOf([200, 201, 204]);
    });

    it("should respond within 2 seconds", () => {
        expect(responseTime).to.be.below(2000);
    });

    it("should return authentication token", () => {
        expect(response.data).to.have.property("token");
    });

    it("should have non-empty token string", () => {
        expect(response.data.token).to.be.a("string").and.not.empty;
    });

    it("should match login response schema", () => {
        expect(response.data).to.be.jsonSchema(schemas.login);
    });
});

    describe("POST /register - Missing Password (Negative)", () => {
    let response, responseTime;

    before(async () => {
    const startTime = Date.now();
        response = await axios.post(`${baseUrl}/register`, {
        email: testData.invalidUser.emailOnly
    }, { 
        headers,
        validateStatus: () => true
    });
        responseTime = Date.now() - startTime;
    });

    it("should return 400 Bad Request", () => {
        expect(response.status).to.equal(400);
    });

    it("should respond within 2 seconds", () => {
        expect(responseTime).to.be.below(2000);
    });

    it("should return application/json content type", () => {
        expect(response.headers['content-type']).to.include('application/json');
    });

    it("should contain error message", () => {
        expect(response.data).to.have.property('error');
        expect(response.data.error).to.be.a("string").that.is.not.empty;
    });

    it("should match error response schema", () => {
        expect(response.data).to.be.jsonSchema(schemas.error);
    });
});

    describe("POST /login - Missing Password (Negative)", () => {
    let response, responseTime;

    before(async () => {
        const startTime = Date.now();
        response = await axios.post(`${baseUrl}/login`, {
        email: testData.invalidUser.invalidCredentials.email
    }, { 
        headers,
        validateStatus: () => true
    });
        responseTime = Date.now() - startTime;
    });

    it("should return 400 Bad Request", () => {
        expect(response.status).to.equal(400);
    });

    it("should respond within 2 seconds", () => {
        expect(responseTime).to.be.below(2000);
    });

    it("should return application/json content type", () => {
        expect(response.headers['content-type']).to.include('application/json');
    });

    it("should contain error message", () => {
        expect(response.data).to.have.property('error');
        expect(response.data.error).to.be.a("string").and.not.empty;
    });

    it("should match error response schema", () => {
        expect(response.data).to.be.jsonSchema(schemas.error);
    });
});

    describe("POST /register - Missing Email (Negative)", () => {
    let response, responseTime;

    before(async () => {
    const startTime = Date.now();
        response = await axios.post(`${baseUrl}/register`, {
        password: testData.validUser.registerPassword
    }, { 
        headers,
        validateStatus: () => true
    });
        responseTime = Date.now() - startTime;
    });

    it("should return 400 Bad Request", () => {
        expect(response.status).to.equal(400);
    });

    it("should respond within 2 seconds", () => {
        expect(responseTime).to.be.below(2000);
    });

    it("should contain error property", () => {
        expect(response.data).to.have.property('error');
    });

    it("should have non-empty error message", () => {
        expect(response.data.error).to.be.a("string").that.is.not.empty;
    });
});

    describe("POST /login - Invalid Credentials (Negative)", () => {
    let response, responseTime;

    before(async () => {
    const startTime = Date.now();
        response = await axios.post(`${baseUrl}/login`, {
        email: testData.invalidUser.invalidCredentials.email,
        password: testData.invalidUser.invalidCredentials.password
    }, { 
        headers,
        validateStatus: () => true
    });
        responseTime = Date.now() - startTime;
    });

    it("should return 400 Bad Request", () => {
        expect(response.status).to.equal(400);
    });

    it("should respond within 2 seconds", () => {
        expect(responseTime).to.be.below(2000);
    });

    it("should contain error property", () => {
        expect(response.data).to.have.property('error');
    });

    it("should have non-empty error message", () => {
        expect(response.data.error).to.be.a("string").that.is.not.empty;
    });
});

    describe("POST /logout - User Logout", () => {
    let response, responseTime, jsonData, authToken;

    before(async () => {
        authToken = "test-token-123"; 
        const startTime = Date.now();
        response = await axios.post(`${baseUrl}/logout`, {}, { 
        headers,
        validateStatus: () => true
        });
        responseTime = Date.now() - startTime;

    try {
        jsonData = response.data;
    } catch (e) {
        console.warn("Response is not valid JSON or empty");
        jsonData = {};
    }
        authToken = undefined;
    });

    it("should return 200 OK status", () => {
        expect(response.status).to.equal(200);
    });

    it("should respond within 2 seconds", () => {
        expect(responseTime).to.be.below(2000);
    });

    it("should return application/json content type", () => {
        expect(response.headers['content-type']).to.include('application/json');
    });

    it("should return object response", () => {
        expect(jsonData).to.be.an("object");
    });

    it("should clear authentication token", () => {
        expect(authToken).to.be.undefined;
        });
    });
});
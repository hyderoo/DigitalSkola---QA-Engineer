# DigitalSkola QA Engineer Bootcamp - Coursework

Coursework and session projects from the DigitalSkola QA Engineer bootcamp
(Batch 12), covering the core QA workflow from test planning to API test
automation and reporting.

## What is in this repo

- **Test Plan - Hafiz Hamdani.pdf** - a structured test plan document
- **API-Testing/** - Postman collection (`Hafiz_Hamdani_Batch_12.postman_collection.json`) with Allure result attachments and a generated Allure report
- **Automation-API/** - API test automation in JavaScript: Mocha + Chai (+ chai-json-schema) with Axios, covering AUTH and CRUD flows, reported with Mochawesome (`reports/test-report.html`)
- **pertemuan 9-11/** - session exercises: WebdriverIO/Mocha UI tests, Page Object Model practice against saucedemo (login and inventory pages), and visual-check screenshots
- **sesi2, sesi4** - earlier session exercises in JavaScript

## Tools used

Postman, Mocha, Chai, Axios, WebdriverIO, Selenium, Allure, Mochawesome, Ajv (JSON schema validation)

## Running the API automation

```bash
npm install
npm test        # mocha with mochawesome reporter, output in mochawesome-report/
```

The Automation-API tests follow the same pattern (`npx mocha` with the
`.mocharc.json` config in that folder).

## Notes

- This is learning coursework, kept public as a record of QA training. For
  project-grade automation, see [ShelfSeeker-e2e](https://github.com/hyderoo/ShelfSeeker-e2e).
- Generated report folders (allure-report, mochawesome-report) are kept so the
  report output can be viewed without re-running.

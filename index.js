const express = require('express');
const fs = require('fs');
const path = require('path');
const {
  Configuration,
  OpenAIApi
} = require("openai")

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const vendorRecord = "{\n  \"name\": \"students\",\n  \"nameInDb\": \"students\",\n  \"operations\": [\"Create\", \"Filter\"],\n  \"fields\": [\n    {\n      \"name\": \"studentId\",\n      \"dbColumnName\": \"student_id\",\n      \"dataType\": \"id\",\n      \"fieldType\": \"generatedPrimaryKey\",\n      \"listName\": null\n    },\n    {\n      \"name\": \"firstName\",\n      \"dbColumnName\": \"first_name\",\n      \"dataType\": \"name\",\n      \"fieldType\": \"requiredData\",\n      \"listName\": null\n    },\n    {\n      \"name\": \"lastName\",\n      \"dbColumnName\": \"last_name\",\n      \"dataType\": \"name\",\n      \"fieldType\": \"requiredData\",\n      \"listName\": null\n    },\n    {\n      \"name\": \"gender\",\n      \"dbColumnName\": \"gender\",\n      \"dataType\": \"gender\",\n      \"fieldType\": \"requiredData\",\n      \"listName\": \"gender\"\n    }\n  ]\n}";
const vendorForm = "{\"name\": \"vendors\", \"recordName\": \"vendors\", \"serveGuests\": true, \"operations\": [\"Create\", \"Filter\", \"Get\", \"Update\"], \"controls\": [{\"name\": \"vendorId\", \"label\": \"\", \"controlType\": \"hidden\"}, {\"name\": \"vendorName\", \"label\": \"Name\", \"controlType\": \"input\"}, {\"name\": \"vendorNumber\", \"label\": \"Number\", \"controlType\": \"textarea\"}, {\"name\": \"vendorGender\", \"label\": \"Gender\", \"controlType\": \"dropdown\"}"
const returnForm = "{\"name\": \"returns\", \"recordName\": \"returns\", \"serveGuests\": true, \"operations\": [\"Create\", \"Filter\", \"Get\", \"Update\"], \"controls\": [{\"name\": \"returnId\", \"label\": \"\", \"controlType\": \"hidden\"}, {\"name\": \"returnName\", \"label\": \"return_name\", \"controlType\": \"input\"}, {\"name\": \"returnNumber\", \"label\": \"return_number\", \"controlType\": \"input\"}";
const returnRecord = "{\n    \"name\": \"returns\",\n    \"nameInDb\": \"returns\",\n    \"operations\": [\"Create\", \"Filter\",\"Get\",\"Update\"],\n    \"fields\": [{\n        \"name\": \"returnId\",\n        \"dbColumnName\": \"return_id\",\n        \"dataType\": \"id\",\n        \"fieldType\": \"generatedPrimaryKey\",\n        \"listName\": null\n    }, {\n        \"name\": \"returnName\",\n        \"dbColumnName\": \"return_name\",\n        \"dataType\": \"name\",\n        \"fieldType\": \"requiredData\",\n        \"listName\": null\n    }, {\n        \"name\": \"returnNumber\",\n        \"dbColumnName\": \"return_number\",\n        \"dataType\": \"integer\",\n        \"fieldType\": \"requiredData\",\n        \"listName\": null\n    }]\n}"
const vendorEdit = "{\n    \"pageName\": \"vendorEdit\",\n    \"componentForm\": \"vendors\",\n    \"templateType\": \"EditTemplate\",\n    \"pageSelector\": \"app-vendor-edit\",\n    \"pageRoute\": \"vendor-edit\",\n    \"navMenuName\": \"\",\n    \"isSavePage\": true,\n    \"editRoute\": \"\",\n    \"routeTo\": [{\n        \"name\": \"Save\",\n        \"route\": \"vendorList\"\n    }, {\n        \"name\": \"Cancel\",\n        \"route\": \"vendorList\"\n    }]\n}"
const vendorList = "{\n    \"pageName\": \"vendorList\",\n    \"componentForm\": \"vendors\",\n    \"templateType\": \"tableTemplate\",\n    \"pageSelector\": \"app-vendor-list\",\n    \"pageRoute\": \"vendor-list\",\n    \"navMenuName\": \"Vendors\",\n    \"isSavePage\": \"\",\n    \"editRoute\": \"vendorEdit\",\n    \"routeTo\": [{\n        \"name\": \"Add New record\",\n        \"route\": \"vendorEntry\"\n    }]\n}"
const vendorEntry = "{\n    \"pageName\": \"vendorEntry\",\n    \"componentForm\": \"vendors\",\n    \"templateType\": \"EntryPage\",\n    \"pageSelector\": \"app-vendor-entry\",\n    \"pageRoute\": \"vendor-entry\",\n    \"navMenuName\": \"\",\n    \"isSavePage\": \"\",\n    \"editRoute\": \"\",\n    \"routeTo\": [{\n        \"name\": \"Save Record\",\n        \"route\": \"vendorList\"\n    }, {\n        \"name\": \"Navigate Back\",\n        \"route\": \"vendorList\"\n    }]\n}"
const returnEntry = "{\n    \"pageName\": \"returnEntry\",\n    \"componentForm\": \"returns\",\n    \"templateType\": \"EntryPage\",\n    \"pageSelector\": \"app-return-entry\",\n    \"pageRoute\": \"return-entry\",\n    \"navMenuName\": \"\",\n    \"isSavePage\": \"\",\n    \"editRoute\": \"\",\n    \"routeTo\": [{\n        \"name\": \"Save Record\",\n        \"route\": \"returnList\"\n    }, {\n        \"name\": \"Navigate Back\",\n        \"route\": \"returnList\"\n    }]\n}"
const returnList = "{\n    \"pageName\": \"returnList\",\n    \"componentForm\": \"returns\",\n    \"templateType\": \"tableTemplate\",\n    \"pageSelector\": \"app-return-list\",\n    \"pageRoute\": \"return-list\",\n    \"navMenuName\": \"returns\",\n    \"isSavePage\": \"\",\n    \"editRoute\": \"returnEdit\",\n    \"routeTo\": [{\n        \"name\": \"Add New record\",\n        \"route\": \"returnEntry\"\n    }]\n}"
const returnEdit = "{\n    \"pageName\": \"returnEdit\",\n    \"componentForm\": \"return\",\n    \"templateType\": \"EditTemplate\",\n    \"pageSelector\": \"app-return-edit\",\n    \"pageRoute\": \"return-edit\",\n    \"navMenuName\": \"\",\n    \"isSavePage\": true,\n    \"editRoute\": \"\",\n    \"routeTo\": [{\n        \"name\": \"Save\",\n        \"route\": \"returnList\"\n    }, {\n        \"name\": \"Cancel\",\n        \"route\": \"returnList\"\n    }]\n}"
const openai = new OpenAIApi(config)
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/json-files', (req, res) => {
  const folderPath = req.query.folderPath;
  if (!folderPath) {
    res.status(400).send('Missing folderPath query parameter');
    return;
  }

  const allowedSuffixes = ['page', 'template', 'rec', 'frm'];
  const jsonObjectsBySuffix = {
    form: [],
    page: [],
    template: [],
    record: [],
    application: []
  };

  const readJSONFiles = (folderPath) => {
    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = path.join(folderPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        readJSONFiles(filePath);
      } else {
        if (path.basename(file) === "application.json") {
          const fileContents = fs.readFileSync(filePath, 'utf8');
          const jsonObject = JSON.parse(fileContents);
          jsonObjectsBySuffix.application.push(jsonObject);
        }
        const suffix = path.basename(file).split('.')[1];
        if (allowedSuffixes.includes(suffix)) {
          const fileContents = fs.readFileSync(filePath, 'utf8');
          const jsonObject = JSON.parse(fileContents);
          if (suffix === 'frm') {
            jsonObjectsBySuffix.form.push(jsonObject);
          } else if (suffix === 'page') {
            jsonObjectsBySuffix.page.push(jsonObject);
          } else if (suffix === 'template') {
            jsonObjectsBySuffix.template.push(jsonObject);
          } else if (suffix === 'rec') {
            jsonObjectsBySuffix.record.push(jsonObject);
          }
        }
      }
    });
  };

  readJSONFiles(folderPath);

  res.json(jsonObjectsBySuffix);
});


app.get('/download-files', (req, res) => {
  const {
    fileName,
    fileContent,
    folderName
  } = req.query;

  // Create the folder if it doesn't exist
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }

  // Create the file path
  const filePath = path.join(folderName, `${fileName}.json`);

  // Write the file
  fs.writeFile(filePath, fileContent, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error writing file');
    } else {
      res.download(filePath);
    }
  });
});

app.get('/openai-form', async (req, res) => {
  const formName = req.query.formName;
  const messages = [{
    "role": "user",
    "content": " the metadev form for vendors is "+vendorForm+" and the metadev record for vendor is" + vendorRecord+". the metadev form for returns"+ returnForm +" and the metadev returns record is" + returnRecord +". Now for the form" +formName+ " I want you to give me the metadev record and form. the metadev entry page json for the form" + vendorForm +   "+vendorEntry and the metadev edit page json for vendor is" + vendorEdit+" and the metadev list page json fo vendor is" + vendorList +". the metadev entry page json for returns"+ returnEntry +" and the metadev returns edit json is" + returnEdit + " and the metadev return list page json is"+ returnList +". Now for the form" +formName+ " I want you to give me the metadev entry, edit and list jsons. you need to respond with one and only one json contaning the generated metadev entry, edit list page jsons with keys as entry, edit and list. you need to respond with one and only one json contaning the generated metadev form and record with keys as form and record. Only respond with code as plain text without code block syntax around it. Your response should and must be only one json. your response should be parsable into a json"
  }];
  const responseForm = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 2048,
    temperature: 1
  });

  console.log(responseForm.data.choices[0].message.content)
  res.json(JSON.parse(responseForm.data.choices[0].message.content))
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
import { join } from 'path';
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'fs';
import _ from 'lodash';
import inquirer from 'inquirer';
import chalk from 'chalk';


export default function(api, options = { exclude: [] }) {
  const { paths } = api;
  const { exclude } = options;

  const pagesLocation = join(paths.absSrcPath, 'pages');
  const templateLocation = join(__dirname, 'templates');

  api.registerCommand('module-gen', {
    hide: true
  }, args => {

    const MODULE_LOCATION_REG = /^(\/[a-z]+[a-z\-]*)+$/;
    const MODEL_NAME_REG = /^[a-z]+[a-z\-]*$/;
    const SERVICE_NAME_REG = /^[a-z]+[a-z\-]*$/;

    inquirer
      .prompt([
        { name: 'path', type: 'input', message: 'location of module:', validate: (answer) => {
          if (MODULE_LOCATION_REG.test(answer)) {
            return true;
          } else {
            return 'location should be start with \'/\' , and only lowercase alphabet and \'-\' was allowed in directory name' +
              '(e.g. /authority/resource-mgnt)';
          }

          } },
        { name: 'localeList', type: 'checkbox', message: 'select locale message:', choices: [
            { name: 'zh-CN', value: 'zh-CN', checked: true}, { name: 'en-US', value: 'en-US'}
          ]},
        { name: 'modelName', type: 'input', message: 'model name :', validate: (answer) => {
            if (!answer) {
              return true;
            }
            if (MODEL_NAME_REG.test(answer)) {
              return true;
            } else {
              return 'model name should be composed of lowercase alphabet and \'-\' ' +
                '(e.g. resource)';
            }

          } },
        { name: 'serviceName', type: 'input', message: 'service name :', validate: (answer) => {
            if (!answer) {
              return true;
            }
            if (SERVICE_NAME_REG.test(answer)) {
              return true;
            } else {
              return 'service name should be composed of lowercase alphabet and \'-\' ' +
                '(e.g. resource)';
            }

          } },
      ])
      .then(answers => {
        const { path, localeList, modelName, serviceName } = answers;

        // check module existence
        const modulePath = join(pagesLocation, path);
        if (existsSync(modulePath)) {
          makeErrorResponse('path exists: ' + modulePath);
          return;
        }

        // create module directory
        const pathSegs = path.substring(1).split("/");
        let pathPrefix = pagesLocation;
        pathSegs.forEach(seg => {
          if (!existsSync(join(pathPrefix, seg))) {
            mkdirSync(join(pathPrefix, seg));
          }
          pathPrefix = join(pathPrefix, seg);
        });

        // create index.js
        const indexTplt = readFileSync(join(templateLocation, 'index.js.tplt'), 'UTF-8');
        writeFileSync(join(modulePath, 'index.js'), indexTplt);

        // create module.config.js
        const moduleConfigTplt = readFileSync(join(templateLocation, 'module.config.js.tplt'), 'UTF-8');
        writeFileSync(join(modulePath, 'module.config.js'), moduleConfigTplt);

        // create style.less
        writeFileSync(join(modulePath, 'style.less'), '');

        // create module locale message
        if (!_.isEmpty(localeList)) {
          const localeTplt = readFileSync(join(templateLocation, 'module.locale.js.tplt'), 'UTF-8');
          localeList.forEach(locale => {
            writeFileSync(join(modulePath, `module.locale.${locale}.js`), localeTplt);
          });
        }

        // create model
        if (modelName) {
          mkdirSync(join(modulePath, 'models'));
          const modelTplt = readFileSync(join(templateLocation, 'model.js.tplt'), 'UTF-8');
          writeFileSync(join(modulePath, `models/${modelName}.model.js`), modelTplt);
        }

        // create service
        if (serviceName) {
          mkdirSync(join(modulePath, 'services'));
          const serviceTplt = readFileSync(join(templateLocation, 'service.js.tplt'), 'UTF-8');
          writeFileSync(join(modulePath, `services/${serviceName}.service.js`), serviceTplt);
        }


        makeSucessResponse();

      });
  });

}



function makeErrorResponse(message) {
  console.log();
  console.log(chalk.red.bold.inverse(' FAILED '));
  console.log(chalk.red(message));

}

function makeSucessResponse() {
  console.log();
  console.log(chalk.green.bold.inverse(' SUCCESS '));
}

function handleTemplate(content, data) {
  let result = content;
  Object.keys(data).forEach(key => {
    result = result.replace('${' + key + '}', data[key]);
  });
  return result;
}

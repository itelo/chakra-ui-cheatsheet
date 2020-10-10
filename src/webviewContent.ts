import * as R from "ramda";

const fetch = require("node-fetch");
const html2json = require("html2json").html2json;
const json2html = require("html2json").json2html;

const getPage = async (component: string) => {
  const response = await fetch(`https://chakra-ui.com/${component}`);
  const pageHTML = (await response.text()).replace("<!DOCTYPE html>", "");
  const pageJSON = html2json(pageHTML);

  const head = pageJSON.child[0].child[0];
  const body = pageJSON.child[0].child[1];

  const bodyScripts = R.filter(R.propEq("tag", "script"))(body.child);
  const flat = R.flatten(deepSearchElement("tag", "main", body));
  const main = R.filter(R.pipe(R.isNil, R.not))(flat)[0];

  const indexOfProps = deepSearchElementIndex("attr.id", "props", main);
  const propsUntilEndOfPage = main.child.slice(indexOfProps, main.child.length);

  return createPage(head, propsUntilEndOfPage, bodyScripts);
};

const deepSearchElementBy = (findOrFindIndex: any) => (
  prop: string,
  value: string,
  root: any
): any => {
  if (!root.child) {
    return null;
  }
  const t = findOrFindIndex(R.pathEq(prop.split("."), value))(root.child);

  if (!t) {
    const reccur = deepSearchElementBy(findOrFindIndex);
    return R.map(R.curryN(3, reccur)(prop, value))(root.child);
  } else {
    return t;
  }
};

const deepSearchElement = deepSearchElementBy(R.find);
const deepSearchElementIndex = deepSearchElementBy(R.findIndex);

const createPage = (head: any, main: any, bodyScripts: any) => {
  return `${json2html(head)}${json2html({
    node: "element",
    child: main,
    tag: "main",
  })}${json2html({
    node: "element",
    child: bodyScripts,
    tag: "body",
  })}`;
};

export function getWebviewContent(component: string) {
  return getPage(component);
}

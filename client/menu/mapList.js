const mapContext = require.context('../../models/maps', false, /\.blend$/);
const mapKeys = mapContext.keys();
const mapList = mapKeys.map((x) => x.substring(2, x.length - 6));
console.log(mapList);
export default mapList;

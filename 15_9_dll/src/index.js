import $ from 'jquery'

// 测试jquery是否被打包
// 如果被打包，那么体积会超过80KB
// 如果体积很小，那么说明没有被打包
console.log($)
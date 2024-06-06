## golang+vue+webpack demo

### 说明
本项目是后端使用golang语言，前端使用vue3框架，并使用webpack5进行打包，然后交给golang进行渲染的例子。  
虽然现在比较流行前后端分离，而且SEO等也有解决方案，但是我认为这些方案增加了复杂度，降低了效率，而且后端渲染还是有很多地方需要的。  
根据实际项目，只做了本demo。  
不是用vite而是使用webpack的原因是：当模版中存在`src`等属性需要后端渲染的内容时（如`{%.Url%}`），vite会报错，因为vite会尝试将所有`src`等属性中的资源进行处理，而我没找到解决办法，且不是很喜欢vite的目录结构，且觉得vite在自定义方面比webpack差很多。  
使用方法：  
```shell
#第一个终端运行webpack并进行监听
cd template
pnpm i
pnpm dev
```
```shell
#第二个终端运行golang
go mod download
go run ./go
```
webpack设置了--watch源文件有改动时会自动编译，而golang使用了gin框架，在默认的debug模式下，模版有修改会自动重新加载，所以直接修改`template/src`下的模板文件后，在浏览器中刷新即可查看修改后的效果。
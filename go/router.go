package main

import "github.com/gin-gonic/gin"

func SetupRouter() (r *gin.Engine) {
	r = gin.New()
	//定义模板文件中变量的标识符，默认为{{和}}，因为vue、angular等都用这个，不做修改就会将vue、angular等的变量也解析，导致出错，所以必须区分，这里是用{%和%}
	r.Delims(`{%`, `%}`)

	//装载模板文件
	loadHTMLGlob(r)
	//设置静态文件的路由
	setupStatic(r)
	//开始设置路由，使用一个空的group方法的原因是防止静态资源等其他路由应用这里的中间件
	setupRouter(r.Group(``))
	return
}

func loadHTMLGlob(r *gin.Engine) {
	r.LoadHTMLGlob("template/dist/template/**/*.html")
}

func setupStatic(r *gin.Engine) {
	r.Static("/static", "template/dist/static")
}

func setupRouter(r *gin.RouterGroup) {
	r.GET("/", Index)
}

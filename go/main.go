package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

var (
	router *gin.Engine
	server *http.Server
)

func init() {
	//设置路由
	router = SetupRouter()
}

func main() {
	//开始监听（监听一般为":port"以便监听所有本地地址）
	server = &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	//开始监听（监听一般为":port"以便监听所有本地地址）
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {

		}
	}()

	select {}
}

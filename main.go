package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	app := App{}

	engine := gin.Default()
	engine.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowHeaders: []string{
			"Authorization",
			"Content-Type",
		},
		AllowMethods: []string{http.MethodDelete, http.MethodGet},
	}))

	engine.StaticFile("/", "./assets/index.html")

	api := engine.Group("api/")
	{
		api.GET("index", app.ListDir)
		api.DELETE("remove", app.DeleteItem)
	}

	if err := http.ListenAndServe(":8080", engine); err != nil {
		panic(err)
	}
}

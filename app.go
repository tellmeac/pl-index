package main

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

type IndexResponse struct {
	Path    string `json:"path"`
	Content []Item `json:"content"`
}

type Item struct {
	Name    string `json:"name"`
	AbsPath string `json:"absPath"`
	IsDir   bool   `json:"isDir"`
}

func ListDir(ctx *gin.Context) {
	path := ctx.Query("path")
	if path == "" {
		path = "/"
	}

	entries, err := os.ReadDir(path)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"msg": err.Error(),
		})
		return
	}

	indexResponse := IndexResponse{
		Path:    path,
		Content: make([]Item, len(entries)),
	}

	for i, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			log.Print(err)
			continue
		}

		indexResponse.Content[i] = Item{
			Name:    entry.Name(),
			IsDir:   info.IsDir(),
			AbsPath: filepath.Join(path, entry.Name()),
		}
	}

	ctx.JSON(http.StatusOK, indexResponse)
}

func DeleteItem(ctx *gin.Context) {
	path := ctx.Query("path")
	if path == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"msg": "path is not provided as a query value",
		})
		return
	}

	err := os.Remove(path)
	if err != nil {
		log.Print(err)
		ctx.Status(http.StatusInternalServerError)
		return
	}

	ctx.Status(http.StatusOK)
}

package main

import (
	"fmt"
	"strings"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/sessions"
	"github.com/jinzhu/gorm"
	"github.com/labstack/echo"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/middleware"
	"github.com/shanepm/plugin-api/controllers/api"
	"github.com/shanepm/plugin-api/middleware/initdb"
	dbModels "github.com/shanepm/plugin-api/models/db"
)

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(session.Middleware(sessions.NewCookieStore([]byte("u81h2ij3l;1,'23;'ll!231u98@"))))
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://plugin.ovh:8135", "http://1.plugin.ovh:4040"},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		AllowCredentials: true,
	}))

	db, err := gorm.Open("mysql", "pluginuser:mari4db@tcp(:3306)/plugindb")
	if err != nil {
		fmt.Println("Error: Failed to establish database connection.")
		return
	}
	defer db.Close()
	db.LogMode(true)

	db.AutoMigrate(&dbModels.User{}, &dbModels.Plugin{}, &dbModels.Site{})
	e.Use(initdb.InitDbHandler(db))

	api.Route(e)
	e.GET("*", handlePluginRoutes)
	e.Logger.Fatal(e.Start(":4040"))
}

func handlePluginRoutes(c echo.Context) error {
	r := c.Request()
	pluginEndIdx := strings.IndexByte(r.Host, '.')
	if pluginEndIdx == -1 {
		return echo.ErrNotFound
	}
	plugin := r.Host[:pluginEndIdx]
	return c.File("plugins/" + plugin + r.URL.Path)
}
